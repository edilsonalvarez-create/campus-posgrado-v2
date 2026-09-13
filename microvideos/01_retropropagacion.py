"""Vídeo 1 — Retropropagación (~110 s). III L6 + repaso VI L1."""

from manim import *

from style import BG, BLUE, CORAL, ERR, GOLD, INK, LINE, MUTED, OK, T, caption, neuron


class Retropropagacion(Scene):
    def construct(self):
        self.camera.background_color = BG
        self.titulo()
        self.perceptron()
        net = self.capas()
        self.forward(net)
        self.backward(net)
        self.cierre(net)

    def titulo(self):
        title = T("Retropropagación", 56)
        sub = T("Cómo una red aprende de sus errores", 28, MUTED)
        sub.next_to(title, DOWN, buff=0.35)
        self.play(Write(title), run_time=1.6)
        self.play(FadeIn(sub, shift=UP * 0.15), run_time=0.8)
        self.wait(5.2)
        self.play(FadeOut(title), FadeOut(sub), run_time=0.4)

    def perceptron(self):
        xs = VGroup(*[neuron(BLUE) for _ in range(3)]).arrange(DOWN, buff=0.45).shift(LEFT * 4.2)
        labels = VGroup(*[T(n, 20, MUTED).next_to(c, LEFT, buff=0.18) for n, c in zip(("x1", "x2", "x3"), xs)])
        core = neuron(GOLD, 0.42)
        act = neuron(CORAL, 0.36).shift(RIGHT * 2.1)
        out = T("ŷ", 32, INK).shift(RIGHT * 4.0)
        w_arrows = VGroup(*[Arrow(c.get_right(), core.get_left(), buff=0.08, color=LINE, stroke_width=2) for c in xs])
        w_txt = VGroup(*[
            T(w, 16, GOLD).next_to(c, RIGHT, buff=0.10).shift(UP * 0.22)
            for w, c in zip(("w1", "w2", "w3"), xs)
        ])
        a1 = Arrow(core.get_right(), act.get_left(), buff=0.08, color=LINE, stroke_width=2)
        a2 = Arrow(act.get_right(), out.get_left(), buff=0.12, color=CORAL, stroke_width=2)
        sigma = T("Σ", 26, GOLD).move_to(core)
        f = T("f", 22, CORAL).move_to(act)
        cap = caption("Un perceptrón: entradas × pesos → suma → activación → salida")

        self.play(FadeIn(xs), FadeIn(labels), run_time=1.2)
        self.play(GrowArrow(w_arrows[0]), GrowArrow(w_arrows[1]), GrowArrow(w_arrows[2]), FadeIn(w_txt), run_time=1.4)
        self.play(FadeIn(core), FadeIn(sigma), run_time=0.6)
        self.play(GrowArrow(a1), FadeIn(act), FadeIn(f), run_time=0.8)
        self.play(GrowArrow(a2), FadeIn(out), FadeIn(cap), run_time=0.8)
        self.wait(6.0)

        limit = T("Un solo perceptrón solo separa con una línea recta.", 28, ERR)
        limit.to_edge(UP, buff=0.4)
        self.play(FadeIn(limit), run_time=0.6)
        self.wait(8.0)
        self.play(
            FadeOut(xs), FadeOut(labels), FadeOut(w_arrows), FadeOut(w_txt),
            FadeOut(core), FadeOut(sigma), FadeOut(act), FadeOut(f),
            FadeOut(out), FadeOut(a1), FadeOut(a2), FadeOut(cap), FadeOut(limit),
            run_time=0.5,
        )

    def _layer(self, n, x, color):
        g = VGroup(*[neuron(color) for _ in range(n)]).arrange(DOWN, buff=0.38)
        g.shift(RIGHT * x)
        return g

    def _wires(self, a, b, color=LINE):
        lines = VGroup()
        for na in a:
            for nb in b:
                lines.add(Line(na.get_right(), nb.get_left(), stroke_width=1.6, color=color))
        return lines

    def capas(self):
        inp = self._layer(3, -4.2, BLUE)
        hid = self._layer(4, 0.0, GOLD)
        out = self._layer(2, 4.2, CORAL)
        w1 = self._wires(inp, hid)
        w2 = self._wires(hid, out)
        labs = VGroup(
            T("entrada", 20, MUTED).next_to(inp, DOWN, buff=0.35),
            T("oculta", 20, MUTED).next_to(hid, DOWN, buff=0.35),
            T("salida", 20, MUTED).next_to(out, DOWN, buff=0.35),
        )
        cap = caption("Tres capas. Sin no linealidad entre ellas, apilar no sirve de nada.")
        self.play(FadeIn(inp), FadeIn(hid), FadeIn(out), run_time=1.2)
        self.play(Create(w1), Create(w2), FadeIn(labs), run_time=1.6)
        self.play(FadeIn(cap), run_time=0.5)
        self.wait(14.2)
        self.play(FadeOut(cap), run_time=0.3)
        return {"inp": inp, "hid": hid, "out": out, "w1": w1, "w2": w2, "labs": labs}

    def _flash(self, wires, color, reverse=False):
        items = list(wires)
        if reverse:
            items = items[::-1]
        anims = [ShowPassingFlash(l.copy().set_color(color).set_stroke(width=4), time_width=0.45) for l in items]
        return AnimationGroup(*anims, lag_ratio=0.015)

    def forward(self, net):
        pred = T("predicción  ŷ", 26, CORAL).next_to(net["out"], RIGHT, buff=0.45)
        truth = T("correcta  y*", 26, OK).next_to(pred, DOWN, buff=0.25)
        err = T("error = ŷ − y*", 30, ERR).to_edge(UP, buff=0.4)
        cap = caption("Paso hacia adelante: los datos cruzan la red y se compara con la verdad.")
        self.play(self._flash(net["w1"], GOLD), run_time=1.6)
        self.play(self._flash(net["w2"], CORAL), run_time=1.4)
        self.play(FadeIn(pred, shift=RIGHT * 0.2), run_time=0.5)
        self.play(FadeIn(truth), FadeIn(cap), run_time=0.6)
        self.wait(8.0)
        self.play(FadeIn(err), run_time=0.5)
        self.wait(8.4)
        self.play(FadeOut(pred), FadeOut(truth), FadeOut(cap), run_time=0.3)
        net["err"] = err

    def backward(self, net):
        cap = caption("El error viaja hacia atrás. Cada peso se ajusta un poco. Eso es retropropagación.")
        self.play(FadeIn(cap), net["err"].animate.set_color(CORAL), run_time=0.5)
        self.play(self._flash(net["w2"], CORAL, reverse=True), run_time=1.8)
        self.play(Indicate(net["hid"], color=CORAL, scale_factor=1.05), run_time=0.8)
        self.play(self._flash(net["w1"], GOLD, reverse=True), run_time=1.8)
        self.play(
            net["w1"].animate.set_stroke(width=2.4, color=GOLD),
            net["w2"].animate.set_stroke(width=2.4, color=CORAL),
            run_time=1.2,
        )
        self.wait(18.4)
        self.play(FadeOut(cap), FadeOut(net["err"]), run_time=0.4)

    def cierre(self, net):
        parts = VGroup(net["inp"], net["hid"], net["out"], net["w1"], net["w2"], net["labs"])
        line = T("Millones de veces. Ese es el aprendizaje profundo.", 32, INK)
        line.to_edge(UP, buff=0.45)
        self.play(FadeIn(line), run_time=0.6)
        self.play(self._flash(net["w1"], GOLD), run_time=0.9)
        self.play(self._flash(net["w2"], CORAL), run_time=0.8)
        self.play(self._flash(net["w2"], CORAL, reverse=True), run_time=0.8)
        self.play(self._flash(net["w1"], GOLD, reverse=True), run_time=0.9)
        note = T("De una pieza defectuosa a un modelo de lenguaje.", 24, MUTED)
        note.next_to(line, DOWN, buff=0.25)
        self.play(FadeIn(note), run_time=0.5)
        self.wait(8.5)
        self.play(FadeOut(parts), FadeOut(line), FadeOut(note), run_time=0.6)
        self.wait(0.4)
