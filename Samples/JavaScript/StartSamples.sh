#!/bin/bash

httpServerPID=0
trap ctrl_c INT
function ctrl_c() {
    if [ $httpServerPID > 0 ]; then
        kill $httpServerPID 2> /dev/null
        sleep 1
    fi
}

httpVersion=$(npm list -g http-server | grep http-server)

if [ -z $httpVersion ]; then
    echo HTTP Server package not installed, running npm to install it
    sudo npm install http-server -g
fi

echo Starting HTTP Server
http-server ../../ -p 8000 &
httpServerPID=$!

sleep 2

echo Opening Example on http://localhost:8000/Samples/JavaScript/features.html
xdg-open http://localhost:8000/Samples/JavaScript/features.html > /dev/null 2> /dev/null &

cat
