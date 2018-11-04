Push-Location -Path $PSScriptRoot
karma start karma.conf.js 

Try
{
    $wc = New-Object 'System.Net.WebClient'
    $wc.UploadFile("https://ci.appveyor.com/api/testresults/mstest/$($env:APPVEYOR_JOB_ID)", (Resolve-Path .\Results.trx))
}
Catch [System.Net.WebException]
{
    echo "Pushing test results failed:" 
    $ex = $_.Exception.ToString()
    $responseStream = $_.Exception.Response.GetResponseStream()
    $sr = New-Object System.IO.StreamReader $responseStream
    $result = $sr.ReadToEnd()
    Write-Host "Pushing test results failed: $($ex)"
    Write-Host "Response was: $($result)"
}
Pop-Location 
