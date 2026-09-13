"""Vídeo 3 — Arquitectura Lambda (~100 s). III L1. Cajas y flechas (equivalente al camino OBS)."""

from manim import *

from style import BG, BLUE, CORAL, GOLD, INK, MUTED, OK, T, box, caption


class Lambda(Scene):
    def construct(self):
        self.camera.background_color = BG
        self.titulo()
        data = self.entrada()
        batch = self.batch(data)
        stream = self.stream(data)
        self.servicio(data, batch, stream)
        self.cierre()

    def titulo(self):
        title = T("Arquitectura Lambda", 52)
        sub = T("Lotes exactos y flujo inmediato, en paralelo", 26, MUTED)
        sub.next_to(title, DOWN, buff=0.35)
        self.play(Write(title), run_time=1.5)
        self.play(FadeIn(sub, shift=UP * 0.15), run_time=0.7)
        self.wait(5.4)
        self.play(FadeOut(title), FadeOut(sub), run_time=0.4)

    def entrada(self):
        data = box("Datos", "un solo punto de entrada", width=3.0, height=1.5, color=BLUE)
        data.shift(LEFT * 4.6)
        cap = caption("Los datos entran por un solo sitio. A partir de ahí, dos caminos.")
        self.play(FadeIn(data, shift=RIGHT * 0.2), FadeIn(cap), run_time=1.0)
        self.wait(14.6)
        self.play(FadeOut(cap), run_time=0.3)
        return data

    def batch(self, data):
        batch = box("Capa batch", "histórico completo · periódico · exacto", width=4.2, height=1.6, color=GOLD)
        batch.shift(UP * 1.55 + RIGHT * 0.4)
        arrow = Arrow(data.get_right() + UP * 0.15, batch.get_left(), buff=0.12, color=GOLD, stroke_width=3)
        cap = caption("Procesa todo el histórico con calma. Exacto, pero llega con el siguiente ciclo.")
        self.play(GrowArrow(arrow), FadeIn(batch, shift=RIGHT * 0.15), FadeIn(cap), run_time=1.2)
        night = T("esta noche / el fin de semana", 20, MUTED).next_to(batch, DOWN, buff=0.22)
        self.play(FadeIn(night), run_time=0.5)
        self.wait(19.8)
        self.play(FadeOut(cap), FadeOut(night), run_time=0.3)
        return {"box": batch, "arrow": arrow}

    def stream(self, data):
        stream = box("Capa streaming", "cada evento · ahora · aproximado", width=4.2, height=1.6, color=CORAL)
        stream.shift(DOWN * 1.55 + RIGHT * 0.4)
        arrow = Arrow(data.get_right() + DOWN * 0.15, stream.get_left(), buff=0.12, color=CORAL, stroke_width=3)
        cap = caption("Cada evento en el momento. Sirve para decidir ahora, no para el informe mensual.")
        self.play(GrowArrow(arrow), FadeIn(stream, shift=RIGHT * 0.15), FadeIn(cap), run_time=1.2)
        now = T("casi instantáneo", 20, CORAL).next_to(stream, DOWN, buff=0.22)
        self.play(FadeIn(now), run_time=0.5)
        self.wait(17.8)
        self.play(FadeOut(cap), FadeOut(now), run_time=0.3)
        return {"box": stream, "arrow": arrow}

    def servicio(self, data, batch, stream):
        serve = box("Capa de servicio", "vista unificada para quien consulta", width=3.6, height=1.7, color=OK)
        serve.shift(RIGHT * 5.1)
        a1 = Arrow(batch["box"].get_right(), serve.get_left() + UP * 0.25, buff=0.12, color=GOLD, stroke_width=2.5)
        a2 = Arrow(stream["box"].get_right(), serve.get_left() + DOWN * 0.25, buff=0.12, color=CORAL, stroke_width=2.5)
        cap = caption("Lo exacto del batch más lo reciente del flujo, en una sola consulta.")
        self.play(GrowArrow(a1), GrowArrow(a2), FadeIn(serve), FadeIn(cap), run_time=1.4)
        self.wait(16.2)
        self.play(FadeOut(cap), run_time=0.3)
        self.data = data
        self.batch_g = VGroup(batch["box"], batch["arrow"])
        self.stream_g = VGroup(stream["box"], stream["arrow"])
        self.serve_g = VGroup(serve, a1, a2)

    def cierre(self):
        self.play(
            FadeOut(self.data), FadeOut(self.batch_g), FadeOut(self.stream_g), FadeOut(self.serve_g),
            run_time=0.5,
        )
        warn = T("Potente. También cara: dos tuberías, dos fallos posibles.", 26, MUTED)
        q = T("¿La decisión de verdad no puede esperar al siguiente lote?", 28, INK)
        warn.shift(UP * 0.35)
        q.next_to(warn, DOWN, buff=0.45)
        self.play(FadeIn(warn), run_time=0.5)
        self.wait(6.0)
        self.play(FadeIn(q), run_time=0.5)
        self.wait(8.4)
        self.play(FadeOut(warn), FadeOut(q), run_time=0.5)
        self.wait(0.3)
