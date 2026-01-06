param($Url)
try { (Invoke-WebRequest $Url).StatusCode -eq 200 } catch { $false }