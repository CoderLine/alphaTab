@echo off

pushd %~dp0

SET WYAM=%USERPROFILE%\.nuget\packages\wyam\1.4.1\tools\net462\Wyam.exe
git rev-parse HEAD > head.txt
set /p GitRevision=<head.txt
del head.txt
for /F "tokens=3 delims=/" %%i in (..\.git\HEAD) do SET GitBranch=%%i
%WYAM% build --setting GitRevision=%GitRevision% --setting GitBranch=%GitBranch% --setting LinkRoot=%GitBranch%

popd