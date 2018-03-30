@echo off
echo Starting HTTP Server
start "AlphaTab Sample HTTP Server" ..\..\..\Tools\miniweb.exe -r . -p 8002
echo Opening Feature Sample
start http://localhost:8002/