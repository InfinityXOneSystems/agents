function Get-ChangedFiles { git diff --name-only origin/main...HEAD }
function Is-FileChanged { param($file) (Get-ChangedFiles) -contains $file }
