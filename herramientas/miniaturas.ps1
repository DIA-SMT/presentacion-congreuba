# Regenera las miniaturas de la botonera (img/mini/mNN-1.jpg) con Edge sin ventana.
# Necesita la presentación servida en localhost (INICIAR.bat / node server.js, u otro
# servidor estático) y usa el modo captura de m6.js (?captura=N): la placa quieta y
# en su estado final.
#
#   .\herramientas\miniaturas.ps1 -Placas 1,2,5             # sólo esas placas
#   .\herramientas\miniaturas.ps1 -Placas 19 -Recursos 4    # vitrina: m19-1 … m19-4
param(
  [Parameter(Mandatory)][int[]]$Placas,
  [int]$Recursos = 0,
  [string]$Base = 'http://localhost:8080',
  [string]$Salida = (Join-Path $PSScriptRoot '..\img\mini')
)
$edge = @("${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe", "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe") | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $edge) { throw 'No encontré Microsoft Edge.' }
Add-Type -AssemblyName System.Drawing
$tmp = Join-Path $env:TEMP 'miniaturas-presentacion'
New-Item -ItemType Directory -Force $tmp | Out-Null
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$pars = New-Object System.Drawing.Imaging.EncoderParameters 1
$pars.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), 84L

function Get-Miniatura([string]$url, [string]$destino) {
  $png = Join-Path $tmp 'captura.png'
  Remove-Item $png -ErrorAction SilentlyContinue
  $argv = @('--headless=new', '--disable-gpu', '--hide-scrollbars', '--mute-audio', '--no-first-run',
    "--user-data-dir=`"$tmp\perfil`"", '--window-size=1920,1080', '--virtual-time-budget=7000', "--screenshot=`"$png`"", "`"$url`"")
  Start-Process -FilePath $edge -ArgumentList $argv -Wait -WindowStyle Hidden
  if (-not (Test-Path $png)) { Write-Warning "Sin captura: $url"; return }
  $img = [System.Drawing.Image]::FromFile($png)
  $chica = New-Object System.Drawing.Bitmap 640, 360
  $g = [System.Drawing.Graphics]::FromImage($chica)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.DrawImage($img, 0, 0, 640, 360)
  $chica.Save($destino, $codec, $pars)
  $g.Dispose(); $chica.Dispose(); $img.Dispose()
  Write-Output ("ok  {0}" -f (Split-Path $destino -Leaf))
}

foreach ($n in $Placas) {
  if ($Recursos -gt 0) {
    1..$Recursos | ForEach-Object { Get-Miniatura "$Base/?captura=$n&rec=$_" (Join-Path $Salida ('m{0:D2}-{1}.jpg' -f $n, $_)) }
  } else {
    Get-Miniatura "$Base/?captura=$n" (Join-Path $Salida ('m{0:D2}-1.jpg' -f $n))
  }
}
