param($Mode, $ChangedOnly)
$status = 'PASS'
$summary = ''
# Validate routes and onboarding config
if (!(Test-Path frontend/src/router/index.js)) { $status = 'FAIL'; $summary += 'Router config missing.\n' }
if (!(Test-Path ops/manifests/frontend.yaml)) { $status = 'FAIL'; $summary += 'Frontend manifest missing.\n' }
# Add more product flow checks as needed
return @{status=$status; details=@{summary=$summary}}
