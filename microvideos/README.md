# Plan A — producir los 3 micro-vídeos (0 USD)

Requisitos en Windows: **Python 3.12 o 3.13** (no 3.14: Manim no trae ruedas y pide Visual C++) y [ffmpeg](https://ffmpeg.org).

```powershell
py install 3.12
winget install Gyan.FFmpeg
```

```powershell
cd microvideos
.\render.ps1            # 1080p, los 3
.\render.ps1 -Preview   # 480p, para iterar
.\render.ps1 -Video 01
```

Salida: `out/microvideo-0N-*.mp4` — MP4 H.264 1920×1080 16:9 + AAC, listo para YouTube oculto.

Voz: `es-MX-DaliaNeural` (edge-tts, gratis). Para grabar tú la columna *Narración*, usa `-SkipAudio` y muxea el WAV en CapCut. Otras voces: `python gen_audio.py 01 --voice es-MX-JorgeNeural`.
