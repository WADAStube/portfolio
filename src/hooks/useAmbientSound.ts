import { useRef, useEffect, useState, useCallback } from "react";

/* ── Types ─────────────────────────────────────────────────── */
interface AudioNodes {
  ctx:        AudioContext;
  master:     GainNode;
  mayaGain:   GainNode;
  ueGain:     GainNode;
  rumbleGain: GainNode;
  hissGain:   GainNode;
}

/**
 * Synthesized ambient sound design for the hero video.
 *
 * Maya phase  (t < transitionAt):
 *   920Hz sine + LFO vibrato + random soft UI clicks
 *
 * Unreal Engine phase (t >= transitionAt):
 *   Layered sawtooth engine drone (88 / 176 / 264 Hz)
 *   + slow RPM wobble LFO (0.18 Hz, ±6Hz pitch variation)
 *   + breathing volume LFO (0.28 Hz)
 *   + bandpass-filtered noise: mid rumble (320 Hz) + gritty edge (900 Hz)
 *
 * Muted by default. Smooth crossfade between phases.
 */
export function useAmbientSound(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  transitionAt = 3
) {
  const [isMuted, setIsMuted] = useState(true);
  const nodesRef      = useRef<AudioNodes | null>(null);
  const rafRef        = useRef<number | null>(null);
  const nextClickRef  = useRef<number>(0);

  /* ── Soft click burst (Maya UI interaction sounds) ─────── */
  const fireClick = useCallback((nodes: AudioNodes) => {
    const { ctx, master } = nodes;
    const len = Math.floor(ctx.sampleRate * 0.04);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d   = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.0065));
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;

    const hpf = ctx.createBiquadFilter();
    hpf.type = "highpass";
    hpf.frequency.value = 2800;
    hpf.Q.value = 1.0;

    const g = ctx.createGain();
    g.gain.value = 0.065;

    src.connect(hpf).connect(g).connect(master);
    src.start();
  }, []);

  /* ── Build white-noise buffer ──────────────────────────── */
  const makeNoiseBuf = useCallback((ctx: AudioContext, secs: number) => {
    const len = Math.floor(ctx.sampleRate * secs);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d   = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }, []);

  /* ── Build the full audio graph ────────────────────────── */
  const initAudio = useCallback(() => {
    if (nodesRef.current) return;

    const ctx = new (
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    )();

    /* Master gain — starts silent */
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    /* ── MAYA: 920 Hz sine + LFO vibrato ─────────────── */
    const mayaOsc = ctx.createOscillator();
    mayaOsc.type = "sine";
    mayaOsc.frequency.value = 920;

    const mayaLfo = ctx.createOscillator();
    mayaLfo.type = "sine";
    mayaLfo.frequency.value = 3.5;

    const mayaLfoG = ctx.createGain();
    mayaLfoG.gain.value = 14;
    mayaLfo.connect(mayaLfoG).connect(mayaOsc.frequency);

    const mayaGain = ctx.createGain();
    mayaGain.gain.value = 0;
    mayaOsc.connect(mayaGain).connect(master);
    mayaOsc.start();
    mayaLfo.start();

    /* ── UNREAL ENGINE: layered drone ────────────────── */
    /* Slow RPM wobble shared across all oscillators */
    const rpmLfo = ctx.createOscillator();
    rpmLfo.type = "sine";
    rpmLfo.frequency.value = 0.18; // very slow pitch drift

    const rpmLfoG = ctx.createGain();
    rpmLfoG.gain.value = 6; // ±6 Hz pitch variation
    rpmLfo.connect(rpmLfoG);

    /* Breathing LFO (volume swell) */
    const breathLfo = ctx.createOscillator();
    breathLfo.type = "sine";
    breathLfo.frequency.value = 0.28;

    const breathLfoG = ctx.createGain();
    breathLfoG.gain.value = 0.012;

    const ueGain = ctx.createGain();
    ueGain.gain.value = 0;
    breathLfo.connect(breathLfoG).connect(ueGain.gain);

    /* Fundamental – 88 Hz sawtooth (dominant layer) */
    const osc1 = ctx.createOscillator();
    osc1.type = "sawtooth";
    osc1.frequency.value = 88;
    rpmLfoG.connect(osc1.frequency);
    const g1 = ctx.createGain(); g1.gain.value = 0.55;
    osc1.connect(g1).connect(ueGain);

    /* 2nd harmonic – 176 Hz sawtooth */
    const osc2 = ctx.createOscillator();
    osc2.type = "sawtooth";
    osc2.frequency.value = 176;
    rpmLfoG.connect(osc2.frequency);
    const g2 = ctx.createGain(); g2.gain.value = 0.22;
    osc2.connect(g2).connect(ueGain);

    /* 3rd harmonic – 264 Hz triangle (adds edge without harshness) */
    const osc3 = ctx.createOscillator();
    osc3.type = "triangle";
    osc3.frequency.value = 264;
    const g3 = ctx.createGain(); g3.gain.value = 0.10;
    osc3.connect(g3).connect(ueGain);

    ueGain.connect(master);
    osc1.start(); osc2.start(); osc3.start();
    rpmLfo.start(); breathLfo.start();

    /* Mid rumble noise – 320 Hz bandpass (mechanical body) */
    const nBuf1     = makeNoiseBuf(ctx, 4);
    const nRumble   = ctx.createBufferSource();
    nRumble.buffer  = nBuf1;
    nRumble.loop    = true;
    const bpf1      = ctx.createBiquadFilter();
    bpf1.type = "bandpass"; bpf1.frequency.value = 320; bpf1.Q.value = 0.9;
    const rumbleGain = ctx.createGain(); rumbleGain.gain.value = 0;
    nRumble.connect(bpf1).connect(rumbleGain).connect(master);
    nRumble.start();

    /* High texture noise – 900 Hz bandpass (mechanical grit) */
    const nBuf2   = makeNoiseBuf(ctx, 4);
    const nHiss   = ctx.createBufferSource();
    nHiss.buffer  = nBuf2;
    nHiss.loop    = true;
    const bpf2    = ctx.createBiquadFilter();
    bpf2.type = "bandpass"; bpf2.frequency.value = 900; bpf2.Q.value = 1.2;
    const hissGain = ctx.createGain(); hissGain.gain.value = 0;
    nHiss.connect(bpf2).connect(hissGain).connect(master);
    nHiss.start();

    nodesRef.current = { ctx, master, mayaGain, ueGain, rumbleGain, hissGain };
  }, [makeNoiseBuf]);

  /* ── Per-frame tick: sync to video.currentTime ─────────── */
  const tick = useCallback(() => {
    const nodes = nodesRef.current;
    if (!nodes) { rafRef.current = requestAnimationFrame(tick); return; }

    const { ctx, mayaGain, ueGain, rumbleGain, hissGain } = nodes;
    const t      = videoRef.current?.currentTime ?? 0;
    const isMaya = t < transitionAt;
    const now    = ctx.currentTime;
    const TC     = 0.55; // crossfade time constant (seconds)

    if (isMaya) {
      /* Maya: digital hum + clicks */
      mayaGain.gain.setTargetAtTime(0.018, now, TC);
      ueGain.gain.setTargetAtTime(0, now, TC);
      rumbleGain.gain.setTargetAtTime(0, now, TC);
      hissGain.gain.setTargetAtTime(0, now, TC);

      if (now > nextClickRef.current) {
        fireClick(nodes);
        nextClickRef.current = now + 0.5 + Math.random() * 1.4;
      }
    } else {
      /* Unreal: engine drone — noticeably louder, clearly present */
      mayaGain.gain.setTargetAtTime(0, now, TC);
      ueGain.gain.setTargetAtTime(0.075, now, TC);  // oscillator mix
      rumbleGain.gain.setTargetAtTime(0.048, now, TC); // mid-band rumble
      hissGain.gain.setTargetAtTime(0.018, now, TC); // high grit
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [videoRef, transitionAt, fireClick]);

  /* ── Toggle mute ────────────────────────────────────────── */
  useEffect(() => {
    if (!isMuted) {
      initAudio();
      const nodes = nodesRef.current;
      if (nodes) {
        const { ctx, master } = nodes;
        if (ctx.state === "suspended") ctx.resume();
        master.gain.setTargetAtTime(1, ctx.currentTime, 0.7);
      }
      rafRef.current = requestAnimationFrame(tick);
    } else {
      const nodes = nodesRef.current;
      if (nodes) nodes.master.gain.setTargetAtTime(0, nodes.ctx.currentTime, 0.4);
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    }
    return () => {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    };
  }, [isMuted, initAudio, tick]);

  /* ── Cleanup on unmount ─────────────────────────────────── */
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      nodesRef.current?.ctx.close();
    };
  }, []);

  const toggle = useCallback(() => setIsMuted(m => !m), []);
  return { isMuted, toggle };
}
