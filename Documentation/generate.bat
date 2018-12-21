@echo off

pushd %~dp0

SET WYAM=%USERPROFILE%\.nuget\packages\wyam\1.4.1\tools\net462\Wyam.exe

SET GitBranch=%APPVEYOR_REPO_BRANCH%
git rev-parse HEAD > head.txt
set /p GitRevision=<head.txt
del head.txt

rmdir /S /Q input\assets\js\alphaTab
xcopy ..\Build\JavaScript input\assets\js\alphaTab\ /Y /S
xcopy ..\TestData\Docs input\assets\files\ /Y /S

echo GitRevision=%GitRevision% GitBranch=%GitBranch% LinkRoot=%GitBranch%
%WYAM% build --setting GitRevision=%GitRevision% --setting GitBranch=%GitBranch% --setting LinkRoot=%GitBranch%

popd