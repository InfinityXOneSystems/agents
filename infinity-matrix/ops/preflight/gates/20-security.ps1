param($Mode, $ChangedOnly)
$status = 'PASS'
$summary = ''
try { gitleaks detect --no-git -v } catch { $status = 'WARN'; $summary += 'gitleaks not found or failed.\n' }
try { npm audit --production } catch { $status = 'WARN'; $summary += 'npm audit failed.\n' }
try { pip-audit } catch { $status = 'WARN'; $summary += 'pip-audit not found or failed.\n' }
return @{status=$status; details=@{summary=$summary}}
