@ECHO OFF
REM SET ThisScriptsDirectory=%~dp0
SET PowerShellScriptPath=C:\Users\Ted\Dropbox\GitHub\fabmo-sb4-app\buildINFO.ps1
PowerShell -NoProfile -ExecutionPolicy Bypass -Command "& '%PowerShellScriptPath%'";


REM If running in the console, wait for input before closing.
if ($Host.Name -eq "ConsoleHost")
{ 
    Write-Host "Press any key to continue..."
    $Host.UI.RawUI.FlushInputBuffer()   # Make sure buffered input doesn't "press a key" and skip the ReadKey().
    $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyUp") > $null
}

REM original-------------------------------
REM @ECHO OFF
REM SET ThisScriptsDirectory=%~dp0
REM SET PowerShellScriptPath=%ThisScriptsDirectory%MyPowerShellScript.ps1
REM PowerShell -NoProfile -ExecutionPolicy Bypass -Command "& '%PowerShellScriptPath%'";