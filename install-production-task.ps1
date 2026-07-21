[CmdletBinding()]
param(
    [string]$TaskName = "XIPHIAS Immigration Website Production",
    [int]$Port = 3000,
    [switch]$StartNow
)

$ErrorActionPreference = "Stop"
$projectRoot = $PSScriptRoot
$watchdogPath = Join-Path $projectRoot "run-production.ps1"

$currentIdentity = [Security.Principal.WindowsIdentity]::GetCurrent()
$currentPrincipal = [Security.Principal.WindowsPrincipal]::new($currentIdentity)
if (-not $currentPrincipal.IsInRole(
        [Security.Principal.WindowsBuiltInRole]::Administrator)) {
    throw "Run this installer as Administrator."
}

if (-not (Test-Path -LiteralPath $watchdogPath)) {
    throw "Missing watchdog script: $watchdogPath"
}

$arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$watchdogPath`" -Port $Port"
$action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument $arguments `
    -WorkingDirectory $projectRoot
$trigger = New-ScheduledTaskTrigger -AtStartup
$principal = New-ScheduledTaskPrincipal `
    -UserId "SYSTEM" `
    -LogonType ServiceAccount `
    -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet `
    -RestartCount 999 `
    -RestartInterval (New-TimeSpan -Minutes 1) `
    -ExecutionTimeLimit ([TimeSpan]::Zero) `
    -StartWhenAvailable `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries

$task = New-ScheduledTask `
    -Action $action `
    -Trigger $trigger `
    -Principal $principal `
    -Settings $settings `
    -Description "Keeps the XIPHIAS Immigration Next.js production website running on port $Port."

Register-ScheduledTask -TaskName $TaskName -InputObject $task -Force | Out-Null
Write-Host "Installed Windows startup task: $TaskName" -ForegroundColor Green

if ($StartNow) {
    $listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
        Select-Object -First 1
    if ($listener) {
        Write-Host "Port $Port is already running. The task will take over after the next deployment or server restart." -ForegroundColor Yellow
    }
    else {
        Start-ScheduledTask -TaskName $TaskName
        Write-Host "The production task has been started." -ForegroundColor Green
    }
}
