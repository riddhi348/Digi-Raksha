@echo off
set "ROOT=%~dp0"
start "Digi-Raksha" powershell -NoExit -ExecutionPolicy Bypass -File "%ROOT%run-local.ps1"
