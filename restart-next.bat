@echo off
REM Cambia directory nel progetto se necessario
cd C:\Users\Dell\easytrip

REM Termina eventuali processi Node.js in ascolto sulla porta 3000 (opzionale)
REM taskkill /F /IM node.exe

REM Riavvia il server di sviluppo
echo Avvio Next.js...
npm run dev

pause
