@echo off
cls
echo ======================================
echo Road-Truck Server Java Initialization
echo ======================================

:: Entra direto na pasta onde estao os arquivos
cd /d "C:\Road-Truck\back-end\graphhopper"

echo ===================================
echo INICIANDO O SERVIDOR GRAPHOPPER
echo ===================================

:: Chama o Java diretamente sem depender de scripts externos
java -Xms1g -Xmx6g -jar graphhopper-web-11.0.jar server config.yml
