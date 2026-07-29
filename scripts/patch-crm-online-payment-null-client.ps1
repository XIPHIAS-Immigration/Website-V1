param(
    [Parameter(Mandatory = $true)]
    [string] $AssemblyPath,

    [Parameter(Mandatory = $true)]
    [string] $CecilPath
)

$ErrorActionPreference = "Stop"

[void][Reflection.Assembly]::LoadFrom((Resolve-Path -LiteralPath $CecilPath).Path)

$resolvedAssembly = (Resolve-Path -LiteralPath $AssemblyPath).Path
$temporaryPath = "$resolvedAssembly.online-payment-nullable"
$backupPath = "$resolvedAssembly.before-online-payment-nullable-$([DateTime]::UtcNow.ToString('yyyyMMddHHmmss')).bak"

$assembly = [Mono.Cecil.AssemblyDefinition]::ReadAssembly($resolvedAssembly)
try {
    $model = $assembly.MainModule.GetType("XIPHIAS.ViewModels.PaymentGatewayConfirm")
    if (-not $model) {
        throw "PaymentGatewayConfirm was not found."
    }

    $property = $model.Properties |
        Where-Object { $_.Name -eq "CLIENT_ID" } |
        Select-Object -First 1
    $field = $model.Fields |
        Where-Object { $_.Name -eq "<CLIENT_ID>k__BackingField" } |
        Select-Object -First 1

    if (-not $property -or -not $field -or -not $property.GetMethod -or -not $property.SetMethod) {
        throw "The CLIENT_ID auto-property structure was not found."
    }

    if ($property.PropertyType.FullName -eq 'System.Nullable`1<System.Int64>') {
        throw "CLIENT_ID is already nullable."
    }
    if ($property.PropertyType.FullName -ne "System.Int64") {
        throw "Unexpected CLIENT_ID type: $($property.PropertyType.FullName)"
    }

    $nullableType = $assembly.MainModule.ImportReference([Nullable[long]])

    $field.FieldType = $nullableType
    $property.PropertyType = $nullableType
    $property.GetMethod.ReturnType = $nullableType
    $property.SetMethod.Parameters[0].ParameterType = $nullableType

    $assembly.Write($temporaryPath)
}
finally {
    $assembly.Dispose()
}

$verification = [Mono.Cecil.AssemblyDefinition]::ReadAssembly($temporaryPath)
try {
    $verifiedModel = $verification.MainModule.GetType(
        "XIPHIAS.ViewModels.PaymentGatewayConfirm"
    )
    $verifiedProperty = $verifiedModel.Properties |
        Where-Object { $_.Name -eq "CLIENT_ID" } |
        Select-Object -First 1

    if ($verifiedProperty.PropertyType.FullName -ne 'System.Nullable`1<System.Int64>') {
        throw "Verification failed: CLIENT_ID is not nullable."
    }
}
finally {
    $verification.Dispose()
}

Copy-Item -LiteralPath $resolvedAssembly -Destination $backupPath
Move-Item -LiteralPath $temporaryPath -Destination $resolvedAssembly -Force

Write-Output "Updated: $resolvedAssembly"
Write-Output "Backup: $backupPath"
