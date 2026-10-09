#!/usr/bin/env python3
"""Slice the official CINEVO app icon into PNG, ICO, and ICNS sizes.

The mark is the night-purple prism. Executables, the node dashboard,
and the download page all use these rasters — never a redrawn letter.
"""
from __future__ import annotations

import io
import struct
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent
OFFICIAL = ROOT.parents[2] / "public" / "brand" / "cinevo-app-icon-1024.png"


def write_icns(path: Path, pngs: dict[str, bytes]) -> None:
    chunks = []
    for tag, data in pngs.items():
        size = 8 + len(data)
        chunks.append(tag.encode("ascii") + struct.pack(">I", size) + data)
    body = b"".join(chunks)
    path.write_bytes(b"icns" + struct.pack(">I", 8 + len(body)) + body)


def png_bytes(image: Image.Image) -> bytes:
    raw = io.BytesIO()
    image.save(raw, format="PNG")
    return raw.getvalue()


def main() -> None:
    if not OFFICIAL.is_file():
        raise SystemExit(f"official app icon missing: {OFFICIAL}")
    base = Image.open(OFFICIAL).convert("RGBA")
    sample = base.resize((8, 8), Image.Resampling.BOX).getpixel((4, 4))
    if sample[0] < 40 and sample[1] < 40 and sample[2] < 40:
        raise SystemExit("official icon looks like the retired black C mark")

    ROOT.mkdir(parents=True, exist_ok=True)
    sizes = [16, 32, 48, 64, 128, 256, 512, 1024]
    rasters = {s: base.resize((s, s), Image.Resampling.LANCZOS) for s in sizes}
    for s, im in rasters.items():
        im.save(ROOT / f"icon-{s}.png", "PNG")
    rasters[256].save(ROOT / "icon.png", "PNG")
    rasters[32].save(ROOT / "favicon.png", "PNG")
    rasters[256].save(
        ROOT / "icon.ico",
        format="ICO",
        sizes=[(s, s) for s in (16, 32, 48, 64, 128, 256)],
        append_images=[rasters[s] for s in (16, 32, 48, 64, 128)],
    )
    icns_map = {
        "icp4": rasters[16],
        "icp5": rasters[32],
        "icp6": rasters[64],
        "ic07": rasters[128],
        "ic08": rasters[256],
        "ic09": rasters[512],
        "ic10": rasters[1024],
    }
    write_icns(ROOT / "AppIcon.icns", {tag: png_bytes(im) for tag, im in icns_map.items()})
    print(f"wrote CINEVO brand rasters from {OFFICIAL.name}")


if __name__ == "__main__":
    main()
