@echo off
REM Run the PowerShell script
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0run_mysql_query.ps1"
REM Open an interactive MySQL session
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p MathGame_user_auth
pause