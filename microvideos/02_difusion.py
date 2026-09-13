"""Vídeo 2 — Modelos de difusión (~105 s). IX L4."""

import random

from manim import *

from style import BG, CORAL, ERR, GOLD, INK, MUTED, OK, T, caption


COLS, ROWS = 8, 8
CELL = 0.38


def _pattern():
    """Pieza gris con un rayón rojo — el ejemplo industrial de la lección."""
    grid = [[("#4B5563") for _ in range(COLS)] for _ in range(ROWS)]
    for r in range(ROWS):
        for c in range(COLS):
            if r in (0, ROWS - 1) or c in (0, COLS - 1):
                grid[r][c] = "#6B7280"
    for i in range(1, 7):
        grid[i][i] = "#F93319"
        if i + 1 < COLS:
            grid[i][i + 1] = "#FF6B52"
    return grid


def _noise_color(rng):
    v = rng.randint(28, 210)
    return f"#{v:02x}{v:02x}{v:02x}"


def _blend(a, b, t):
    def hx(s):
        return tuple(int(s[i : i + 2], 16) for i in (1, 3, 5))

    ar, ag, ab = hx(a)
    br, bg, bb = hx(b)
    return f"#{int(ar + (br - ar) * t):02x}{int(ag + (bg - ag) * t):02x}{int(ab + (bb - ab) * t):02x}"


class Difusion(Scene):
    def construct(self):
        self.camera.background_color = BG
        self.rng = random.Random(42)
        self.titulo()
        cells, clean = self.imagen()
        noisy = self.ruido(cells, clean)
        self.inverso(cells, clean, noisy)
        self.versus()
        self.cierre()

    def titulo(self):
        title = T("Modelos de difusión", 52)
        sub = T("Ensuciar una imagen, y luego aprender a limpiarla", 26, MUTED)
        sub.next_to(title, DOWN, buff=0.35)
        self.play(Write(title), run_time=1.5)
        self.play(FadeIn(sub, shift=UP * 0.15), run_time=0.7)
        self.wait(5.4)
        self.play(FadeOut(title), FadeOut(sub), run_time=0.4)

    def _grid(self, colors, origin=LEFT * 0.2):
        cells = VGroup()
        for r in range(ROWS):
            for c in range(COLS):
                sq = Square(CELL, stroke_width=0.6, stroke_color="#1F1F1F")
                sq.set_fill(colors[r][c], opacity=1)
                sq.move_to(origin + RIGHT * (c - (COLS - 1) / 2) * CELL + DOWN * (r - (ROWS - 1) / 2) * CELL)
                cells.add(sq)
        return cells

    def imagen(self):
        clean = _pattern()
        cells = self._grid(clean)
        tag = T("imagen real", 22, OK).next_to(cells, UP, buff=0.35)
        cap = caption("Parte de una imagen real — aquí, una pieza con un rayón.")
        self.play(FadeIn(cells), FadeIn(tag), FadeIn(cap), run_time=1.2)
        self.wait(14.4)
        self.play(FadeOut(tag), FadeOut(cap), run_time=0.3)
        return cells, clean

    def ruido(self, cells, clean):
        noisy = [[_noise_color(self.rng) for _ in range(COLS)] for _ in range(ROWS)]
        cap = caption("En cada paso se añade un poco de ruido. Al final, solo queda ruido.")
        step = T("ruido  0 / 6", 22, GOLD).to_edge(UP, buff=0.4)
        self.play(FadeIn(cap), FadeIn(step), run_time=0.4)
        for k, t in enumerate((0.18, 0.36, 0.54, 0.70, 0.85, 1.0), start=1):
            nxt = T(f"ruido  {k} / 6", 22, GOLD).to_edge(UP, buff=0.4)
            anims = [cells[r * COLS + c].animate.set_fill(_blend(clean[r][c], noisy[r][c], t), opacity=1) for r in range(ROWS) for c in range(COLS)]
            self.play(*anims, ReplacementTransform(step, nxt), run_time=2.6)
            step = nxt
        end = T("solo ruido", 24, MUTED).next_to(cells, DOWN, buff=0.35)
        self.play(FadeIn(end), run_time=0.4)
        self.wait(6.6)
        self.play(FadeOut(cap), FadeOut(step), FadeOut(end), run_time=0.3)
        return noisy

    def inverso(self, cells, clean, noisy):
        cap = caption("El modelo invierte el proceso: de ruido a imagen, paso a paso.")
        step = T("limpieza  0 / 6", 22, OK).to_edge(UP, buff=0.4)
        self.play(FadeIn(cap), FadeIn(step), run_time=0.5)
        for k, t in enumerate((0.85, 0.70, 0.54, 0.36, 0.18, 0.0), start=1):
            nxt = T(f"limpieza  {k} / 6", 22, OK).to_edge(UP, buff=0.4)
            anims = [cells[r * COLS + c].animate.set_fill(_blend(clean[r][c], noisy[r][c], t), opacity=1) for r in range(ROWS) for c in range(COLS)]
            self.play(*anims, ReplacementTransform(step, nxt), run_time=3.0)
            step = nxt
        done = T("imagen coherente otra vez", 24, OK).next_to(cells, DOWN, buff=0.35)
        prompt = T("si hay un prompt, la limpieza va guiada", 22, MUTED).next_to(done, DOWN, buff=0.15)
        self.play(FadeIn(done), FadeIn(prompt), run_time=0.6)
        self.wait(8.4)
        self.play(FadeOut(cells), FadeOut(cap), FadeOut(step), FadeOut(done), FadeOut(prompt), run_time=0.5)

    def versus(self):
        gan = T("GAN", 36, CORAL).shift(LEFT * 3.2 + UP * 1.2)
        dif = T("Difusión", 36, GOLD).shift(RIGHT * 3.2 + UP * 1.2)
        g1 = T("un solo paso\nhacia adelante", 24, MUTED).next_to(gan, DOWN, buff=0.35)
        d1 = T("decenas o cientos\nde refinamientos", 24, MUTED).next_to(dif, DOWN, buff=0.35)
        cap = caption("Misma meta, distinto costo: la GAN es rápida; la difusión, más estable.")
        self.play(FadeIn(gan), FadeIn(dif), run_time=0.6)
        self.play(FadeIn(g1), FadeIn(d1), FadeIn(cap), run_time=0.7)
        self.wait(14.2)
        self.play(FadeOut(gan), FadeOut(dif), FadeOut(g1), FadeOut(d1), FadeOut(cap), run_time=0.4)

    def cierre(self):
        a = T("¿Tiempo real?", 30, CORAL)
        b = T("GAN ya entrenada.", 26, INK)
        c = T("¿Generar una vez y reutilizar?", 30, GOLD)
        d = T("Difusión suele ganar.", 26, INK)
        a.shift(UP * 1.4)
        b.next_to(a, DOWN, buff=0.25)
        c.next_to(b, DOWN, buff=0.7)
        d.next_to(c, DOWN, buff=0.25)
        self.play(FadeIn(a), FadeIn(b), run_time=0.6)
        self.wait(5.0)
        self.play(FadeIn(c), FadeIn(d), run_time=0.6)
        self.wait(6.8)
        self.play(FadeOut(a), FadeOut(b), FadeOut(c), FadeOut(d), run_time=0.5)
        self.wait(0.3)
