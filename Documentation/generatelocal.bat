@echo off

pushd %~dp0

SET GitBranch=%APPVEYOR_REPO_BRANCH%
SET WYAM=%USERPROFILE%\.nuget\packages\wyam\1.4.1\tools\net462\Wyam.exe
IF "%GitBranch%"=="" ( 
	git rev-parse HEAD > head.txt
	set /p GitRevision=<head.txt
	del head.txt
	for /F "tokens=3 delims=/" %%i in (..\.git\HEAD) do SET GitBranch=%%i
)

rmdir /S /Q input\assets\js\alphaTab
xcopy ..\Build\JavaScript input\assets\js\alphaTab\ /Y /S

echo GitRevision=%GitRevision% GitBranch=%GitBranch%
%WYAM% build --setting GitRevision=%GitRevision% --setting GitBranch=%GitBranch% --setting LinkRoot=/Documentation/output/

popd