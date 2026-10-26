# H2-PLAN — Carril 0-click de Telegram Desktop (verificado contra master de tdesktop)

Fecha: 2026-10-25 · Solo cuentas lab (Norma victima desktop Windows 10, Abraham/Mi Chip remitente)

## La base (verificada en codigo, material GRANOS-H2-0CLICK en Drive)
- ENTREGA 0-click real: auto-descarga por defecto de archivos <=8MB en chat privado
  (Type::File, Source::User, kDefaultMaxSize 8MB) con nombre y extension controlados
  por el remitente, a Downloads\Telegram Desktop\. Sin click de la victima.
- Detonacion bloqueada HOY por Core::DetectNameType (186 extensiones bloqueadas en
  core/mime_type.cpp, rama Q_OS_WIN).
- FRONTERA (diff contra master): .diagcab esta bloqueado pero .diagpkg y .diagcfg NO.
  Los Troubleshooting Packs de msdt ejecutan scripts PowerShell.

## Cadena objetivo (estilo CVE-2026-107181, parcheado en 7.2.9)
entrega 0-click de regalo.diagpkg -> 1 click (doble clic, o link file:// en entidad
Url que ShellExecuteW abre sin confirmacion) -> msdt ejecuta el pack -> beacon H2-EXEC
al C2 -> (impacto asumido: lectura de tdata en la misma sesion de usuario).

## Secuencia de pruebas (orden obligatorio)
- T1 CONTROL DE ENTREGA: Abraham manda prueba.html (1KB) en privado a Norma.
  Norma NO toca nada. Verificar que cae solo en Downloads\Telegram Desktop\.
  Si baja: primitivo de entrega confirmado en runtime (antes solo visto en codigo).
- T2 CONTROL DE DEFENSA: mandar prueba.bat (1KB). NO debe auto-descargarse.
  Si baja: DetectNameType no esta activo y el hallazgo sube de severidad solo.
- T3 LA MINA (bypass de blocklist): mandar regalo.diagpkg (cualquier contenido de
  1-2KB sirve, DetectNameType solo mira la extension). Si se auto-descarga:
  BYPASS CONFIRMADO. Evidencia: screenshot de la carpeta con el archivo.
- T4 DETONACION EN LOCAL: abrir-regalo.cmd (msdt -path regalo-carpeta) en la maquina
  victima. Si la consola RC-T20 (tab REGISTRO) muestra "H2 0-CLICK - H2-EXEC":
  msdt ejecuta el script del pack. Ese es el RCE local del primitivo.
- T5 DETONACION POR CLICK SOBRE EL ARCHIVO: doble clic a regalo.diagpkg desde
  Downloads\Telegram Desktop\. Si abre msdt y corre el pack: cadena 1-click armada.
- T6 (opcional) DETONACION POR LINK: mensaje con entidad URL
  file:///C:/Users/<usuario>/Downloads/Telegram%20Desktop/regalo.diagpkg
  Un click en el mensaje abre el archivo ya entregado 0-click.
- T7 (opcional, otra familia): probar .appinstaller, .searchconnector-ms, .rdp,
  .contact con el mismo metodo T3 (auto-descarga = bypass de la blocklist).

## Que prueba cada marcador en la consola (tab REGISTRO, vRC3)
- envio: no genera marcador (el remitente sabe cuando mando el regalo).
- descarga automatica: NO es observable por el remitente (el punto del 0-click);
  su verificacion es fisica en la carpeta de la victima (T1/T3).
- apertura + ejecucion: un solo evento, H2-EXEC, con host|usuario|tdata-presente.
  Si llega, la cadena detono. Guardar timestamp del REGISTRO como E-83x.

## Reglas de la operacion que aplican
- Solo si T3 (bypass) Y T4/T5 (ejecucion) confirman, es bug reportable.
- El pack del kit usa un pack benigno del sistema; el beacon no roba datos.
- Reporte individual sin mencion a IA; solo Matias envia a security@telegram.org.
- Nota de alcance: msdt sigue vivo en Windows 10; deprecado en Windows 11 reciente.
