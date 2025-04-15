@echo off
setlocal enabledelayedexpansion

set PORT=3100
echo Checking port %PORT%...

:: Find PID using the port
for /f "tokens=5" %%a in ('netstat -ano ^| findstr /r ":%PORT% .*LISTENING"') do (
    set PID=%%a
)

:: Kill process if found
if defined PID (
    echo Found process with PID !PID! using port %PORT%. Killing it...
    taskkill /F /PID !PID!
    if !ERRORLEVEL! EQU 0 (
        echo Process killed successfully.
    ) else (
        echo Failed to kill process.
    )
) else (
    echo No process found using port %PORT%.
)

:: Give time for port to be freed
timeout /T 1 /NOBREAK > nul

echo Done.