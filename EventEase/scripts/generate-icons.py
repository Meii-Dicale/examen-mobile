"""
Génère les images de l'app (icône, icône Android, splash, favicon) à partir du logo B :
un ticket d'entrée avec une coche (« j'ai participé »).

Le tracé reprend EXACTEMENT celui du SVG de la maquette et de src/components/common/Logo.tsx
(repère de 100 × 100) : on change le logo à un seul endroit de chaque côté, et les images
sont refaites avec une commande. Il suffit de Python 3 et de Pillow :

    python3 scripts/generate-icons.py      (depuis le dossier EventEase/)
"""

from __future__ import annotations  # « str | None » aussi avec Python 3.9 (macOS)

from pathlib import Path

from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parent.parent / "assets" / "images"

# Couleurs de la palette Prune & pêche (src/theme/colors.ts).
PRIMARY = "#7A2E8E"
PRIMARY_DARK = "#D99BEA"
BG_DARK = "#1A1020"
ACCENT = "#FF9466"
ACCENT_DARK = "#FFA680"
WHITE = "#FFFFFF"

# On dessine 4 fois plus grand puis on réduit : les bords sont lissés (anticrénelage).
SUPERSAMPLE = 4


def draw_logo(size: int, logo_box: float, ticket: str, check: str | None) -> Image.Image:
    """
    Logo centré sur une image transparente de `size` pixels.
    `logo_box` : taille en pixels du repère 100 × 100 du SVG.
    `check` : couleur de la coche, ou None pour la découper (icône monochrome).
    """
    big = size * SUPERSAMPLE
    unit = logo_box * SUPERSAMPLE / 100  # pixels par unité du SVG
    offset = (big - logo_box * SUPERSAMPLE) / 2

    def p(x: float, y: float) -> tuple[float, float]:
        return (offset + x * unit, offset + y * unit)

    image = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    transparent = (0, 0, 0, 0)

    # Ticket : rectangle de (10, 22) à (90, 82), coins arrondis de rayon 10…
    draw.rounded_rectangle([p(10, 22), p(90, 82)], radius=10 * unit, fill=ticket)
    # … et deux encoches en demi-cercle (rayon 8) au milieu des côtés, centrées en y = 52.
    for cx in (10, 90):
        draw.ellipse([p(cx - 8, 44), p(cx + 8, 60)], fill=transparent)

    # Coche : (33, 52) → (45, 64) → (67, 40), trait de 9, bouts et angle arrondis.
    points = [p(33, 52), p(45, 64), p(67, 40)]
    color = check if check else transparent
    width = 9 * unit
    draw.line(points, fill=color, width=round(width))
    for x, y in points:
        r = width / 2
        draw.ellipse([x - r, y - r, x + r, y + r], fill=color)

    return image.resize((size, size), Image.LANCZOS)


def on_background(logo: Image.Image, color: str) -> Image.Image:
    background = Image.new("RGBA", logo.size, color)
    return Image.alpha_composite(background, logo)


def save(image: Image.Image, name: str) -> None:
    image.save(OUT / name)
    print(f"✓ {name} ({image.width} × {image.height})")


def main() -> None:
    # Icône iOS / générale : fond prune, ticket blanc. iOS arrondit lui-même les coins.
    # Le repère occupe 64 % de l'icône, comme dans la maquette.
    save(on_background(draw_logo(1024, 1024 * 0.64, WHITE, ACCENT), PRIMARY), "icon.png")

    # Android (icône adaptative) : le système découpe un cercle, une goutte… dans 66 % du
    # centre seulement. Le logo est donc plus petit, et le fond est une image à part.
    save(draw_logo(1024, 600, WHITE, ACCENT), "android-icon-foreground.png")
    save(Image.new("RGBA", (1024, 1024), PRIMARY), "android-icon-background.png")
    # Monochrome (icônes thématiques d'Android 13+) : une seule couleur, la coche est découpée.
    save(draw_logo(1024, 600, WHITE, None), "android-icon-monochrome.png")

    # Splash : le logo seul, sur fond transparent (la couleur de fond est dans app.json).
    save(draw_logo(1024, 1024, WHITE, ACCENT), "splash-icon.png")
    save(draw_logo(1024, 1024, PRIMARY_DARK, ACCENT_DARK), "splash-icon-dark.png")

    # Favicon (version web) : petite icône aux coins arrondis.
    favicon = on_background(draw_logo(192, 192 * 0.7, WHITE, ACCENT), PRIMARY)
    mask = Image.new("L", favicon.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, 191, 191], radius=42, fill=255)
    favicon.putalpha(mask)
    save(favicon.resize((48, 48), Image.LANCZOS), "favicon.png")


if __name__ == "__main__":
    main()
