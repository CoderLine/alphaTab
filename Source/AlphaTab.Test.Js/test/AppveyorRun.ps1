Push-Location -Path $PSScriptRoot
karma start karma.conf.js 

$wc = New-Object 'System.Net.WebClient'
$wc.UploadFile("https://ci.appveyor.com/api/testresults/mstest/$($env:APPVEYOR_JOB_ID)", (Resolve-Path .\Results.trx))

Get-Location 
