@echo off
echo A instalar pacotes novos...
call npm install

echo.
echo A arrancar o servidor em segundo plano...
start "Kyro Dev Server" cmd /k "npm run dev"

echo A aguardar o servidor arrancar (6 segundos)...
timeout /t 6 /nobreak >nul

echo A abrir o site...
start "" "http://localhost:8080"

echo.
echo Servidor a correr! Nao feches a janela "Kyro Dev Server".
echo Esta janela pode ser fechada.
pause
