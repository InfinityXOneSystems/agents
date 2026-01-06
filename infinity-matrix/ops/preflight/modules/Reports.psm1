function Write-MarkdownReport { param($Results, $OutFile) $Results | Out-File $OutFile }
function Write-JSONReport { param($Results, $OutFile) $Results | ConvertTo-Json -Depth 5 | Out-File $OutFile }
