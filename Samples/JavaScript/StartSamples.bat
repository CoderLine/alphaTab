@echo off
echo Starting HTTP Server
start "AlphaTab Sample HTTP Server" ..\..\Tools\miniweb.exe -r ..\..\
echo Opening Feature Sample
start http://localhost:8000/Samples/JavaScript/features.html