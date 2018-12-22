@echo off

pushd %~dp0

SET GitBranch=%APPVEYOR_REPO_BRANCH%
SET WYAM=%USERPROFILE%\.nuget\packages\wyam\2.1.1\tools\netcoreapp2.1\Wyam.dll
IF "%GitBranch%"=="" ( 
	git rev-parse HEAD > head.txt
	set /p GitRevision=<head.txt
	del head.txt
	for /F "tokens=3 delims=/" %%i in (..\.git\HEAD) do SET GitBranch=%%i
)

rmdir /S /Q input\assets\js\alphaTab
xcopy ..\Build\JavaScript input\assets\js\alphaTab\ /Y /S
xcopy ..\TestData\Docs input\assets\files\ /Y /S

echo GitRevision=%GitRevision% GitBranch=%GitBranch% LinkRoot=%GitBranch% WYAM=%WYAM%
dotnet %WYAM% build --setting GitRevision=%GitRevision% --setting GitBranch=%GitBranch% --setting LinkRoot=/Documentation/output/ --setting NoApi=true

popd