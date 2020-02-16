@echo off

pushd %~dp0
wyam build --setting LinkRoot=/output/
popd