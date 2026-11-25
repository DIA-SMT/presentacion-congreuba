# Genera guion-modulo6.pdf (A4) desde guion.html, con Edge sin ventana.
# Necesita la presentación servida en localhost (INICIAR.bat / node server.js u otro servidor).
#
#   .\herramientas\guion-pdf.ps1
param(
  [string]$Base = 'http://localhost:8080',
  [string]$Salida = (Join-Path (Split-Path $PSScriptRoot -Parent) 'guion-modulo6.pdf')
)
$edge = @("${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe", "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe") | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $edge) { throw 'No encontré Microsoft Edge.' }
$tmp = Join-Path $env:TEMP 'guion-presentacion'
New-Item -ItemType Directory -Force $tmp | Out-Null
Remove-Item $Salida -ErrorAction SilentlyContinue
$argv = @('--headless=new', '--disable-gpu', '--no-first-run', '--no-pdf-header-footer', "--user-data-dir=`"$tmp\perfil`"",
  '--virtual-time-budget=15000', "--print-to-pdf=`"$Salida`"", "`"$Base/guion.html`"")
Start-Process -FilePath $edge -ArgumentList $argv -Wait -WindowStyle Hidden
if (Test-Path $Salida) { "ok  $Salida  ({0:N0} KB)" -f ((Get-Item $Salida).Length / 1KB) } else { throw 'No se generó el PDF.' }
