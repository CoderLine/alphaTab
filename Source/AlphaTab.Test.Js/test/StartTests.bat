@echo off
echo Starting HTTP Server
start http-server -p 8001
echo Opening Feature Sample
start http://localhost:8001/