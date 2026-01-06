function Invoke-Gate {
  param($Gate, $Mode, $ChangedOnly)
  $sw = Start-Timer
  $script = "$PSScriptRoot/../gates/$Gate.ps1"
  if (!(Test-Path $script)) { return @{ gate=$Gate; status='WARN'; timing=0; details=@{summary='Missing gate script'} } }
  $result = & $script -Mode $Mode -ChangedOnly:$ChangedOnly
  $elapsed = Stop-Timer $sw
  return @{ gate=$Gate; status=$result.status; timing=$elapsed; details=$result.details }
}
function Get-ReleaseVerdict {
  param($Results, $FailOn)
  if ($Results.status -contains 'FAIL') { return 'FAIL' }
  if ($Results.status -contains 'WARN' -and $FailOn -eq 'warn') { return 'WARN' }
  return 'PASS'
}
