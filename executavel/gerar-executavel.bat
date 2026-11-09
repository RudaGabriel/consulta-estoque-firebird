@echo off
REM ===========================================================================
REM  gerar-executavel.bat
REM  @author Ruda Gabriel
REM  @version 1.0.0
REM  @changelog
REM    1.0.0 - 2026-11-09 - Primeira versao. Gera os executaveis do Consulta
REM      Estoque com dois cliques, sem comandos: baixa um Node.js portatil
REM      (so na primeira vez, dentro desta pasta, sem instalar nada no
REM      Windows e sem administrador; SHA-256 conferido), instala as
REM      ferramentas de construcao, gera os .exe de 64 e 32 bits e abre a
REM      pasta com o resultado.
REM
REM  Mantenha este arquivo com quebras de linha CRLF.
REM ===========================================================================
setlocal EnableExtensions DisableDelayedExpansion
cd /d "%~dp0"
title Consulta Estoque - Gerar executavel

set "NODE_VERSAO=v22.23.4"
set "ARQ=x64"
if /i "%PROCESSOR_ARCHITECTURE%"=="x86" if not defined PROCESSOR_ARCHITEW6432 set "ARQ=x86"
set "NODE_NOME=node-%NODE_VERSAO%-win-%ARQ%"
set "NODE_DIR=%~dp0.cache\%NODE_NOME%"

echo.
echo   Consulta Estoque - Gerar executavel
echo   ===================================
echo.

if not exist "..\consulta-estoque.js" goto :erro_projeto
if not exist "construir.js" goto :erro_projeto

REM ---------------------------------------------------------------------------
REM 1) Node.js portatil (somente nesta pasta; nada e instalado no Windows)
REM ---------------------------------------------------------------------------
if exist "%NODE_DIR%\node.exe" goto :node_portatil
echo  [1/3] Baixando o Node.js %NODE_VERSAO% portatil ^(somente na primeira vez, cerca de 30 MB^)...
if not exist ".cache" mkdir ".cache"
powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; $ProgressPreference='SilentlyContinue'; [Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; $base='https://nodejs.org/dist/'+$env:NODE_VERSAO+'/'; $zip=Join-Path '.cache' ($env:NODE_NOME+'.zip'); $somas=Join-Path '.cache' 'SHASUMS256.txt'; Invoke-WebRequest -Uri ($base+$env:NODE_NOME+'.zip') -OutFile $zip -UseBasicParsing; Invoke-WebRequest -Uri ($base+'SHASUMS256.txt') -OutFile $somas -UseBasicParsing; $linha=Get-Content $somas | Where-Object { $_.Trim().EndsWith(' '+$env:NODE_NOME+'.zip') } | Select-Object -First 1; if (-not $linha) { throw 'Node.js nao encontrado na lista oficial.' }; $esperado=($linha.Trim() -split '\s+')[0].ToLower(); $obtido=(Get-FileHash -Path $zip -Algorithm SHA256).Hash.ToLower(); if ($obtido -ne $esperado) { Remove-Item $zip -Force; throw 'SHA-256 do Node.js nao confere.' }; Expand-Archive -Path $zip -DestinationPath '.cache' -Force; Remove-Item $zip -Force; Remove-Item $somas -Force"
if errorlevel 1 goto :node_sistema
if not exist "%NODE_DIR%\node.exe" goto :node_sistema

:node_portatil
set "PATH=%NODE_DIR%;%PATH%"
echo  [1/3] Node.js portatil pronto: %NODE_VERSAO% ^(%ARQ%^)
goto :dependencias

REM Sem internet para baixar o portatil: usa o Node.js instalado, se for 22+.
:node_sistema
echo  [AVISO] Nao foi possivel baixar o Node.js portatil. Tentando o Node.js instalado...
where node > nul 2>&1
if errorlevel 1 goto :erro_node
set "NODE_MAIOR=0"
for /f "delims=" %%v in ('node -p "process.versions.node.split('.')[0]" 2^>nul') do set "NODE_MAIOR=%%v"
if %NODE_MAIOR% LSS 22 goto :erro_node
echo  [1/3] Usando o Node.js instalado ^(versao %NODE_MAIOR%^).

REM ---------------------------------------------------------------------------
REM 2) Ferramentas de construcao (esbuild, postject, resedit, node-firebird)
REM ---------------------------------------------------------------------------
:dependencias
if exist "node_modules\esbuild\package.json" if exist "node_modules\postject\package.json" if exist "node_modules\resedit\package.json" if exist "node_modules\node-firebird\package.json" goto :dependencias_ok
echo  [2/3] Instalando as ferramentas de construcao ^(somente na primeira vez^)...
call npm ci --no-audit --no-fund --loglevel=error
if errorlevel 1 goto :erro_npm
:dependencias_ok
echo  [2/3] Ferramentas de construcao prontas.

REM ---------------------------------------------------------------------------
REM 3) Gerar os executaveis e abrir a pasta com o resultado
REM ---------------------------------------------------------------------------
echo  [3/3] Gerando os executaveis ^(64 e 32 bits^)...
echo.
node construir.js
if errorlevel 1 goto :erro_construir

echo.
echo  ===========================================================
echo   Pronto! Os executaveis estao na pasta "dist", que sera aberta agora.
echo   - ConsultaEstoque-...-win-x64.exe: Windows de 64 bits
echo   - ConsultaEstoque-...-win-x86.exe: Windows de 32 bits
echo  ===========================================================
echo.
start "" explorer "%~dp0dist"
pause
exit /b 0

:erro_projeto
echo  [ERRO] Este arquivo deve ficar na pasta "executavel" do projeto Consulta Estoque.
goto :falha
:erro_node
echo  [ERRO] Nao foi possivel obter o Node.js 22 ou superior.
echo         Verifique a conexao com a internet e execute este arquivo novamente.
goto :falha
:erro_npm
echo  [ERRO] Falha ao instalar as ferramentas de construcao.
echo         Verifique a conexao com a internet e execute este arquivo novamente.
goto :falha
:erro_construir
echo.
echo  [ERRO] A geracao dos executaveis falhou. Veja as mensagens acima.
goto :falha

:falha
echo.
pause
exit /b 1
