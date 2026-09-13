# Plan A: Manim 1080p 16:9 + voz edge-tts + mux H.264/AAC.
# Uso:
#   .\render.ps1              # los 3, calidad 1080p
#   .\render.ps1 -Preview     # 480p, para iterar
#   .\render.ps1 -Video 01

param(
    [ValidateSet("all", "01", "02", "03")]
    [string]$Video = "all",
    [switch]$Preview,
    [switch]$SkipAudio
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$q = if ($Preview) { "-ql" } else { "-qh" }
$jobs = @{
    "01" = @{ Scene = "Retropropagacion"; File = "01_retropropagacion.py"; Out = "microvideo-01-retropropagacion.mp4" }
    "02" = @{ Scene = "Difusion";         File = "02_difusion.py";         Out = "microvideo-02-difusion.mp4" }
    "03" = @{ Scene = "Lambda";           File = "03_lambda.py";           Out = "microvideo-03-lambda.mp4" }
}
$keys = if ($Video -eq "all") { @("01", "02", "03") } else { @($Video) }

function Find-Python {
    $local = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"
    if (Test-Path $local) { return $local }
    foreach ($c in @("python3.12", "py")) {
        $cmd = Get-Command $c -ErrorAction SilentlyContinue
        if ($cmd) { return $cmd.Source }
    }
    throw "Hace falta Python 3.12+ (ruedas de Manim). En este PC: py install 3.12"
}

function Find-Ffmpeg {
    $cmd = Get-Command ffmpeg -ErrorAction SilentlyContinue
    if (-not $cmd) {
        throw "No hay ffmpeg en PATH. En Windows: winget install Gyan.FFmpeg  (cierra y reabre la terminal)."
    }
    return $cmd.Source
}

$py = Find-Python
$ffmpeg = Find-Ffmpeg

Write-Host "Python  $py"
Write-Host "ffmpeg  $ffmpeg"
Write-Host "calidad $q"

if (-not (Test-Path ".venv\Scripts\python.exe")) {
    Write-Host "Creando .venv con Python 3.12..."
    py -3.12 -m venv .venv
}
$venvPy = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"
& $venvPy -m pip install -q --upgrade pip
& $venvPy -m pip install -q -r requirements.txt

if (-not $SkipAudio) {
    Write-Host "`n=== voz ==="
    & $venvPy gen_audio.py @keys
}

New-Item -ItemType Directory -Force -Path "out" | Out-Null

foreach ($k in $keys) {
    $j = $jobs[$k]
    Write-Host "`n=== Manim $k $($j.Scene) ==="
    $manimArgs = @("-m", "manim", $q, "--fps", "30", $j.File, $j.Scene)
    if (-not $Preview) { $manimArgs = @("-m", "manim", $q, "--fps", "30", "--resolution", "1920,1080", $j.File, $j.Scene) }
    & $venvPy @manimArgs
    if ($LASTEXITCODE -ne 0) { throw "Manim falló en $k" }

    $qdir = if ($Preview) { "480p30" } else { "1080p30" }
    $silent = Get-ChildItem -Recurse "media\videos" -Filter "$($j.Scene).mp4" |
        Where-Object { $_.Directory.Name -eq $qdir } |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1
    if (-not $silent) { throw "No encontré el MP4 de $($j.Scene)" }

    $dest = Join-Path "out" $j.Out
    $audio = Join-Path "audio" "$k.mp3"
    if (Test-Path $audio) {
        & $ffmpeg -y -i $silent.FullName -i $audio -filter_complex "[1:a]apad[a]" -map 0:v -map "[a]" -c:v libx264 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest $dest
    } else {
        Write-Host "Sin audio $audio — copio solo el render."
        Copy-Item $silent.FullName $dest -Force
    }
    Write-Host "listo  $dest"
}

Write-Host "`nEntrega en microvideos\out\  (MP4 1920x1080 H.264). Siguiente: YouTube oculto + seed."
