@echo off

pushd %~dp0

SET WYAM=%USERPROFILE%\.nuget\packages\wyam\2.2.5\tools\netcoreapp2.1\Wyam.dll
SET GitBranch=%APPVEYOR_REPO_BRANCH%
git rev-parse HEAD > head.txt
set /p GitRevision=<head.txt
del head.txt

rmdir /S /Q input\assets\js\alphaTab
xcopy ..\Build\JavaScript input\assets\js\alphaTab\ /Y /S
xcopy ..\TestData\Docs input\assets\files\ /Y /S

echo GitRevision=%GitRevision% GitBranch=%GitBranch% LinkRoot=%GitBranch% WYAM=%WYAM%
dotnet %WYAM% build --setting GitRevision=%GitRevision% --setting GitBranch=%GitBranch% --setting LinkRoot=%GitBranch%

popd