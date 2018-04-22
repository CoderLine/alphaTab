@echo off

echo %~dp0..\Test\TestFiles\

rem SET WYAM=%USERPROFILE%\.nuget\packages\wyam\1.4.1\tools\net462\Wyam.exe
rem git rev-parse HEAD > head.txt
rem set /p GitRevision=<head.txt
rem del head.txt
rem for /F "tokens=3 delims=/" %%i in (..\.git\HEAD) do SET GitBranch=%%i
rem %WYAM% build --setting GitRevision=%GitRevision% --setting GitBranch=%GitBranch%