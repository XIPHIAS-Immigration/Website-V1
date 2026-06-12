param(
  [int]$Port = 4100,
  [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$runtimeDir = Join-Path $root ".xiphias-platform\prod-smoke"
New-Item -ItemType Directory -Force $runtimeDir | Out-Null

if (-not $env:CONTENT_ADMIN_USERNAME) { $env:CONTENT_ADMIN_USERNAME = "smoke_admin" }
if (-not $env:CONTENT_ADMIN_PASSWORD) { $env:CONTENT_ADMIN_PASSWORD = "smoke_password_123" }
if (-not $env:CONTENT_ADMIN_SECRET) { $env:CONTENT_ADMIN_SECRET = "smoke_secret_change_me" }

$env:CONTENT_ADMIN_DATA_DIR = Join-Path $runtimeDir "content-admin"
$env:CONTENT_ADMIN_INSECURE_COOKIES = "true"
$env:XIPHIAS_PLATFORM_STORAGE = "file"
$env:XIPHIAS_PLATFORM_STORE_PATH = Join-Path $runtimeDir "platform-store.json"
$env:XIPHIAS_ANALYTICS_STORE_PATH = Join-Path $runtimeDir "visitor-analytics.jsonl"

if (-not $SkipBuild) {
  Write-Host "Building production app..."
  npm run build
  if ($LASTEXITCODE -ne 0) {
    throw "Production build failed. Fix the build before running the CMS smoke test."
  }
}

$existing = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
if ($existing) {
  throw "Port $Port is already in use. Stop that process or choose another port with -Port."
}

$out = Join-Path $runtimeDir "next-start.out.log"
$err = Join-Path $runtimeDir "next-start.err.log"
$nodePath = (Get-Command node.exe -ErrorAction Stop).Source
$nextBin = Join-Path $root "node_modules\next\dist\bin\next"
if (-not (Test-Path -LiteralPath $nextBin)) {
  throw "Next.js CLI not found at $nextBin. Run npm install first."
}

Set-Content -LiteralPath $out -Value ""
Set-Content -LiteralPath $err -Value ""

$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = $nodePath
$psi.Arguments = """$nextBin"" start -p $Port"
$psi.WorkingDirectory = $root
$psi.UseShellExecute = $false
$psi.CreateNoWindow = $true
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError = $true
$server = New-Object System.Diagnostics.Process
$server.StartInfo = $psi
[void]$server.Start()

try {
  $baseUrl = "http://localhost:$Port"
  Write-Host "Waiting for $baseUrl ..."
  $ready = $false
  for ($i = 0; $i -lt 30; $i++) {
    try {
      $response = Invoke-WebRequest -Uri "$baseUrl/content-admin" -UseBasicParsing -TimeoutSec 3
      if ($response.StatusCode -eq 200) { $ready = $true; break }
    } catch {
      Start-Sleep -Seconds 1
    }
  }
  if (-not $ready) { throw "Production server did not become ready. See $out and $err" }

  $loginPayload = @{ username = $env:CONTENT_ADMIN_USERNAME; password = $env:CONTENT_ADMIN_PASSWORD } | ConvertTo-Json -Compress
  $session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
  Invoke-RestMethod -Uri "$baseUrl/api/content-admin/login" -Method Post -WebSession $session -ContentType "application/json" -Body $loginPayload | Out-Null
  $adminCookie = $session.Cookies.GetCookies([Uri]$baseUrl)["xiphias_content_admin"].Value
  if (-not $adminCookie) { throw "Content admin login did not return a session cookie." }
  $cookieHeader = "xiphias_content_admin=$adminCookie"

  $pngPath = Join-Path $runtimeDir "smoke-image.png"
  [IO.File]::WriteAllBytes($pngPath, [Convert]::FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII="))

  Write-Host "Uploading runtime CMS image..."
  $uploadJson = & curl.exe --max-time 15 --fail-with-body -sS -H "Cookie: $cookieHeader" -F "kind=blog" -F "file=@$pngPath;type=image/png" "$baseUrl/api/content-admin/upload"
  if ($LASTEXITCODE -ne 0) {
    throw "Image upload request failed or timed out. curl exit code: $LASTEXITCODE"
  }
  $upload = $uploadJson | ConvertFrom-Json
  if (-not $upload.ok) { throw "Image upload failed: $uploadJson" }

  $slug = "prod-smoke-cms-$([DateTimeOffset]::UtcNow.ToUnixTimeSeconds())"
  $savePayload = @{
    kind = "blog"
    title = "Production CMS Smoke Test"
    slug = $slug
    summary = "Production CMS smoke test for runtime blog saving and image serving."
    body = "Production CMS smoke test`n`nThis post proves that next build plus next start can save and read runtime CMS content without rebuilding."
    author = "XIPHIAS Immigration"
    hero = $upload.image.url
    heroAlt = "Production CMS smoke image"
    visibility = "public"
    tags = @("cms", "smoke-test")
  } | ConvertTo-Json -Depth 6 -Compress

  Write-Host "Saving runtime CMS post..."
  $save = Invoke-RestMethod -Uri "$baseUrl/api/content-admin/posts" -Method Post -WebSession $session -ContentType "application/json" -Body $savePayload -TimeoutSec 15
  if (-not $save.ok) { throw "Content save failed." }

  Write-Host "Checking public blog page and uploaded image..."
  $blog = Invoke-WebRequest -Uri "$baseUrl/blog/$slug" -UseBasicParsing -TimeoutSec 10
  $image = Invoke-WebRequest -Uri "$baseUrl$($upload.image.url)" -UseBasicParsing -TimeoutSec 10

  Write-Host "CMS production smoke test passed."
  Write-Host "Post:  $baseUrl/blog/$slug"
  Write-Host "Image: $baseUrl$($upload.image.url) ($($image.StatusCode))"
} finally {
  if ($server -and -not $server.HasExited) {
    Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue
    $server.WaitForExit(5000) | Out-Null
  }
  if ($server) {
    try { Add-Content -LiteralPath $out -Value $server.StandardOutput.ReadToEnd() } catch {}
    try { Add-Content -LiteralPath $err -Value $server.StandardError.ReadToEnd() } catch {}
  }
  $portProcesses = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique
  foreach ($processId in $portProcesses) {
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
  }
}
