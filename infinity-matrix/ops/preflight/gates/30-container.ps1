param($Mode, $ChangedOnly)
Import-Module "$PSScriptRoot/../modules/Detect.psm1" -Force
$status = 'PASS'
$summary = ''
if (Detect-Docker) {
  try { docker build -t preflight-test . } catch { $status = 'FAIL'; $summary += $_.Exception.Message }
  try { syft . -o json > sbom.json } catch { $status = 'WARN'; $summary += 'syft not found for SBOM.\n' }
}
return @{status=$status; details=@{summary=$summary}}
