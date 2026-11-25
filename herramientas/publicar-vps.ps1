# Publica lo que está commiteado (HEAD) en el VPS: https://presentacion.195-35-42-168.sslip.io
# Copia los archivos a /var/www/presentacion-modulo6 y reinicia el proceso de pm2
# "presentacion-modulo6" (un segundo). No usar en medio de la charla.
#
#   .\herramientas\publicar-vps.ps1
param(
  [string]$Servidor = 'root@195.35.42.168',
  [string]$Clave = (Join-Path $env:USERPROFILE '.ssh\vps_presentacion')
)
$git = (Get-Command git -ErrorAction SilentlyContinue).Source
if (-not $git) { $git = 'C:\Program Files\Git\cmd\git.exe' }
$raiz = Split-Path $PSScriptRoot -Parent
$tar = Join-Path $env:TEMP 'presentacion-modulo6.tar'
& $git -C $raiz archive -o $tar HEAD
if (-not $?) { throw 'git archive falló' }
scp -i $Clave -o BatchMode=yes -q $tar "${Servidor}:/tmp/presentacion-modulo6.tar"
if (-not $?) { throw 'scp falló' }
ssh -i $Clave -o BatchMode=yes $Servidor "set -e; D=/var/www/presentacion-modulo6; tar -xf /tmp/presentacion-modulo6.tar -C `$D; rm /tmp/presentacion-modulo6.tar; pm2 restart presentacion-modulo6 >/dev/null; sleep 1; curl -s -o /dev/null -w 'publicada: %{http_code}\n' https://presentacion.195-35-42-168.sslip.io/"
Remove-Item $tar -ErrorAction SilentlyContinue
