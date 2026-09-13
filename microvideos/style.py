"""Paleta IEP + helpers. Sin LaTeX: solo Text(), para no depender de MiKTeX."""

from manim import *

CORAL = "#F93319"
CORAL_SOFT = "#FF6B52"
INK = "#F5F5F5"
MUTED = "#A3A3A3"
BG = "#0B0B0B"
LINE = "#525252"
OK = "#34D399"
ERR = "#F87171"
GOLD = "#FBBF24"
BLUE = "#60A5FA"
FONT = "Arial"


def T(s, size=36, color=INK, **kw):
    """Texto con espacios reales. En Windows, manimpango+Text() se come los ' '."""
    words = [w for w in str(s).split(" ") if w != ""]
    if len(words) <= 1:
        return Text(str(s), font=FONT, font_size=size, color=color, **kw)
    parts = VGroup(*[Text(w, font=FONT, font_size=size, color=color, **kw) for w in words])
    parts.arrange(RIGHT, buff=0.16, aligned_edge=DOWN)
    return parts


def caption(s):
    t = T(s, 24, MUTED)
    if t.width > 12.4:
        t.scale_to_fit_width(12.4)
    return t.to_edge(DOWN, buff=0.45)


def neuron(color=INK, radius=0.30):
    c = Circle(radius=radius, color=color, stroke_width=2.5)
    c.set_fill(color, opacity=0.18)
    return c


def T1(s, size=36, color=INK, **kw):
    """Una sola caja de texto; NBSP para que Pango no se coma los espacios."""
    return Text(str(s).replace(" ", "\u00A0"), font=FONT, font_size=size, color=color, **kw)


def box(title, subtitle=None, width=3.4, height=1.7, color=CORAL):
    r = RoundedRectangle(corner_radius=0.16, width=width, height=height, color=color, stroke_width=2.5)
    r.set_fill(color, opacity=0.10)
    t = T1(title, 26, INK)
    if t.width > width - 0.3:
        t.scale_to_fit_width(width - 0.35)
    group = VGroup(r, t)
    if subtitle:
        s = T1(subtitle, 16, MUTED)
        if s.width > width - 0.3:
            s.scale_to_fit_width(width - 0.35)
        s.next_to(t, DOWN, buff=0.12)
        group.add(s)
        VGroup(t, s).move_to(r)
    else:
        t.move_to(r)
    return group
