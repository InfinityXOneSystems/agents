param($Mode, $ChangedOnly)
$status = 'PASS'
$summary = ''
if (!(Test-Path .github/CODEOWNERS)) {
  $status = 'WARN'
  $summary += 'CODEOWNERS file missing.\n'
}
if ($Mode -eq 'ci') {
  # PR metadata checks placeholder
  $summary += 'PR metadata checks not implemented in local mode.\n'
}
return @{status=$status; details=@{summary=$summary}}
