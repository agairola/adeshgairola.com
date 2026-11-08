// Sound for the sketchbook. Off until the visitor turns it on with the "♪" button
// in the header; the choice is remembered in this browser. Everything is made live
// with Web Audio: no audio files, no library.
//
// Three layers:
// - music: a coffee house. In the daytime it is lo-fi: dusty electric piano, a lazy
//   swung beat at about 72 BPM, round bass, tape wobble and record crackle, with the
//   room around it (murmur, a cup on a saucer, the espresso machine now and then).
//   After dark it slides into a late-night jazz bar: brushes and a ride cymbal,
//   walking bass, piano comping over ii-V-I changes, rain tapping on the window. The slide
//   follows the visitor's clock, over two hours at dusk and at dawn (night()).
//   Add ?vibe=day or ?vibe=night to the URL to hear one or the other.
//   Each section only changes the tone and how often a short piano fill plays (MOOD).
// - scenes: a quiet loop that belongs to one section (SCENE): coffee brewing on
//   hello, a simmering flask on labs, a slow clock on now, a breeze on cocoon.
// - cues: one-off sounds timed to the drawing as it draws itself on (cue()), plus
//   the pen, soft taps as the glance lines type, the shuffle dot and the "… more" panel. Cues stay just above the music.

type Scene = 'brew' | 'flask' | 'clock' | 'garden' | 'none';
/** cutoff: how open the keys and bass sound. fills: how often a short piano fill plays (1 = normal). */
type Mood = { cutoff: number; fills: number };

/** Map: which section gets which tone, loop and cue. */
const MOOD: Record<string, Mood> = {
	hello: { cutoff: 4500, fills: 1 },
	raxit: { cutoff: 2600, fills: 0.4 },
	labs: { cutoff: 4000, fills: 0.9 },
	work: { cutoff: 3400, fills: 0.7 },
	writing: { cutoff: 3800, fills: 1 },
	now: { cutoff: 3200, fills: 0.6 },
	side: { cutoff: 5500, fills: 1.6 },
	about: { cutoff: 4200, fills: 1 },
};
const SCENE: Record<string, Scene> = { hello: 'brew', labs: 'flask', now: 'clock', side: 'garden' };

const FORCED = (() => {
	try {
		return new URLSearchParams(location.search).get('vibe');
	} catch {
		return null;
	}
})();
const hourNow = () => {
	if (FORCED === 'day') return 13;
	if (FORCED === 'night') return 23;
	const d = new Date();
	return d.getHours() + d.getMinutes() / 60;
};
/** The light: brightest after lunch, darkest after midnight. */
const daylight = () => 0.85 + 0.2 * Math.cos(((hourNow() - 13) / 24) * Math.PI * 2);
/** 0 in the daytime, 1 after dark. Slides from 5pm to 7pm, and back from 5am to 7am. */
const night = () => {
	const h = hourNow();
	if (h >= 7 && h < 17) return 0;
	if (h >= 17 && h < 19) return (h - 17) / 2;
	if (h >= 19 || h < 5) return 1;
	return 1 - (h - 5) / 2;
};

/** root: the bass note. third: 3 for minor, 4 for major. notes: the voicing. pool: notes a fill can use. */
type Chord = { name: string; root: number; third: number; notes: number[]; pool: number[] };
const CHORDS: Chord[] = [
	{ name: 'Fmaj9', root: 41, third: 4, notes: [57, 60, 64, 67], pool: [69, 72, 76, 79] },
	{ name: 'Am9', root: 45, third: 3, notes: [55, 60, 64, 71], pool: [69, 72, 76, 79] },
	{ name: 'Dm9', root: 38, third: 3, notes: [53, 57, 60, 64], pool: [69, 72, 74, 76] },
	{ name: 'Cmaj9', root: 36, third: 4, notes: [52, 55, 59, 62], pool: [67, 72, 74, 76, 79] },
	{ name: 'G69', root: 43, third: 4, notes: [59, 62, 64, 69], pool: [67, 69, 74, 76, 79] },
	{ name: 'Em7', root: 40, third: 3, notes: [55, 59, 62, 64], pool: [67, 71, 74, 76, 79] },
	// Dominants for the jazz turnarounds, voiced without the root (the bass has it).
	{ name: 'G13', root: 43, third: 4, notes: [53, 57, 59, 64], pool: [67, 71, 74, 76] },
	{ name: 'A13', root: 45, third: 4, notes: [55, 59, 61, 66], pool: [69, 73, 76, 78] },
];
const byName = (n: string) => CHORDS.find((c) => c.name === n) || CHORDS[0];
/** Lo-fi loops four chords twice; the jazz bar plays ii-V-I turnarounds once each. */
const LOFI = [
	['Fmaj9', 'Em7', 'Dm9', 'Cmaj9'],
	['Dm9', 'G69', 'Cmaj9', 'Am9'],
	['Fmaj9', 'G69', 'Em7', 'Am9'],
	['Am9', 'Dm9', 'Fmaj9', 'Em7'],
];
const JAZZ = [
	['Dm9', 'G13', 'Cmaj9', 'A13'],
	['Em7', 'A13', 'Dm9', 'G13'],
	['Fmaj9', 'Em7', 'Dm9', 'G13'],
	['Cmaj9', 'Am9', 'Dm9', 'G13'],
];

const BREW_S = 30;
const KEY = 'sketchbook-sound';

const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];

/** Freeze a parameter where it is right now, mid-ramp included, so the next move has no step. */
function hold(p: AudioParam, t: number) {
	const q = p as AudioParam & { cancelAndHoldAtTime?: (t: number) => void };
	if (q.cancelAndHoldAtTime) q.cancelAndHoldAtTime(t);
	else {
		p.cancelScheduledValues(t);
		p.setValueAtTime(p.value, t);
	}
}

type ToneOpts = {
	type?: OscillatorType;
	peak: number;
	attack?: number;
	decay: number;
	glide?: number;
	glideT?: number;
	dest?: AudioNode;
	send?: number;
};
type NoiseOpts = {
	filter?: BiquadFilterType;
	f: number;
	f2?: number;
	q?: number;
	peak: number;
	attack?: number;
	dest?: AudioNode;
	send?: number;
};
/** Where a note lands in the bar: beat 0 to 3, and whether it is the swung "and" after it. */
type At = (beat: number, off?: boolean) => number;

export class Sound {
	on = false;
	/** True while the coffee is brewing; the desk drawing stirs its steam. */
	brewing = false;
	private ctx: AudioContext | null = null;
	private master!: GainNode;
	private music!: GainNode;
	private tone!: BiquadFilterNode;
	private fx!: GainNode;
	private meter!: AnalyserNode;
	private meterBuf!: Float32Array<ArrayBuffer>;
	private penGain: GainNode | null = null;
	private soft!: BiquadFilterNode;
	private verb!: GainNode;
	private white!: AudioBuffer;
	/** Lo-fi drums, and the jazz bar's brushes and ride. The day/night slide sets the mix. */
	private kitDay!: GainNode;
	private kitNight!: GainNode;
	/** The café around the music in the daytime, and rain on the window at night. */
	private roomDay!: GainNode;
	private roomNight!: GainNode;
	private section = 'hello';
	private scene: Scene = 'none';
	private chord = CHORDS[0];
	private queue: Chord[] = [];
	private beat = 60 / 72;
	private next = 0;
	private nextTick = 0;
	private nextClink = 0;
	private nextSteam = 0;
	private nextDrop = 0;
	private tock = false;
	private sched = 0;
	private showT = 0;
	private lastCue = -1;
	private brewed = false;
	private timers: number[] = [];
	private stops: ((t: number) => void)[] = [];
	private wanted = false;
	/** The section's scene waits for the browser to actually let audio play. */
	private pendingScene = false;
	private armed = false;

	constructor(private reduced: boolean) {
		try {
			this.wanted = localStorage.getItem(KEY) === 'on';
		} catch {
			this.wanted = false;
		}
		document.addEventListener('visibilitychange', () => {
			if (!this.ctx || !this.on) return;
			if (document.hidden) this.ctx.suspend();
			else this.ctx.resume();
		});
	}

	/** Remembered "on" from an earlier visit. */
	get remembered() {
		return this.wanted;
	}

	/** On, and the browser is actually letting it play (it may be waiting for a tap). */
	get playing() {
		return !!this.ctx && this.on && this.ctx.state === 'running';
	}

	toggle(): boolean {
		this.set(!this.on);
		return this.on;
	}

	set(on: boolean) {
		this.wanted = on;
		try {
			localStorage.setItem(KEY, on ? 'on' : 'off');
		} catch {
			/* private mode: fine, just not remembered */
		}
		if (on === this.on) return;
		this.on = on;
		if (on) this.start();
		else this.stop();
	}

	/** Called whenever a section opens. Settles for 250ms so fast clicking doesn't stack sounds. */
	show(id: string) {
		this.section = id;
		window.clearTimeout(this.showT);
		if (!this.on || !this.ctx) return;
		this.showT = window.setTimeout(() => {
			if (!this.on || !this.ctx || this.section !== id) return;
			this.applyMood();
			if (!this.playing) {
				this.pendingScene = true;
				return;
			}
			this.setScene(SCENE[id] || 'none');
			this.cue(id, 0.25);
		}, 250);
	}

	shuffle() {
		if (!this.playing || !this.ctx) return;
		const t = this.ctx.currentTime + 0.01;
		this.chord.pool.slice(0, 3).forEach((n, i) =>
			this.voice(mtof(n), t + i * 0.08, { type: 'triangle', peak: 0.018, attack: 0.006, decay: 1.4, send: 0.4 }),
		);
	}

	more(open: boolean) {
		if (!this.playing || !this.ctx) return;
		const t = this.ctx.currentTime + 0.01;
		this.noise(t, open ? 0.3 : 0.2, {
			filter: 'bandpass',
			f: open ? 600 : 1200,
			f2: open ? 1300 : 500,
			q: 0.8,
			peak: 0.03,
			attack: 0.05,
		});
	}

	// ---------------------------------------------------------------- engine

	private init(): boolean {
		if (this.ctx) return true;
		const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
		if (!AC) return false;
		const c = new AC();
		this.ctx = c;
		// iOS can interrupt audio (a call, Siri). Pick it back up on the next touch.
		c.onstatechange = () => {
			const st = c.state as string;
			if (this.on && !document.hidden && (st === 'interrupted' || st === 'suspended')) this.armResume();
			if (st === 'running' && this.on && this.pendingScene) {
				this.pendingScene = false;
				this.scene = 'none';
				this.setScene(SCENE[this.section] || 'none');
			}
		};

		// The compressor is only a safety net; the mix is set by the gains below.
		const comp = c.createDynamicsCompressor();
		comp.threshold.value = -8;
		comp.ratio.value = 4;
		comp.knee.value = 6;
		comp.attack.value = 0.01;
		comp.release.value = 0.3;
		comp.connect(c.destination);
		this.master = c.createGain();
		this.master.gain.value = 0;
		this.master.connect(comp);
		this.meter = c.createAnalyser();
		this.meter.fftSize = 512;
		this.meterBuf = new Float32Array(this.meter.fftSize);
		this.master.connect(this.meter);

		// Keys and bass: through a little tape wobble (a delay whose time drifts) and
		// one lowpass that sets the section's tone and breathes by ±300Hz over 30s.
		this.tone = c.createBiquadFilter();
		this.tone.type = 'lowpass';
		this.tone.frequency.value = 4500;
		this.tone.Q.value = 0.5;
		this.tone.connect(this.master);
		const breathe = c.createOscillator();
		breathe.frequency.value = 1 / 30;
		const bd = c.createGain();
		bd.gain.value = 300;
		breathe.connect(bd).connect(this.tone.frequency);
		breathe.start();
		const tape = c.createDelay(0.05);
		tape.delayTime.value = 0.012;
		tape.connect(this.tone);
		for (const [hz, depth] of [
			[0.45, 0.0012],
			[0.07, 0.002],
		]) {
			const o = c.createOscillator();
			o.frequency.value = hz;
			const g = c.createGain();
			g.gain.value = depth;
			o.connect(g).connect(tape.delayTime);
			o.start();
		}
		this.music = c.createGain();
		this.music.gain.value = 0.55;
		this.music.connect(tape);

		// Drums skip the section tone so the ride still shimmers on a dark section.
		const drumLp = c.createBiquadFilter();
		drumLp.type = 'lowpass';
		drumLp.frequency.value = 6000;
		const drums = c.createGain();
		drums.gain.value = 0.55;
		drumLp.connect(drums).connect(this.master);
		this.kitDay = c.createGain();
		this.kitDay.gain.value = 0;
		this.kitDay.connect(drumLp);
		this.kitNight = c.createGain();
		this.kitNight.gain.value = 0;
		this.kitNight.connect(drumLp);

		this.fx = c.createGain();
		this.fx.gain.value = 0.6;
		this.fx.connect(this.master);
		// Water sounds go through a soft lowpass so nothing pokes out.
		this.soft = c.createBiquadFilter();
		this.soft.type = 'lowpass';
		this.soft.frequency.value = 1500;
		this.soft.connect(this.fx);

		// A small, dark room: exponential decay (about 2s), getting duller as it
		// fades, 20ms pre-delay, and the wet signal kept between 200Hz and 3.5kHz.
		const conv = c.createConvolver();
		const len = Math.floor(c.sampleRate * 2.4);
		const ir = c.createBuffer(2, len, c.sampleRate);
		for (let ch = 0; ch < 2; ch++) {
			const d = ir.getChannelData(ch);
			let y = 0;
			for (let i = 0; i < len; i++) {
				const t = i / c.sampleRate;
				const a = 0.9 - 0.8 * (i / len);
				y += a * (Math.random() * 2 - 1 - y);
				d[i] = y * Math.exp((-6.9 * t) / 2.0);
			}
		}
		conv.buffer = ir;
		this.verb = c.createGain();
		const pre = c.createDelay(0.1);
		pre.delayTime.value = 0.02;
		const hp = c.createBiquadFilter();
		hp.type = 'highpass';
		hp.frequency.value = 200;
		const lp = c.createBiquadFilter();
		lp.type = 'lowpass';
		lp.frequency.value = 3500;
		const wet = c.createGain();
		wet.gain.value = 0.3;
		this.verb.connect(pre).connect(conv).connect(hp).connect(lp).connect(wet).connect(this.master);

		this.white = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
		const w = this.white.getChannelData(0);
		for (let i = 0; i < w.length; i++) w[i] = Math.random() * 2 - 1;

		// Record surface: a few soft pops (no steady hiss, which reads as static), on
		// a 13.7s loop so the pattern never lines up with the music.
		const cr = c.createBuffer(1, Math.floor(c.sampleRate * 13.7), c.sampleRate);
		const d = cr.getChannelData(0);
		for (let k = 0; k < 14; k++) {
			const at = Math.floor(Math.random() * (d.length - 60));
			const a = rand(0.1, 0.5);
			for (let j = 0; j < 60; j++) d[at + j] += (Math.random() * 2 - 1) * a * Math.pow(1 - j / 60, 2);
		}
		const src = c.createBufferSource();
		src.buffer = cr;
		src.loop = true;
		const crHp = c.createBiquadFilter();
		crHp.type = 'highpass';
		crHp.frequency.value = 1200;
		const crLp = c.createBiquadFilter();
		crLp.type = 'lowpass';
		crLp.frequency.value = 5000;
		const cg = c.createGain();
		cg.gain.value = 0.025;
		src.connect(crHp).connect(crLp).connect(cg).connect(this.music);
		src.start();

		// The room. Murmur: five people's worth of syllables (3 to 12 a second)
		// shaping noise, kept low (about 250 to 750Hz) so it reads as a room, not static.
		this.roomDay = c.createGain();
		this.roomDay.gain.value = 0;
		this.roomDay.connect(this.master);
		this.roomNight = c.createGain();
		this.roomNight.gain.value = 0;
		this.roomNight.connect(this.master);
		const sr = c.sampleRate;
		const mLen = Math.floor(sr * 11.3);
		const mb = c.createBuffer(1, mLen, sr);
		const md = mb.getChannelData(0);
		for (let v = 0; v < 5; v++) {
			let i = Math.floor(rand(0, sr));
			while (i < mLen) {
				const syl = Math.floor(sr * rand(0.08, 0.25));
				const amp = Math.random() < 0.15 ? 0 : rand(0.3, 1);
				for (let j = 0; j < syl && i + j < mLen; j++) {
					const e = Math.sin((Math.PI * j) / syl);
					md[i + j] += (Math.random() * 2 - 1) * amp * e * e;
				}
				i += syl + Math.floor(sr * (Math.random() < 0.1 ? rand(0.4, 1.2) : rand(0.01, 0.06)));
			}
		}
		const murmur = c.createBufferSource();
		murmur.buffer = mb;
		murmur.loop = true;
		const mBp = c.createBiquadFilter();
		mBp.type = 'bandpass';
		mBp.frequency.value = 550;
		mBp.Q.value = 0.6;
		const mLp = c.createBiquadFilter();
		mLp.type = 'lowpass';
		mLp.frequency.value = 750;
		const mg = c.createGain();
		mg.gain.value = 0.035;
		murmur.connect(mBp).connect(mLp).connect(mg).connect(this.roomDay);
		murmur.start();
		return true;
	}

	/**
	 * Resume audio on the next gesture after the browser held it back (a fresh page
	 * load, or iOS after a call). The listeners stay until audio is really running,
	 * because iOS ignores some events (pointerdown) as audio gestures.
	 */
	private armResume() {
		if (this.armed) return;
		this.armed = true;
		const evs = ['pointerdown', 'touchend', 'click', 'keydown'];
		const done = () => {
			this.armed = false;
			evs.forEach((e) => window.removeEventListener(e, go, true));
		};
		const go = () => {
			const c = this.ctx;
			if (!this.on || !c) return done();
			c.resume()
				.then(() => {
					if (c.state === 'running') done();
				})
				.catch(() => undefined);
		};
		evs.forEach((e) => window.addEventListener(e, go, true));
	}

	private start() {
		if (!this.init() || !this.ctx) {
			this.on = false;
			return;
		}
		const c = this.ctx;
		// If this event didn't count as a gesture (iOS and pointerdown), resume on the next one.
		c.resume().catch(() => undefined);
		window.setTimeout(() => {
			if (this.on && c.state !== 'running') this.armResume();
		}, 300);
		const t = c.currentTime;
		hold(this.master.gain, t);
		this.master.gain.linearRampToValueAtTime(0.85, t + 2.5);
		this.next = Math.max(this.next, t + 0.15);
		this.nextTick = Math.max(this.nextTick, t + 0.3);
		this.nextClink = Math.max(this.nextClink, t + rand(3, 8));
		this.nextSteam = Math.max(this.nextSteam, t + rand(20, 50));
		this.nextDrop = Math.max(this.nextDrop, t + 0.5);
		window.clearInterval(this.sched);
		this.sched = window.setInterval(() => this.schedule(), 250);
		this.applyVibe(t);
		this.schedule();
		this.applyMood();
		this.scene = 'none';
		if (c.state === 'running') this.setScene(SCENE[this.section] || 'none');
		else this.pendingScene = true;
	}

	private stop() {
		if (!this.ctx) return;
		const c = this.ctx;
		const t = c.currentTime;
		window.clearTimeout(this.showT);
		hold(this.master.gain, t);
		this.master.gain.linearRampToValueAtTime(0, t + 0.6);
		window.clearInterval(this.sched);
		window.setTimeout(() => {
			if (this.on) return;
			this.setScene('none');
			c.suspend();
		}, 700);
	}

	private applyMood() {
		if (!this.ctx) return;
		const m = MOOD[this.section] || MOOD.hello;
		this.tone.frequency.setTargetAtTime(m.cutoff * daylight(), this.ctx.currentTime, 1.2);
	}

	/** Set the day/night mix: drums and room fade across over a few seconds. */
	private applyVibe(t: number): number {
		const n = night();
		this.kitDay.gain.setTargetAtTime(1 - n, t, 2);
		this.kitNight.gain.setTargetAtTime(n, t, 2);
		this.roomDay.gain.setTargetAtTime(1 - n, t, 2);
		this.roomNight.gain.setTargetAtTime(n, t, 2);
		return n;
	}

	/** Look ahead on the audio clock and queue the music, the room and the clock. */
	private schedule() {
		const c = this.ctx;
		if (!c || document.hidden) return;
		const now = c.currentTime;
		const ahead = now + 1.2;
		if (this.next < now) this.next = now + 0.1;
		while (this.next < ahead) {
			const t = this.next;
			const n = this.applyVibe(t);
			this.beat = 60 / (72 + 6 * n);
			this.playBar(t, n);
			this.next = t + this.beat * 4;
		}

		const n = night();
		if (this.nextClink < now) this.nextClink = now + 1;
		while (this.nextClink < ahead) {
			if (Math.random() > n) this.clink(this.nextClink);
			this.nextClink += rand(5, 18);
		}
		if (this.nextSteam < now) this.nextSteam = now + 5;
		while (this.nextSteam < ahead) {
			if (Math.random() > n) this.steam(this.nextSteam);
			this.nextSteam += rand(45, 100);
		}
		if (this.nextDrop < now) this.nextDrop = now + 0.1;
		while (this.nextDrop < ahead) {
			if (Math.random() < n) this.drop(this.nextDrop);
			this.nextDrop += rand(0.15, 0.9);
		}

		if (this.scene === 'clock') {
			if (this.nextTick < now) this.nextTick = now + 0.1;
			while (this.nextTick < ahead) {
				this.tick(this.nextTick);
				this.nextTick += this.beat;
			}
		}
	}

	/** One bar: chords from the queue, keys and bass in the day or night style, both kits. */
	private playBar(t: number, n: number) {
		if (this.queue.length < 2) {
			const jazz = n >= 0.5;
			const prog = pick(jazz ? JAZZ : LOFI).map(byName);
			this.queue.push(...prog, ...(jazz ? [] : prog));
		}
		const ch = this.queue.shift()!;
		const nx = this.queue[0];
		this.chord = ch;
		const b = this.beat;
		// Where the "and" lands: a lazy lo-fi swing by day, a triplet jazz swing by night.
		const sw = 0.58 + 0.08 * n;
		const at: At = (beat, off = false) => t + (beat + (off ? sw : 0)) * b + rand(-0.006, 0.006);
		if (n < 0.5) {
			this.lofiKeys(ch, at, b);
			this.lofiBass(ch, at, b);
		} else {
			this.jazzKeys(ch, at, b);
			this.walk(ch, nx, at, b);
		}
		if (n < 0.98) this.lofiKit(at);
		if (n > 0.02) this.jazzKit(at, b);
		if (Math.random() < 0.22 * (MOOD[this.section] || MOOD.hello).fills) this.fill(ch, at, n >= 0.5);
	}

	// ---------------------------------------------------------------- day: lo-fi

	/** The chord on the one, held; now and then a softer push on the and of two or four. */
	private lofiKeys(ch: Chord, at: At, b: number) {
		const notes = Math.random() < 0.3 && ch.notes[0] + 12 <= 72 ? [...ch.notes.slice(1), ch.notes[0] + 12] : ch.notes;
		const hit = (t: number, peak: number, len: number) => notes.forEach((n, i) => this.ep(n, t + i * 0.012, peak, len));
		hit(at(0), 0.03, b * 3.5);
		if (Math.random() < 0.5) hit(at(1, true), 0.018, b * 1.5);
		else if (Math.random() < 0.4) hit(at(3, true), 0.016, b * 1.2);
	}

	/** Electric piano: a round sine with a short, bell-like tine on the attack. */
	private ep(n: number, t: number, peak: number, len: number) {
		this.voice(mtof(n), t, { peak, attack: 0.008, decay: len, dest: this.music, send: 0.25 });
		this.voice(mtof(n) * 2, t, { peak: peak * 0.2, attack: 0.005, decay: 0.6, dest: this.music });
	}

	/** Round bass on the one and three, sometimes an octave pickup into the next bar. */
	private lofiBass(ch: Chord, at: At, b: number) {
		const r = ch.root;
		this.bass(r, at(0), b * 1.6, 0.09);
		this.bass(pick([r, r + 7]), at(2), b * 1.2, 0.07);
		if (Math.random() < 0.4) this.bass(r + 12, at(3, true), b * 0.4, 0.045);
	}

	private bass(n: number, t: number, len: number, peak: number) {
		this.voice(mtof(n), t, { peak, attack: 0.012, decay: len, dest: this.music });
		this.voice(mtof(n) * 2, t, { peak: peak * 0.25, attack: 0.01, decay: len * 0.5, dest: this.music });
	}

	/** A lazy boom-bap: kick on the one, snare a touch late on two and four, soft swung hats. */
	private lofiKit(at: At) {
		const k = this.kitDay;
		this.kick(at(0), k);
		if (Math.random() < 0.6) this.kick(at(1, true), k, 0.7);
		this.kick(Math.random() < 0.5 ? at(2) : at(2, true), k, 0.85);
		this.snare(at(1) + 0.018, k);
		this.snare(at(3) + 0.018, k);
		for (let i = 0; i < 4; i++) {
			if (Math.random() > 0.1) this.hat(at(i), k, 0.01);
			if (Math.random() > 0.2) this.hat(at(i, true), k, 0.006);
		}
	}

	private kick(t: number, dest: AudioNode, v = 1) {
		this.voice(105, t, { peak: 0.14 * v, attack: 0.004, decay: 0.32, glide: 44, glideT: 0.12, dest });
	}

	private snare(t: number, dest: AudioNode) {
		this.noise(t, 0.2, { f: 1800, q: 0.7, peak: 0.05, dest, send: 0.15 });
		this.voice(185, t, { peak: 0.035, attack: 0.003, decay: 0.09, glide: 150, glideT: 0.08, dest });
	}

	private hat(t: number, dest: AudioNode, peak: number) {
		this.noise(t, 0.045, { filter: 'highpass', f: 6500, peak, dest });
	}

	// ---------------------------------------------------------------- night: jazz bar

	/** Piano comping on the Charleston rhythm, or pushes on two and four. Sometimes it lays out. */
	private jazzKeys(ch: Chord, at: At, b: number) {
		const r = Math.random();
		if (r < 0.15) return;
		if (r < 0.65) {
			this.piano(ch.notes, at(0), b * 0.6, 0.026);
			this.piano(ch.notes, at(1, true), b * 2, 0.022);
		} else {
			this.piano(ch.notes, at(1), b * 0.8, 0.022);
			this.piano(ch.notes, at(3), b * 0.8, 0.02);
		}
	}

	private piano(notes: number[], t: number, len: number, peak: number) {
		notes.forEach((n, i) => {
			const t1 = t + i * 0.008;
			this.voice(mtof(n), t1, { type: 'triangle', peak, attack: 0.004, decay: len, dest: this.music, send: 0.3 });
			this.voice(mtof(n) * 2, t1, { peak: peak * 0.25, attack: 0.003, decay: len * 0.4, dest: this.music });
		});
	}

	/** Walking bass: root on one, chord tones on two and three, a half step into the next root on four. */
	private walk(ch: Chord, nx: Chord | undefined, at: At, b: number) {
		const r = ch.root;
		const target = nx ? nx.root : r;
		const line = [r, pick([r + ch.third, r + 7]), pick([r + 7, r + 12, r + ch.third + 12]), target + pick([-1, 1])];
		line.forEach((n, i) => this.pluck(n, at(i), b * 0.9));
	}

	/** Upright bass: a round note with a quick finger-pluck on the front. */
	private pluck(n: number, t: number, len: number) {
		this.voice(mtof(n), t, { peak: 0.1, attack: 0.006, decay: len, dest: this.music });
		this.voice(mtof(n) * 2, t, { peak: 0.035, attack: 0.004, decay: len * 0.4, dest: this.music });
		this.voice(mtof(n) * 3, t, { peak: 0.012, attack: 0.003, decay: 0.12, dest: this.music });
	}

	/** Ride (ding, ding-a, ding, ding-a), a slow brush sweep every beat, a pat on two and four, a feathered kick. */
	private jazzKit(at: At, b: number) {
		const k = this.kitNight;
		const ride: [number, boolean, number][] = [
			[0, false, 0.8],
			[1, false, 1],
			[1, true, 0.6],
			[2, false, 0.8],
			[3, false, 1],
			[3, true, 0.6],
		];
		ride.forEach(([beat, off, v]) => this.ride(at(beat, off), k, v));
		for (let i = 0; i < 4; i++) {
			// The sweep only on one and three, short and soft, so it never joins up into a hiss.
			if (i % 2 === 0) this.noise(at(i), b * 0.6, { f: 1400, f2: 2400, q: 0.7, peak: 0.0035, attack: b * 0.25, dest: k });
			this.voice(70, at(i), { peak: 0.03, attack: 0.005, decay: 0.25, glide: 50, glideT: 0.1, dest: k });
		}
		for (const beat of [1, 3]) this.noise(at(beat), 0.18, { f: 2600, q: 0.6, peak: 0.022, attack: 0.01, dest: k, send: 0.2 });
	}

	private ride(t: number, dest: AudioNode, v: number) {
		// Mostly the metal ring; only a short tick of noise on the stick, so the
		// cymbal doesn't wash into a steady hiss.
		this.noise(t, 0.12, { filter: 'highpass', f: 6000, peak: 0.004 * v, dest });
		[3150, 4410, 5230].forEach((f, i) => this.voice(f, t, { peak: (0.002 * v) / (i + 1), attack: 0.002, decay: 0.7, dest, send: 0.2 }));
	}

	// ---------------------------------------------------------------- both

	/** A short fill in place of a melody: two to four neighbouring notes on swung eighths. */
	private fill(ch: Chord, at: At, jazz: boolean) {
		const pool = ch.pool.filter((n) => n <= 79);
		let beat = pick([1, 2]);
		let off = Math.random() < 0.5;
		let i = Math.floor(Math.random() * pool.length);
		for (let k = 0, len = Math.floor(rand(2, 5)); k < len; k++) {
			const t = at(beat, off);
			if (jazz) this.piano([pool[i]], t, 0.8, 0.02);
			else this.ep(pool[i], t, 0.02, 1.4);
			i = Math.max(0, Math.min(pool.length - 1, i + pick([-1, 1])));
			if (off) {
				beat++;
				off = false;
			} else off = true;
			if (beat > 3) break;
		}
	}

	// ---------------------------------------------------------------- the room

	/** A cup set down on a saucer, or a spoon stirring. */
	private clink(t: number) {
		const d = this.roomDay;
		const times = Math.random() < 0.3 ? [0, 0.11, 0.21, 0.33].slice(0, Math.floor(rand(2, 5))) : [0];
		times.forEach((dt) => {
			const f = rand(2100, 2900);
			[
				[1, 0.006],
				[2.32, 0.003],
				[3.86, 0.0015],
			].forEach(([r, p]) => this.voice(f * r, t + dt, { peak: p * rand(0.5, 1), attack: 0.002, decay: rand(0.12, 0.25), dest: d, send: 0.25 }));
		});
	}

	/** The espresso machine across the room: a gurgle, then the steam wand. */
	private steam(t: number) {
		const d = this.roomDay;
		this.noise(t, 1.2, { f: 400, q: 1, peak: 0.004, attack: 0.2, dest: d });
		this.noise(t + 0.8, rand(2.5, 4.5), { f: 3800, f2: 3000, q: 0.6, peak: 0.005, attack: 0.6, dest: d, send: 0.2 });
	}

	/** A raindrop on the window. */
	private drop(t: number) {
		// Low and soft, so the drops sound like water on glass and never add up to a hiss.
		this.noise(t, rand(0.01, 0.025), { f: rand(1200, 2400), q: 3, peak: rand(0.002, 0.005), dest: this.roomNight });
	}

	// ---------------------------------------------------------------- scenes

	private later(ms: number, fn: () => void) {
		const id = window.setTimeout(() => {
			this.timers = this.timers.filter((x) => x !== id);
			fn();
		}, ms);
		this.timers.push(id);
	}

	/** Repeat fn after a fresh delay each time; skips while the tab is hidden. */
	private every(delay: () => number, fn: () => void) {
		const go = () => {
			if (!document.hidden && this.playing) fn();
			this.later(delay(), go);
		};
		this.later(delay(), go);
	}

	private setScene(s: Scene) {
		if (s === this.scene && s !== 'none') return;
		this.timers.forEach((id) => window.clearTimeout(id));
		this.timers = [];
		const t = this.ctx?.currentTime ?? 0;
		this.stops.forEach((f) => f(t));
		this.stops = [];
		this.brewing = false;
		this.scene = s;
		if (!this.ctx || !this.on) return;
		if (s === 'brew') this.brew();
		else if (s === 'flask') this.flask();
		else if (s === 'garden') this.garden();
		// The clock runs from schedule(), on the music's own beat.
	}

	/**
	 * A held noise layer with a fade in, faded out when the scene changes.
	 * wobble: a slow swell (Hz) on a separate gain, so it never fights the fade.
	 */
	private bed(o: NoiseOpts & { fadeIn: number; lowpass?: number; wobble?: number }): GainNode {
		const c = this.ctx!;
		const t = c.currentTime;
		const src = c.createBufferSource();
		src.buffer = this.white;
		src.loop = true;
		const f = c.createBiquadFilter();
		f.type = o.filter || 'bandpass';
		f.frequency.value = o.f;
		f.Q.value = o.q ?? 0.7;
		let tail: AudioNode = f;
		if (o.lowpass) {
			const lp = c.createBiquadFilter();
			lp.type = 'lowpass';
			lp.frequency.value = o.lowpass;
			tail = tail.connect(lp);
		}
		const g = c.createGain();
		g.gain.setValueAtTime(0.0001, t);
		g.gain.linearRampToValueAtTime(o.peak, t + o.fadeIn);
		const mod = c.createGain();
		mod.gain.value = 1;
		src.connect(f);
		tail.connect(g).connect(mod).connect(o.dest || this.fx);
		let lfo: OscillatorNode | null = null;
		if (o.wobble) {
			lfo = c.createOscillator();
			lfo.frequency.value = o.wobble;
			const depth = c.createGain();
			depth.gain.value = 0.3;
			lfo.connect(depth).connect(mod.gain);
			lfo.start(t);
		}
		src.start(t, rand(0, 1.5));
		this.stops.push((at) => {
			hold(g.gain, at);
			g.gain.setTargetAtTime(0, at, 0.2);
			src.stop(at + 1.2);
			lfo?.stop(at + 1.2);
			src.onended = () => {
				src.disconnect();
				mod.disconnect();
			};
		});
		return g;
	}

	/**
	 * Hello: a drip coffee machine. Heater hum, a soft steam hiss, gurgles, drips.
	 * It brews once per visit to the site (30s, steam stirring), then stays settled.
	 */
	private brew() {
		const c = this.ctx!;
		const full = !this.brewed;
		this.brewed = true;
		this.brewing = full;
		this.bed({ filter: 'lowpass', f: 140, q: 0.5, peak: full ? 0.01 : 0.005, fadeIn: 2.5 });
		const hiss = this.bed({ filter: 'bandpass', f: 2200, q: 0.5, lowpass: 6000, peak: full ? 0.008 : 0.003, fadeIn: 3, wobble: 0.15 });
		if (full) {
			// The pour: water over the grounds as it starts.
			this.noise(c.currentTime + 0.05, 1.8, { f: 700, f2: 1100, q: 0.9, peak: 0.02, attack: 0.4, dest: this.soft });
		}

		let brewing = full;
		this.every(
			() => (brewing ? rand(2200, 4500) : rand(10000, 16000)),
			() => {
				const n = brewing ? Math.floor(rand(6, 14)) : 3;
				let at = c.currentTime + 0.02;
				for (let i = 0; i < n; i++) {
					this.bubble(at, rand(300, 600), rand(0.015, 0.03));
					at += rand(0.03, 0.1);
				}
			},
		);
		this.every(
			() => (brewing ? rand(1500, 4000) : rand(5000, 9000)),
			() => this.drip(c.currentTime + 0.02),
		);
		if (full) {
			this.later(BREW_S * 1000, () => {
				brewing = false;
				this.brewing = false;
				hiss.gain.setTargetAtTime(0.003, c.currentTime, 1.5);
			});
		}
	}

	/** Labs: the flask simmers. */
	private flask() {
		this.every(
			() => rand(300, 1100),
			() => {
				const t = this.ctx!.currentTime + 0.02;
				this.bubble(t, rand(300, 520), rand(0.015, 0.025));
				if (Math.random() < 0.3) this.bubble(t + rand(0.05, 0.15), rand(320, 560), 0.015);
			},
		);
	}

	/** Now: a slow, soft wooden tick on the music's beat, tick then tock. */
	private tick(t: number) {
		this.noise(t, 0.05, { f: this.tock ? 900 : 1200, q: 2, peak: 0.03, attack: 0.004 });
		this.voice(600, t, { peak: 0.006, attack: 0.003, decay: 0.06 });
		this.tock = !this.tock;
	}

	/** Cocoon: a low breeze through leaves and, now and then, a distant bird. */
	private garden() {
		const leaves = this.bed({ filter: 'bandpass', f: 2000, q: 0.6, peak: 0.002, fadeIn: 3 });
		this.every(
			() => rand(4000, 8000),
			() => {
				const t = this.ctx!.currentTime;
				leaves.gain.setTargetAtTime(rand(0.006, 0.01), t, 0.5);
				leaves.gain.setTargetAtTime(0.002, t + rand(1.4, 2.2), 0.7);
			},
		);
		this.every(
			() => rand(9000, 18000),
			() => {
				let at = this.ctx!.currentTime + 0.02;
				const base = rand(2000, 2600);
				for (let i = 0, n = Math.floor(rand(2, 4)); i < n; i++) {
					this.voice(base, at, { peak: 0.008, attack: 0.006, decay: 0.1, glide: base * rand(1.1, 1.2), glideT: 0.07, send: 0.3 });
					at += rand(0.14, 0.22);
				}
			},
		);
	}

	// ---------------------------------------------------------------- cues

	/**
	 * One-off sounds timed to the drawing as it draws on (1.1s). late: how long
	 * ago the drawing started, so the cue still lands on it after the settle delay.
	 */
	private cue(id: string, late: number) {
		const c = this.ctx!;
		if (c.currentTime - this.lastCue < 0.5) return;
		this.lastCue = c.currentTime;
		const r = this.reduced ? 0 : 1;
		const at = (frac: number) => c.currentTime + 0.02 + Math.max(0, frac * 1.1 * r - late);
		switch (id) {
			case 'raxit':
				// The keyhole fills in: a lock turns.
				this.noise(at(0.85), 0.03, { f: 2000, q: 2, peak: 0.04, attack: 0.002 });
				this.noise(at(0.95), 0.035, { f: 1500, q: 2, peak: 0.045, attack: 0.002 });
				this.voice(110, at(0.95), { peak: 0.04, attack: 0.006, decay: 0.2 });
				break;
			case 'labs':
				// Glass clink.
				this.voice(1760, at(0.3), { peak: 0.015, attack: 0.004, decay: 0.8, send: 0.3 });
				this.voice(4400, at(0.3), { peak: 0.003, attack: 0.004, decay: 0.4, send: 0.3 });
				break;
			case 'work':
				// One soft wooden tap per layer.
				[0.15, 0.45, 0.75].forEach((f, i) => {
					this.voice([220, 196, 175][i], at(f), { type: 'triangle', peak: 0.045, attack: 0.005, decay: 0.16 });
					this.noise(at(f), 0.02, { f: 1000, q: 1.5, peak: 0.02 });
				});
				break;
			case 'writing':
				// Page turn (the pen draws the rest).
				this.noise(at(0), 0.45, { f: 600, f2: 2400, q: 0.7, peak: 0.035, attack: 0.1, send: 0.2 });
				break;
			case 'side':
				// The sprout: a small chime.
				this.voice(1318.5, at(0.9), { peak: 0.02, attack: 0.006, decay: 1.8, send: 0.6 });
				this.voice(1760, at(1.0), { peak: 0.016, attack: 0.006, decay: 2, send: 0.6 });
				break;
			case 'about':
				// A bell at the last ring of the career line
				// (inharmonic partials, like a real small bell).
				[
					[1, 0.02],
					[2.76, 0.005],
					[5.4, 0.002],
				].forEach(([ratio, peak]) =>
					this.voice(784 * ratio, at(1.05), { peak, attack: 0.006, decay: 2.2 / Math.sqrt(ratio), send: 0.3 }),
				);
				break;
		}
	}

	// ---------------------------------------------------------------- voices

	private voice(freq: number, t: number, o: ToneOpts) {
		const c = this.ctx!;
		const osc = c.createOscillator();
		osc.type = o.type || 'sine';
		osc.frequency.setValueAtTime(freq, t);
		if (o.glide) osc.frequency.exponentialRampToValueAtTime(o.glide, t + (o.glideT ?? 0.05));
		const g = c.createGain();
		const a = o.attack ?? 0.006;
		g.gain.setValueAtTime(0.0001, t);
		g.gain.linearRampToValueAtTime(o.peak, t + a);
		g.gain.exponentialRampToValueAtTime(0.0001, t + a + o.decay);
		osc.connect(g).connect(o.dest || this.fx);
		let s: GainNode | null = null;
		if (o.send) {
			s = c.createGain();
			s.gain.value = o.send;
			g.connect(s).connect(this.verb);
		}
		osc.onended = () => {
			osc.disconnect();
			g.disconnect();
			s?.disconnect();
		};
		osc.start(t);
		osc.stop(t + a + o.decay + 0.05);
	}

	private noise(t: number, dur: number, o: NoiseOpts) {
		const c = this.ctx!;
		const src = c.createBufferSource();
		src.buffer = this.white;
		const f = c.createBiquadFilter();
		f.type = o.filter || 'bandpass';
		f.frequency.setValueAtTime(o.f, t);
		if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t + dur);
		f.Q.value = o.q ?? 1;
		const g = c.createGain();
		const a = Math.min(o.attack ?? 0.003, dur / 2);
		g.gain.setValueAtTime(0.0001, t);
		g.gain.linearRampToValueAtTime(o.peak, t + a);
		g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
		src.connect(f).connect(g).connect(o.dest || this.fx);
		let s: GainNode | null = null;
		if (o.send) {
			s = c.createGain();
			s.gain.value = o.send;
			g.connect(s).connect(this.verb);
		}
		src.onended = () => {
			src.disconnect();
			f.disconnect();
			g.disconnect();
			s?.disconnect();
		};
		src.start(t, rand(0, 1.5));
		src.stop(t + dur + 0.05);
	}

	/** A bubble: a short, dull sine that rises a little as it pops. */
	private bubble(t: number, f: number, peak: number) {
		const d = rand(0.02, 0.04);
		this.voice(f, t, { peak, attack: 0.004, decay: d * 1.6, glide: f * rand(1.1, 1.25), glideT: d, dest: this.soft, send: 0.15 });
	}

	/** A drip landing in the cup. */
	private drip(t: number) {
		const f = rand(600, 1000);
		this.voice(f, t, { peak: 0.02, attack: 0.004, decay: 0.12, glide: f * 1.2, glideT: 0.04, dest: this.soft, send: 0.3 });
	}

	private lastKey = -1;

	/**
	 * One soft tap as a glance line types a letter: a muffled click with a faint
	 * low knock, never the same twice. Spaces are silent; a full stop lands a
	 * little heavier. Taps closer than 25ms apart are skipped so they never buzz.
	 */
	key(ch: string) {
		if (!this.ctx || !this.playing || this.reduced || ch === ' ') return;
		const c = this.ctx;
		const t = c.currentTime + 0.005;
		if (t - this.lastKey < 0.025) return;
		this.lastKey = t;
		const heavy = ch === '.' || ch === ',' || ch === '?' || ch === '!';
		const v = rand(0.7, 1) * (heavy ? 1.3 : 1);
		this.noise(t, rand(0.018, 0.03), { f: rand(1100, 1700), q: 1.4, peak: 0.009 * v, dest: this.soft });
		this.voice(rand(150, 210), t, { peak: 0.004 * v, attack: 0.002, decay: 0.04 });
	}

	/** How loud the music is right now, 0 to about 1. Drives the ♪ waveform. */
	level(): number {
		if (!this.ctx || !this.on) return 0;
		this.meter.getFloatTimeDomainData(this.meterBuf);
		let sum = 0;
		for (const v of this.meterBuf) sum += v * v;
		return Math.min(1, Math.sqrt(sum / this.meterBuf.length) * 25);
	}

	/**
	 * Graphite on paper while a drawing draws itself on. speed is the pen's speed,
	 * 0 to 1; the sound follows it, so a fast stroke is louder and a lifted pen is silent.
	 */
	pen(speed: number) {
		if (!this.ctx || !this.playing || this.reduced) return;
		const c = this.ctx;
		if (!this.penGain) {
			const src = c.createBufferSource();
			src.buffer = this.white;
			src.loop = true;
			const bp = c.createBiquadFilter();
			bp.type = 'bandpass';
			bp.frequency.value = 2600;
			bp.Q.value = 0.9;
			const hp = c.createBiquadFilter();
			hp.type = 'highpass';
			hp.frequency.value = 1200;
			this.penGain = c.createGain();
			this.penGain.gain.value = 0;
			src.connect(bp).connect(hp).connect(this.penGain).connect(this.fx);
			src.start();
		}
		// A little flutter, so it sounds like grain and not a steady hiss.
		const v = Math.max(0, Math.min(1, speed)) * rand(0.6, 1.1);
		this.penGain.gain.setTargetAtTime(v * 0.016, c.currentTime, 0.025);
	}
}
