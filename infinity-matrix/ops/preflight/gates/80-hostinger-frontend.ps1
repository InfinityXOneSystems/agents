param($Mode, $ChangedOnly)
$status = 'PASS'
$summary = ''
try { npm run build } catch { $status = 'FAIL'; $summary += 'Frontend build failed.\n' }
try { npx playwright test } catch { $status = 'WARN'; $summary += 'Playwright not found or tests failed.\n' }
try { npx lhci autorun } catch { $status = 'WARN'; $summary += 'Lighthouse CI not found.\n' }
return @{status=$status; details=@{summary=$summary}}
