param($Mode, $ChangedOnly)
Import-Module "$PSScriptRoot/../modules/Detect.psm1" -Force
$status = 'PASS'
$summary = ''
if (Detect-Terraform) {
  try { terraform fmt -check } catch { $status = 'FAIL'; $summary += 'terraform fmt failed.\n' }
  try { terraform validate } catch { $status = 'FAIL'; $summary += 'terraform validate failed.\n' }
  if ($Mode -eq 'auth') {
    try { terraform plan -out=plan.tfplan } catch { $status = 'WARN'; $summary += 'terraform plan failed.\n' }
  }
}
return @{status=$status; details=@{summary=$summary}}
