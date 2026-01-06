param($Mode, $ChangedOnly)
$status = 'PASS'
$summary = ''
if (!(Test-Path docs/ops/runbook.md)) { $status = 'WARN'; $summary += 'Runbook missing.\n' }
if (!(Test-Path docs/ops/dashboard.md)) { $status = 'WARN'; $summary += 'Dashboard manifest missing.\n' }
return @{status=$status; details=@{summary=$summary}}
