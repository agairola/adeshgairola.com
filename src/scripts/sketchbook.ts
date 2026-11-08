// The sketchbook: one section on screen at a time.
// - A WebGL sheet of paper fills the screen and "boils" on three frames, the way
//   hand-drawn animation does.
// - Each section has a line drawing, drawn with a steady but shaky pen on a 2D
//   canvas. It draws itself on when the section opens and boils on the same clock.
// - Words type on with a person's pauses. "… more" opens the detail.
// - The scribbled dot swaps the two colours (paper and ink) for another light pair.
// Section links are real URLs; this script swaps sections in place and keeps
// history in sync, so the site still works without it.
// - The ♪ button turns on music and sound effects (src/scripts/sound.ts). Its ink line
//   moves with the music and lies flat when it is off. The pen makes a graphite sound
//   while a drawing draws on. While the coffee brews on hello, the steam over the mug stirs.

import { DOODLES } from './doodles';
import { Sound } from './sound';

type RGB = [number, number, number];
type Pt = [number, number];
type Prepared = { s: Pt[][]; a: Pt[][] };

const PAL: [string, string][] = [
	['#FCFBF8', '#26231F'],
	['#E3ECE6', '#24453A'],
	['#DCEDE5', '#5C3A2E'],
	['#CFE0EE', '#22324A'],
];
const ACC = ['#EDAA7D', '#EBCB72', '#9DBF9E', '#8DB8D8', '#B6A4D6', '#E8A3A0'];
const SEEDS = [1, 7, 13];
const BOIL_MS = 140;
const REVEAL_MS = 1100;

const FRAG = `precision mediump float;
uniform vec2 uRes; uniform float uDpr; uniform float uSeed;
uniform vec3 uBg; uniform vec3 uInk;
float h(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float n(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(h(i),h(i+vec2(1.0,0.0)),f.x),mix(h(i+vec2(0.0,1.0)),h(i+vec2(1.0,1.0)),f.x),f.y);}
float fbm(vec2 p){float v=0.5*n(p);p=p*2.03+7.1;v+=0.25*n(p);p=p*2.01+3.7;v+=0.125*n(p);return v/0.875;}
void main(){
  vec2 px=vec2(gl_FragCoord.x,uRes.y-gl_FragCoord.y)/uDpr;
  vec2 q0=gl_FragCoord.xy/uRes;
  float tooth=fbm(px*0.09)*0.6+n(px*0.55)*0.4;
  float big=fbm(px*0.0035+2.0);
  vec3 col=uBg*(0.99+(tooth-0.5)*0.045+(big-0.5)*0.03);
  float fib=smoothstep(0.8,0.95,n(vec2(dot(px,vec2(0.94,0.34))*0.035,dot(px,vec2(-0.34,0.94))*0.9)));
  col=mix(col,uInk,fib*0.03);
  col+=(h(floor(px*0.8)+uSeed*17.0)-0.5)*0.02;
  col*=1.0-0.035*pow(length(q0-0.5)*1.4,2.0);
  gl_FragColor=vec4(col,1.0);
}`;

const rgb = (s: string): RGB => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16) / 255) as RGB;
const hexOf = (c: RGB): string =>
	'#' + c.map((v) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0')).join('');
const mixC = (a: RGB, b: RGB, t: number): RGB => a.map((v, i) => v + (b[i] - v) * t) as RGB;
const lin = (v: number) => (v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92);
const lum = (c: RGB) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
const contrast = (a: RGB, b: RGB) => {
	const x = lum(a);
	const y = lum(b);
	return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};
const hsv = (hh: number, s: number, v: number): RGB => {
	const f = (k0: number) => {
		const k = (k0 + hh * 6) % 6;
		return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
	};
	return [f(5), f(3), f(1)];
};
const fract = (x: number) => x - Math.floor(x);
const hash1 = (x: number) => fract(Math.sin(x * 12.9898) * 43758.5453);
const noise1 = (x: number) => {
	const i = Math.floor(x);
	const f = x - i;
	const u = f * f * (3 - 2 * f);
	return hash1(i) + (hash1(i + 1) - hash1(i)) * u;
};
const hash2 = (x: number, y: number, k: number) => fract(Math.sin(x * 12.9898 + y * 78.233 + k) * 43758.5453) - 0.5;
const ease = (t: number) => 1 - (1 - t) * (1 - t);

/** A pale ground with a soft dark ink of the same hue, at 7:1 or better. Always light. */
function randomPale(): [string, string] {
	for (let t = 0; t < 40; t++) {
		const hh = Math.random();
		const bg = hsv(hh, 0.04 + Math.random() * 0.08, 0.93 + Math.random() * 0.04);
		const ink = hsv((hh + 0.03) % 1, 0.35 + Math.random() * 0.3, 0.15 + Math.random() * 0.12);
		if (contrast(bg, ink) >= 7) return [hexOf(bg), hexOf(ink)];
	}
	return PAL[0];
}

function seg(a: Pt, b: Pt, n: number): Pt[] {
	const out: Pt[] = [];
	for (let i = 0; i <= n; i++) out.push([a[0] + ((b[0] - a[0]) * i) / n, a[1] + ((b[1] - a[1]) * i) / n]);
	return out;
}

/** The pen: a slow wobble along the line plus a faint tremble per point. */
function jit(pts: Pt[], seed: number, amp: number, sid: number): Pt[] {
	return pts.map((p, i) => [
		p[0] + amp * ((noise1(i * 0.15 + seed * 31.7 + sid * 5.3) - 0.5) * 2 + hash2(p[0], p[1], seed) * 0.35),
		p[1] + amp * ((noise1(i * 0.15 + seed * 17.3 + sid * 9.1 + 40) - 0.5) * 2 + hash2(p[1], p[0], seed + 3) * 0.35),
	]);
}

function trace(ctx: CanvasRenderingContext2D, pts: Pt[], ox: number, oy: number, s: number, upto = pts.length) {
	ctx.beginPath();
	for (let i = 0; i < upto; i++) {
		const x = ox + pts[i][0] * s;
		const y = oy + pts[i][1] * s;
		if (i) ctx.lineTo(x, y);
		else ctx.moveTo(x, y);
	}
}

const SYDNEY = new Intl.DateTimeFormat('en-AU', {
	timeZone: 'Australia/Sydney',
	hour: 'numeric',
	minute: 'numeric',
	second: 'numeric',
	hourCycle: 'h23',
});

/**
 * The clock's two hands at the time in Sydney right now, as pen strokes from the
 * centre (100, 74) out: hour 26 long, minute 38 long, 12 o'clock straight up.
 */
function sydneyNow() {
	const parts = SYDNEY.formatToParts(new Date());
	const part = (t: string) => Number(parts.find((p) => p.type === t)?.value || 0);
	return { h: part('hour'), m: part('minute'), sec: part('second') };
}

/** The label under the clock, in the site's lowercase voice: "2:12am in sydney". */
function sydneyLabel(): string {
	const { h, m } = sydneyNow();
	return `${h % 12 || 12}:${String(m).padStart(2, '0')}${h < 12 ? 'am' : 'pm'} in sydney`;
}

function sydneyHands(): Pt[][] {
	const { h, m, sec } = sydneyNow();
	const hand = (turn: number, len: number): Pt[] => {
		const a = turn * Math.PI * 2;
		const n = Math.ceil(len / 2);
		const out: Pt[] = [];
		for (let i = 0; i <= n; i++) out.push([100 + Math.sin(a) * len * (i / n), 74 - Math.cos(a) * len * (i / n)]);
		return out;
	};
	return [hand(((h % 12) + m / 60) / 12, 26), hand((m + sec / 60) / 60, 38)];
}

/** Sample every drawing's paths into points once, with a hidden SVG path. */
function prepare(): Record<string, Prepared> {
	const NS = 'http://www.w3.org/2000/svg';
	const svg = document.createElementNS(NS, 'svg');
	svg.setAttribute('aria-hidden', 'true');
	svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
	const p = document.createElementNS(NS, 'path');
	svg.appendChild(p);
	document.body.appendChild(svg);
	const sample = (d: string): Pt[] => {
		p.setAttribute('d', d);
		const L = p.getTotalLength();
		const n = Math.max(2, Math.ceil(L / 2));
		const out: Pt[] = [];
		for (let i = 0; i <= n; i++) {
			const q = p.getPointAtLength((L * i) / n);
			out.push([q.x, q.y]);
		}
		return out;
	};
	const split = (d: string) => d.split(/(?=M)/).map((s) => s.trim()).filter(Boolean);
	const out: Record<string, Prepared> = {};
	for (const [k, D] of Object.entries(DOODLES)) {
		out[k] = { s: D.s.flatMap(split).map(sample), a: D.a.flatMap(split).map(sample) };
	}
	svg.remove();
	return out;
}

class Paper {
	private gl: WebGLRenderingContext;
	private u: Record<string, WebGLUniformLocation | null>;

	private constructor(private canvas: HTMLCanvasElement, gl: WebGLRenderingContext, prog: WebGLProgram) {
		this.gl = gl;
		const u = (name: string) => gl.getUniformLocation(prog, name);
		this.u = { res: u('uRes'), dpr: u('uDpr'), seed: u('uSeed'), bg: u('uBg'), ink: u('uInk') };
	}

	static create(canvas: HTMLCanvasElement): Paper | null {
		let gl: WebGLRenderingContext | null = null;
		try {
			gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false });
		} catch {
			gl = null;
		}
		if (!gl) return null;
		const make = (type: number, src: string) => {
			const sh = gl.createShader(type);
			if (!sh) return null;
			gl.shaderSource(sh, src);
			gl.compileShader(sh);
			return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null;
		};
		const v = make(gl.VERTEX_SHADER, 'attribute vec2 a;void main(){gl_Position=vec4(a,0.0,1.0);}');
		const f = make(gl.FRAGMENT_SHADER, FRAG);
		const prog = gl.createProgram();
		if (!v || !f || !prog) return null;
		gl.attachShader(prog, v);
		gl.attachShader(prog, f);
		gl.linkProgram(prog);
		if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
		gl.useProgram(prog);
		gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
		const loc = gl.getAttribLocation(prog, 'a');
		gl.enableVertexAttribArray(loc);
		gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
		return new Paper(canvas, gl, prog);
	}

	draw(frame: number, bg: RGB, ink: RGB) {
		const { gl, canvas: c } = this;
		if (!c.clientWidth || !c.clientHeight) return;
		const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
		const W = Math.round(c.clientWidth * dpr);
		const H = Math.round(c.clientHeight * dpr);
		if (c.width !== W || c.height !== H) {
			c.width = W;
			c.height = H;
		}
		gl.viewport(0, 0, W, H);
		gl.uniform2f(this.u.res, W, H);
		gl.uniform1f(this.u.dpr, dpr);
		gl.uniform1f(this.u.seed, frame + 1);
		gl.uniform3fv(this.u.bg, bg);
		gl.uniform3fv(this.u.ink, ink);
		gl.drawArrays(gl.TRIANGLES, 0, 3);
	}
}

class Sketchbook {
	private reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	private accIdx = Math.floor(Date.now() / 86_400_000) % ACC.length;
	private palIdx = 0;
	private cur = { bg: rgb(PAL[0][0]), ink: rgb(PAL[0][1]), acc: rgb(ACC[this.accIdx]) };
	private frame = 0;
	private reveal = 1;
	private revealRaf = 0;
	private typeT = 0;
	private active = '';
	private font = '';
	private prep = prepare();
	private paper: Paper | null;
	private stage: HTMLCanvasElement;
	private canvases: HTMLCanvasElement[];
	private sections: HTMLElement[];
	private navs: HTMLAnchorElement[];
	private heading: HTMLElement | null;
	private caret = Object.assign(document.createElement('i'), { className: 'caret' });
	private career: [string, string][];
	private sound = new Sound(this.reduced);
	private soundBtn: HTMLButtonElement | null;
	private wave: HTMLCanvasElement | null = null;
	private waveAmp = 0;
	private wavePhase = 0;

	constructor(private root: HTMLElement) {
		const paperEl = root.querySelector<HTMLCanvasElement>('[data-paper]');
		this.paper = paperEl ? Paper.create(paperEl) : null;
		if (!this.paper) root.classList.add('no-gl');
		this.stage = root.querySelector<HTMLCanvasElement>('[data-stage]')!;
		this.canvases = Array.from(root.querySelectorAll<HTMLCanvasElement>('canvas[data-doodle], [data-stage]'));
		this.sections = Array.from(root.querySelectorAll<HTMLElement>('[data-section]'));
		this.navs = Array.from(root.querySelectorAll<HTMLAnchorElement>('[data-bar] a[data-go]'));
		this.heading = root.querySelector<HTMLElement>('[data-heading]');
		this.career = JSON.parse(this.stage.dataset.career || '[]');
		this.soundBtn = root.querySelector<HTMLButtonElement>('[data-sound]');
		this.wave = root.querySelector<HTMLCanvasElement>('[data-wave]');
		// Sound that was on stays on across reloads. If the browser holds audio back
		// until a tap, the button still reads on and its line stays flat until it plays.
		if (this.sound.remembered) this.sound.set(true);
		this.syncSound(this.sound.on);
		this.applyVars();

		root.addEventListener('click', (e) => this.onClick(e));
		window.addEventListener('popstate', () => this.show(this.idFromPath(location.pathname), false));
		const ro = new ResizeObserver(() => this.drawAll());
		ro.observe(root);
		ro.observe(this.stage);
		if (!this.reduced) {
			window.setInterval(() => {
				if (document.hidden) return;
				this.frame = (this.frame + 1) % 3;
				this.drawAll();
			}, BOIL_MS);
		}
		// With reduced motion nothing redraws on the boil clock, so move the clock's hands every 20s.
		if (this.reduced) {
			window.setInterval(() => {
				if (!document.hidden && this.active === 'now') this.drawAll();
			}, 20000);
		}
		const start = () => this.show(root.dataset.active || 'hello', false, true);
		document.fonts.ready.then(start, start);
		this.drawAll();
	}

	private idFromPath(path: string): string {
		const clean = path.replace(/\/+$/, '') || '/';
		const hit = this.sections.find((s) => s.dataset.path === clean);
		return hit?.dataset.section || 'hello';
	}

	private onClick(e: MouseEvent) {
		const t = e.target as Element | null;
		if (!t) return;
		const go = t.closest<HTMLAnchorElement>('a[data-go]');
		if (go) {
			if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
			e.preventDefault();
			this.show(go.dataset.go || 'hello', true);
			return;
		}
		if (t.closest('[data-more]')) return this.setOpen(!this.root.classList.contains('open'));
		if (t.closest('[data-sound]')) {
			const on = this.sound.toggle();
			this.syncSound(on);
			// Turning sound on replays the current lines, so the typing is heard from the start.
			const cur = this.sections.find((s) => s.dataset.section === this.active);
			if (on && cur) this.type(cur);
			return;
		}
		if (t.closest('[data-dot]')) this.shuffle();
	}

	/** One section at a time: the drawing redraws itself and the words type on. */
	private show(id: string, push: boolean, first = false) {
		if (id === this.active && !first) {
			if (this.root.classList.contains('open')) this.setOpen(false);
			return;
		}
		const next = this.sections.find((s) => s.dataset.section === id);
		if (!next) return;
		this.active = id;
		this.setOpen(false);
		for (const s of this.sections) s.hidden = s !== next;
		for (const a of this.navs) {
			if (a.dataset.go === id) a.setAttribute('aria-current', 'page');
			else a.removeAttribute('aria-current');
		}
		this.stage.dataset.doodle = next.dataset.drawing || 'desk';
		if (this.heading) this.heading.textContent = next.dataset.heading || '';
		if (push) history.pushState(null, '', next.dataset.path || '/');
		document.title = next.dataset.title || document.title;
		this.startReveal();
		this.type(next);
		this.sound.show(id);
	}

	private syncSound(on: boolean) {
		if (!this.soundBtn) return;
		this.soundBtn.setAttribute('aria-pressed', String(on));
		this.soundBtn.title = on ? 'sound on' : 'sound off';
		this.drawWave();
	}

	private setOpen(open: boolean) {
		if (open !== this.root.classList.contains('open')) this.sound.more(open);
		this.root.classList.toggle('open', open);
		this.root.querySelectorAll<HTMLButtonElement>('[data-more]').forEach((b) => {
			b.setAttribute('aria-expanded', String(open));
			b.textContent = open ? 'less' : '… more';
		});
	}

	private startReveal() {
		cancelAnimationFrame(this.revealRaf);
		if (this.reduced) {
			this.reveal = 1;
			this.drawAll();
			return;
		}
		this.reveal = 0;
		const t0 = performance.now();
		const tick = (now: number) => {
			this.reveal = Math.min(1, (now - t0) / REVEAL_MS);
			this.drawDoodle(this.stage);
			// The pen slows as the drawing finishes (the reveal eases out), and lifts
			// briefly now and then, like starting a new stroke.
			const lift = Math.sin(this.reveal * 37) > 0.85 ? 0.15 : 1;
			this.sound.pen(this.reveal < 1 ? (1 - this.reveal) * lift : 0);
			if (this.reveal < 1) this.revealRaf = requestAnimationFrame(tick);
		};
		this.revealRaf = requestAnimationFrame(tick);
	}

	private type(section: HTMLElement) {
		window.clearTimeout(this.typeT);
		const parts = Array.from(section.querySelectorAll<HTMLElement>('.line')).map((el) => ({
			text: el.querySelector('.ghost')?.textContent || '',
			out: el.querySelector<HTMLElement>('.typed')!,
		}));
		if (this.reduced) {
			for (const p of parts) p.out.textContent = p.text;
			return;
		}
		for (const p of parts) p.out.textContent = '';
		const caret = this.caret;
		caret.classList.remove('gone');
		let li = 0;
		let ci = 0;
		const step = () => {
			const p = parts[li];
			ci++;
			p.out.textContent = p.text.slice(0, ci);
			p.out.appendChild(caret);
			const ch = p.text[ci - 1];
			this.sound.key(ch);
			let delay = 14 + Math.random() * 14;
			if (ch === ',' || ch === ':') delay += 90;
			if (ch === '.' || ch === '?' || ch === '!') delay += 160;
			if (ch === ' ') delay += 8;
			if (ci >= p.text.length) {
				li++;
				ci = 0;
				delay += 140;
				if (li >= parts.length) {
					this.typeT = window.setTimeout(() => caret.classList.add('gone'), 1400);
					return;
				}
			}
			this.typeT = window.setTimeout(step, delay);
		};
		this.typeT = window.setTimeout(step, 350);
	}

	private drawAll() {
		this.paper?.draw(this.frame, this.cur.bg, this.cur.ink);
		for (const cv of this.canvases) this.drawDoodle(cv);
		this.drawWave();
	}

	/** The ♪ button's ink line: it moves with the music and lies flat when sound is off. */
	private drawWave() {
		const cv = this.wave;
		if (!cv) return;
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		const W = cv.clientWidth;
		const H = cv.clientHeight;
		if (!W || !H) return;
		if (cv.width !== Math.round(W * dpr)) {
			cv.width = Math.round(W * dpr);
			cv.height = Math.round(H * dpr);
		}
		const ctx = cv.getContext('2d');
		if (!ctx) return;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.clearRect(0, 0, W, H);
		const on = this.sound.on;
		const live = this.sound.playing;
		// Ease toward the music's level so the line swells, never jumps.
		const target = live ? (this.reduced ? 0.5 : Math.max(0.25, this.sound.level())) : 0;
		this.waveAmp = this.reduced ? target : this.waveAmp + (target - this.waveAmp) * 0.35;
		if (!this.reduced) this.wavePhase += 1.3;
		const seed = SEEDS[this.frame];
		const pts: Pt[] = [];
		const n = 24;
		for (let i = 0; i <= n; i++) {
			const x = 1 + (i / n) * (W - 2);
			const env = Math.sin((i / n) * Math.PI);
			const y = H / 2 + Math.sin(i * 0.9 + this.wavePhase) * env * this.waveAmp * (H / 2 - 2);
			pts.push([x, y]);
		}
		ctx.strokeStyle = hexOf(on ? this.cur.ink : mixC(this.cur.ink, this.cur.bg, 0.45));
		ctx.lineWidth = 1.4;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		trace(ctx, jit(pts, seed, 0.35, 90), 0, 0, 1);
		ctx.stroke();
	}

	private drawDoodle(cv: HTMLCanvasElement) {
		const kind = cv.dataset.doodle || '';
		const W = cv.clientWidth;
		const H = cv.clientHeight;
		if (!W || !H) return;
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		const pw = Math.round(W * dpr);
		const ph = Math.round(H * dpr);
		if (cv.width !== pw || cv.height !== ph) {
			cv.width = pw;
			cv.height = ph;
		}
		const ctx = cv.getContext('2d');
		if (!ctx) return;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.clearRect(0, 0, W, H);
		const seed = SEEDS[this.frame];
		const ink = hexOf(this.cur.ink);
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		ctx.strokeStyle = ink;
		ctx.lineWidth = 1.6;
		const rv = cv === this.stage ? ease(this.reveal) : 1;
		if (kind === 'dot') return this.drawDot(ctx, W, H, seed);
		if (kind === 'oval') return this.drawOval(ctx, W, H, seed);
		if (kind === 'ribbon') return this.drawRibbon(ctx, W, H, seed, rv);
		const D = DOODLES[kind];
		let P = this.prep[kind];
		if (!D || !P) return;
		// The clock on now always shows the time in Sydney: its last two strokes are the hands.
		if (kind === 'clock') P = { ...P, s: [...P.s.slice(0, -2), ...sydneyHands()] };
		const s = Math.min((W * 0.8) / D.w, (H * 0.86) / D.h, 2.3);
		const ox = (W - D.w * s) / 2;
		const oy = (H - D.h * s) * 0.6;
		const amp = 0.7;
		const fillA = Math.max(0, Math.min(1, (rv - 0.8) / 0.2));
		if (fillA) {
			ctx.fillStyle = hexOf(this.cur.acc);
			ctx.globalAlpha = 0.8 * fillA;
			P.a.forEach((pts, i) => {
				trace(ctx, jit(pts, seed, amp, i + 50), ox + 1.4, oy + 1, s);
				ctx.closePath();
				ctx.fill();
			});
			ctx.globalAlpha = 1;
		}
		const total = P.s.reduce((t, pts) => t + pts.length, 0);
		let budget = Math.round(rv * total);
		// The desk's steam wisps (strokes 9 and 10) stir while the coffee brews.
		const steam = kind === 'desk' && this.sound.brewing && !this.reduced;
		P.s.forEach((pts, i) => {
			if (budget < 2) return;
			const k = Math.min(pts.length, budget);
			budget -= pts.length;
			const a = steam && (i === 9 || i === 10) ? 2.2 : amp;
			trace(ctx, jit(pts, seed, a, i), ox, oy, s, k);
			ctx.stroke();
		});
		// Say whose time it is, under the clock, once the drawing is nearly done.
		if (kind === 'clock' && fillA) {
			const size = Math.max(14, Math.min(17, 7 * s));
			this.font ||= getComputedStyle(this.root).getPropertyValue('--font').trim() || 'sans-serif';
			ctx.font = `${size}px ${this.font}`;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'top';
			ctx.fillStyle = hexOf(mixC(this.cur.ink, this.cur.bg, 0.3));
			ctx.globalAlpha = fillA;
			ctx.fillText(sydneyLabel(), ox + 100 * s, oy + 134 * s);
			ctx.globalAlpha = 1;
		}
	}

	/** The scribbled dot: a lumpy ink disc hatched in the ground colour. */
	private drawDot(ctx: CanvasRenderingContext2D, W: number, H: number, seed: number) {
		const cx = W / 2;
		const cy = H / 2;
		const R = Math.min(W, H) / 2 - 2;
		ctx.beginPath();
		for (let i = 0; i < 64; i++) {
			const a = (i / 64) * Math.PI * 2;
			const r = R * (1 + 0.05 * Math.sin(3 * a + 0.7 + seed * 0.4) + 0.03 * Math.cos(5 * a + seed));
			const x = cx + Math.cos(a) * r;
			const y = cy + Math.sin(a) * r;
			if (i) ctx.lineTo(x, y);
			else ctx.moveTo(x, y);
		}
		ctx.closePath();
		ctx.fillStyle = hexOf(this.cur.ink);
		ctx.fill();
		ctx.save();
		ctx.clip();
		ctx.strokeStyle = hexOf(this.cur.bg);
		ctx.globalAlpha = 0.35;
		ctx.lineWidth = 1;
		for (let j = 0; j < 14; j++) {
			const k = -R * 2 + j * ((R * 4) / 13) + (seed % 3) * 0.5;
			ctx.beginPath();
			ctx.moveTo(cx - R + k, cy - R);
			ctx.lineTo(cx + R + k, cy + R);
			ctx.stroke();
		}
		ctx.restore();
	}

	/** A drawn oval that overshoots instead of closing. */
	private drawOval(ctx: CanvasRenderingContext2D, W: number, H: number, seed: number) {
		const cx = W / 2;
		const cy = H / 2;
		const rx = W / 2 - 3;
		const ry = H / 2 - 3;
		const pts: Pt[] = [];
		for (let i = 0; i <= 120; i++) {
			const a = -1.9 + (i / 120) * (Math.PI * 2 + 0.18);
			const w = (1 + 0.02 * Math.sin(3 * a + seed)) * (0.95 + (i / 120) * 0.09);
			pts.push([cx + Math.cos(a) * rx * w, cy + Math.sin(a) * ry * w]);
		}
		trace(ctx, jit(pts, seed, 0.9, 3), 0, 0, 1);
		ctx.stroke();
	}

	/** About: the career as one line with a tick per role, years written underneath. */
	private drawRibbon(ctx: CanvasRenderingContext2D, W: number, H: number, seed: number, rv: number) {
		const span = Math.min(W * 0.86, 620);
		const x0 = (W - span) / 2;
		const base = H * 0.58;
		const at = (x: number) => base + Math.sin(x * 0.02) * 2.5;
		const main: Pt[] = [];
		const n = Math.floor(span / 3);
		for (let i = 0; i <= n; i++) {
			const x = x0 + i * 3;
			main.push([x, at(x)]);
		}
		trace(ctx, jit(main, seed, 0.8, 1), 0, 0, 1, Math.max(2, Math.round(rv * main.length)));
		ctx.stroke();
		const reached = x0 + rv * span;
		const ink = hexOf(this.cur.ink);
		const soft = hexOf(mixC(this.cur.ink, this.cur.bg, 0.3));
		const fs = Math.max(13, Math.min(16, span / 40));
		const family = getComputedStyle(this.root).fontFamily;
		ctx.textAlign = 'center';
		this.career.forEach(([year, label], i) => {
			const x = x0 + ((i + 0.5) / this.career.length) * span;
			if (x > reached) return;
			const b = at(x);
			trace(ctx, jit(seg([x, b - 6], [x, b - 22], 6), seed, 0.6, i + 10), 0, 0, 1);
			ctx.stroke();
			if (i === this.career.length - 1) {
				const ring: Pt[] = [];
				for (let k = 0; k <= 24; k++) {
					const a = (k / 24) * Math.PI * 2;
					ring.push([x + Math.cos(a) * 6, b - 30 + Math.sin(a) * 6]);
				}
				const jr = jit(ring, seed, 0.5, 30);
				ctx.fillStyle = hexOf(this.cur.acc);
				trace(ctx, jr, 1.2, 1, 1);
				ctx.fill();
				trace(ctx, jr, 0, 0, 1);
				ctx.stroke();
			}
			ctx.fillStyle = ink;
			ctx.font = `600 ${fs}px ${family}`;
			ctx.fillText(year, x, b + 28);
			ctx.fillStyle = soft;
			ctx.font = `400 ${fs - 1}px ${family}`;
			ctx.fillText(label, x, b + 28 + fs * 1.35);
		});
	}

	private applyVars() {
		const st = this.root.style;
		st.setProperty('--bg', hexOf(this.cur.bg));
		st.setProperty('--ink', hexOf(this.cur.ink));
		st.setProperty('--acc', hexOf(this.cur.acc));
		document.body.style.background = hexOf(this.cur.bg);
		document.querySelector('meta[name="theme-color"]')?.setAttribute('content', hexOf(this.cur.bg));
	}

	/** Half the time the next named pair, otherwise a fresh pale pair. */
	private shuffle() {
		this.sound.shuffle();
		let pair: [string, string];
		if (Math.random() > 0.5) {
			this.palIdx = (this.palIdx + 1) % PAL.length;
			pair = PAL[this.palIdx];
		} else pair = randomPale();
		this.accIdx = (this.accIdx + 1) % ACC.length;
		const from = { bg: this.cur.bg, ink: this.cur.ink, acc: this.cur.acc };
		const to = { bg: rgb(pair[0]), ink: rgb(pair[1]), acc: rgb(ACC[this.accIdx]) };
		const t0 = performance.now();
		const tick = (now: number) => {
			const t = this.reduced ? 1 : Math.min(1, (now - t0) / 500);
			const e = t * t * (3 - 2 * t);
			this.cur = { bg: mixC(from.bg, to.bg, e), ink: mixC(from.ink, to.ink, e), acc: mixC(from.acc, to.acc, e) };
			this.applyVars();
			this.drawAll();
			if (t < 1) requestAnimationFrame(tick);
		};
		requestAnimationFrame(tick);
	}
}

const root = document.querySelector<HTMLElement>('[data-book]');
if (root) new Sketchbook(root);
