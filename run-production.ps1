[CmdletBinding()]
param(
    [int]$Port = 3000
)

# Long-running watchdog used by the Windows Scheduled Task. If Next.js exits
# because of a crash, it is restarted after a short delay.
$ErrorActionPreference = "Continue"
$projectRoot = $PSScriptRoot
$logPath = Join-Path $projectRoot "production-server.log"
$maxLogBytes = 10MB

Set-Location -LiteralPath $projectRoot
$env:NODE_ENV = "production"
$env:PORT = $Port.ToString()

while ($true) {
    try {
        if ((Test-Path -LiteralPath $logPath) -and
            (Get-Item -LiteralPath $logPath).Length -gt $maxLogBytes) {
            Move-Item -LiteralPath $logPath -Destination "$logPath.previous" -Force
        }

        $startedAt = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Add-Content -LiteralPath $logPath -Value "[$startedAt] Starting Next.js on port $Port"

        & npm.cmd run start 2>&1 |
            ForEach-Object {
                $line = $_.ToString()
                Add-Content -LiteralPath $logPath -Value $line
            }

        $exitCode = $LASTEXITCODE
        $stoppedAt = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Add-Content -LiteralPath $logPath -Value "[$stoppedAt] Next.js exited with code $exitCode; restarting in 5 seconds"
    }
    catch {
        $failedAt = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Add-Content -LiteralPath $logPath -Value "[$failedAt] Watchdog error: $($_.Exception.Message)"
    }

    Start-Sleep -Seconds 5
}
