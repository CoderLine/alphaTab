@ECHO OFF
set ProjectDir=%~1
set SolutionDir=%~2

echo Copying JavaScript
xcopy "%ProjectDir%\res\AlphaTab.js" "%SolutionDir%\Build\JavaScript" /i /Y
echo Minifying JavaScript
uglifyjs "%SolutionDir%\Build\JavaScript\AlphaTab.js" -o "%SolutionDir%\Build\JavaScript\AlphaTab.min.js" -c