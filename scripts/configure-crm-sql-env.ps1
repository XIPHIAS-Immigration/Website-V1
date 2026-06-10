param(
  [string]$HostName = "localhost",
  [int]$Port = 14333,
  [string]$User = "sa",
  [string]$Password = $env:XIPHIAS_SQL_SA_PASSWORD,
  [string]$IndiaDatabase = "immigration_com",
  [string]$DubaiDatabase = "dubai_crm"
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($Password)) {
  throw "XIPHIAS_SQL_SA_PASSWORD is not set in this PowerShell session. Set it first, then rerun this script."
}

$root = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $root ".env.local"

if (Test-Path -LiteralPath $envPath) {
  $lines = [System.Collections.Generic.List[string]]::new()
  Get-Content -LiteralPath $envPath | ForEach-Object { [void]$lines.Add($_) }
} else {
  $lines = [System.Collections.Generic.List[string]]::new()
}

function Set-EnvLine {
  param(
    [string]$Name,
    [string]$Value
  )

  $escaped = $Value.Replace('"', '\"')
  $line = "$Name=`"$escaped`""
  for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "^\s*$([regex]::Escape($Name))=") {
      $lines[$i] = $line
      return
    }
  }
  [void]$lines.Add($line)
}

Set-EnvLine "XIPHIAS_CRM_SQL_HOST" $HostName
Set-EnvLine "XIPHIAS_CRM_SQL_PORT" ([string]$Port)
Set-EnvLine "XIPHIAS_CRM_SQL_USER" $User
Set-EnvLine "XIPHIAS_CRM_SQL_PASSWORD" $Password
Set-EnvLine "XIPHIAS_CRM_SQL_ENCRYPT" "true"
Set-EnvLine "XIPHIAS_CRM_SQL_TRUST_SERVER_CERTIFICATE" "true"
Set-EnvLine "XIPHIAS_CRM_INDIA_DATABASE" $IndiaDatabase
Set-EnvLine "XIPHIAS_CRM_DUBAI_DATABASE" $DubaiDatabase

Set-Content -LiteralPath $envPath -Value $lines -Encoding UTF8
Write-Output "Updated .env.local with local CRM SQL Server settings. Password was written but not printed."
