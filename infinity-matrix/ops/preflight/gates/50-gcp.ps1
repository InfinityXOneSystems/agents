param($Mode, $ChangedOnly)
$status = 'PASS'
$summary = ''
if ($Mode -eq 'auth') {
  if (!(Test-Path env:PROJECT_ID)) { $status = 'WARN'; $summary += 'PROJECT_ID missing.\n' }
  # Add more GCP checks as needed
} else {
  $status = 'WARN'; $summary += 'GCP checks skipped in offline mode.\n'
}
return @{status=$status; details=@{summary=$summary}}
