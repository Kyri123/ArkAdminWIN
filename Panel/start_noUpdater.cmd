@echo off

WHERE npm
IF %ERRORLEVEL% NEQ 0 ECHO command "npm" not found!
IF %ERRORLEVEL% NEQ 0 pause
IF %ERRORLEVEL% NEQ 0 exit

WHERE node
IF %ERRORLEVEL% NEQ 0 ECHO command "node" not found!
IF %ERRORLEVEL% NEQ 0 pause
IF %ERRORLEVEL% NEQ 0 exit

echo -----------------------------------------
echo        Update Module + Start
echo -----------------------------------------
npm i & npm update & npm fund & start "KAdmin-ArkWIN" cmd /k "node app.js startedWithoutUpdater & start "KAdmin-ArkWIN Starter" start_noUpdater.cmd & exit" & exit