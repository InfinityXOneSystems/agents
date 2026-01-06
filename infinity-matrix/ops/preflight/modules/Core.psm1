function Write-Log { param($msg) Write-Host "[Preflight] $msg" }
function Start-Timer { return [System.Diagnostics.Stopwatch]::StartNew() }
function Stop-Timer { param($sw) $sw.Stop(); return $sw.Elapsed.TotalSeconds }
function Write-PreflightReport {
  param($Results, $Verdict, $Format, $OutDir)
  $md = "# Preflight Summary`n" + ($Results | ForEach-Object { "## $($_.gate) - $($_.status)`n$($_.details.summary)`n" }) + "`n**Release Verdict:** $Verdict"
  $json = $Results | ConvertTo-Json -Depth 5
  if ($Format -eq "md" -or $Format -eq "both") { $md | Out-File "$OutDir/summary.md" }
  if ($Format -eq "json" -or $Format -eq "both") { $json | Out-File "$OutDir/report.json" }
}
function Get-ExitCode { param($Verdict) switch ($Verdict) { "PASS" {0} "FAIL" {1} "WARN" {2} default {1} } }
