param($Mode, $ChangedOnly)
Import-Module "$PSScriptRoot/../modules/Detect.psm1" -Force
$status = 'PASS'
$summary = ''
if (Detect-Node) {
  try { npm ci; npm run lint; npm run typecheck; npm test } catch { $status = 'FAIL'; $summary += $_.Exception.Message }
}
if (Detect-Python) {
  try { python -m venv .venv; .venv/Scripts/pip install -r requirements.txt; .venv/Scripts/pytest } catch { $status = 'FAIL'; $summary += $_.Exception.Message }
}
return @{status=$status; details=@{summary=$summary}}
