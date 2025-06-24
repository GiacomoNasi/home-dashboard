@echo off
REM Script per aggiornare, installare dipendenze, buildare e avviare il server in modalità produzione (Windows)

SETLOCAL ENABLEDELAYEDEXPANSION

ECHO [1/4] Pull da GitLab...
git pull

ECHO [2/4] Installazione dipendenze...
call npm install

ECHO [3/4] Build progetto...
call npm run build

ECHO [4/4] Avvio server in modalità produzione...
call npm run start

ENDLOCAL
