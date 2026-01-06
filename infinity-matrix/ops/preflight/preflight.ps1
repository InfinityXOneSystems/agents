# Main Preflight Entry
param(
    [string]$mode = "offline",
    [switch]$changedOnly,
    [string]$format = "both",
    [string]$outDir = "./artifacts/preflight/",
    [string]$failOn = "warn"
)
Import-Module "$PSScriptRoot/modules/Core.psm1" -Force
Import-Module "$PSScriptRoot/modules/GateRunner.psm1" -Force
$Config = Import-Yaml "$PSScriptRoot/preflight.config.yaml"
$Gates = $Config.gates
$Start = Get-Date
$Results = @()
foreach ($Gate in $Gates) {
    $Result = Invoke-Gate $Gate $mode $changedOnly
    $Results += $Result
}
$Verdict = Get-ReleaseVerdict $Results $failOn
Write-PreflightReport $Results $Verdict $format $outDir
$Elapsed = (Get-Date) - $Start
Write-Host "Release Verdict: $Verdict in $($Elapsed.TotalSeconds)s"
exit (Get-ExitCode $Verdict)
