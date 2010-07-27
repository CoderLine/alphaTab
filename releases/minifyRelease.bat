@echo off
if %1!==! goto ende
java -jar ..\tools\compiler.jar --compilation_level SIMPLE_OPTIMIZATIONS --js %1\alphaTab.js --js_output_file %1\alphaTab.min.js
:ende