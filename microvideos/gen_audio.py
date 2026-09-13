"""Genera voz ES-LatAm gratis (edge-tts) a partir de narracion/*.txt."""

from __future__ import annotations

import argparse
import asyncio
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parent
NARR = ROOT / "narracion"
OUT = ROOT / "audio"
VOICE = "es-MX-DaliaNeural"
RATE = "-8%"

CLIPS = {
    "01": NARR / "01-retropropagacion.txt",
    "02": NARR / "02-difusion.txt",
    "03": NARR / "03-lambda.txt",
}


async def synth(key: str, voice: str, rate: str) -> Path:
    text = CLIPS[key].read_text(encoding="utf-8").strip()
    OUT.mkdir(exist_ok=True)
    dest = OUT / f"{key}.mp3"
    comm = edge_tts.Communicate(text, voice, rate=rate)
    await comm.save(str(dest))
    print(f"ok  {dest.name}  ({dest.stat().st_size // 1024} KB)")
    return dest


async def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("videos", nargs="*")
    p.add_argument("--voice", default=VOICE)
    p.add_argument("--rate", default=RATE)
    args = p.parse_args()
    keys = args.videos or ["01", "02", "03"]
    unknown = [k for k in keys if k not in CLIPS]
    if unknown:
        raise SystemExit(f"vídeos desconocidos: {unknown} (usa 01, 02 o 03)")
    for key in keys:
        await synth(key, args.voice, args.rate)


if __name__ == "__main__":
    asyncio.run(main())
