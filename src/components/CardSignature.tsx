import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { prefersReducedMotion } from '../lib/motion';

/**
 * Signature visual for each project card, themed to what the project does. Every one builds in
 * step with the card's scroll entrance (the `--enter` variable from useCardScroll) and then runs
 * a live loop once the card has been seen (`[data-inview]`). Reduced motion shows the final frame.
 */
export function CardSignature({ kind }: { kind: string }) {
  switch (kind) {
    case 'carefirst':
      return <VoiceSignal />;
    case 'vital':
      return <VitalTrace />;
    case 'rice':
      return <VisionScan />;
    case 'rag':
      return <RetrievalSearch />;
    case 'dsa':
      return <InsightChart />;
    default:
      return null;
  }
}

/** Calls `tick` every `ms` while the element is on screen (never under reduced motion). */
function useLiveTicker(tick: () => void, ms: number) {
  const ref = useRef<HTMLDivElement>(null);
  const tickRef = useRef(tick);
  tickRef.current = tick;
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    let timer = 0;
    const io = new IntersectionObserver(([entry]) => {
      clearInterval(timer);
      if (entry.isIntersecting) timer = window.setInterval(() => tickRef.current(), ms);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      clearInterval(timer);
    };
  }, [ms]);
  return ref;
}

const vars = (v: Record<string, number | string>) => v as CSSProperties;
const between = (min: number, max: number) => min + Math.random() * (max - min);

function Signature({
  refEl,
  live,
  value,
  className,
  children,
}: {
  refEl: RefObject<HTMLDivElement | null>;
  live: ReactNode;
  value: ReactNode;
  className: string;
  children: ReactNode;
}) {
  return (
    <div ref={refEl} className={`sig ${className}`}>
      <div className="sig-meta">
        <span className="sig-live">{live}</span>
        <span className="sig-value">{value}</span>
      </div>
      <div className="sig-stage">{children}</div>
    </div>
  );
}

/* ---------- 01 CareFirst: incoming SOS voice call ---------- */

const VOICE = Array.from({ length: 44 }, (_, i) => 0.18 + 0.82 * Math.abs(Math.sin(i * 0.55) * Math.sin(i * 0.21 + 1)));

function VoiceSignal() {
  const [secs, setSecs] = useState(7);
  const ref = useLiveTicker(() => setSecs((s) => (s >= 59 ? 1 : s + 1)), 1000);
  return (
    <Signature refEl={ref} className="sig-voice" live="SOS · Live call" value={`00:${String(secs).padStart(2, '0')}`}>
      {VOICE.map((h, i) => (
        <span key={i} className="voice-bar" style={vars({ '--i': i, '--n': VOICE.length, '--h': h.toFixed(3) })} />
      ))}
    </Signature>
  );
}

/* ---------- 02 Vital Monitor: ECG trace ---------- */

// One heartbeat (P wave, QRS spike, T wave) in a 200-wide box; three span the trace (~75 BPM per sweep).
const beat = (x: number) =>
  `L${x + 40} 36 Q${x + 46} 29 ${x + 52} 36 L${x + 64} 36 L${x + 68} 41 L${x + 74} 5 L${x + 80} 52 L${x + 85} 36 ` +
  `L${x + 100} 36 Q${x + 112} 23 ${x + 124} 36 L${x + 200} 36`;
const ECG = `M0 36 ${beat(0)} ${beat(200)} ${beat(400)}`;

function VitalTrace() {
  const [bpm, setBpm] = useState(74);
  const ref = useLiveTicker(() => setBpm(71 + Math.floor(Math.random() * 8)), 2400);
  return (
    <Signature
      refEl={ref}
      className="sig-vital"
      live="Live"
      value={
        <>
          <b>{bpm}</b> BPM
        </>
      }
    >
      <svg className="sig-svg vital-base" viewBox="0 0 600 60" preserveAspectRatio="none" aria-hidden="true">
        <path d={ECG} pathLength={1} />
      </svg>
      <svg className="sig-svg vital-glow" viewBox="0 0 600 60" preserveAspectRatio="none" aria-hidden="true">
        <path d={ECG} pathLength={1} />
      </svg>
    </Signature>
  );
}

/* ---------- 03 Rice leaf disease: vision scan with a detection lock ---------- */

const COLS = 30;
const ROWS = 4;
const BOX = { c0: 17, c1: 23 }; // columns covered by the detection box
const PIXELS = Array.from({ length: COLS * ROWS }, (_, k) => {
  const c = k % COLS;
  const r = Math.floor(k / COLS);
  const v = 0.5 + 0.5 * Math.sin(c * 0.9 + r * 1.7) * Math.cos(c * 0.37 - r);
  return { c, a: 0.06 + v * 0.3, hit: c >= BOX.c0 && c < BOX.c1 };
});

function VisionScan() {
  const [conf, setConf] = useState(94);
  const ref = useLiveTicker(() => setConf(Math.round(between(92, 97))), 2800);
  return (
    <Signature
      refEl={ref}
      className="sig-vision"
      live="Scanning leaf"
      value={
        <>
          Leaf blast · <b>{conf}%</b>
        </>
      }
    >
      <div className="vision-grid" style={vars({ '--cols': COLS })}>
        {PIXELS.map((p, k) => (
          <span
            key={k}
            className={`vision-px${p.hit ? ' is-hit' : ''}`}
            style={vars({ '--i': p.c, '--n': COLS, '--a': p.a.toFixed(3) })}
          />
        ))}
      </div>
      <div
        className="vision-box"
        style={vars({ '--l': `${(BOX.c0 / COLS) * 100}%`, '--w': `${((BOX.c1 - BOX.c0) / COLS) * 100}%` })}
      >
        <i />
        <i />
        <i />
        <i />
      </div>
      <span className="vision-scan" />
    </Signature>
  );
}

/* ---------- 04 RAG: semantic search over document chunks ---------- */

const CHUNKS = 16;
const HITS = [3, 9, 12];

function RetrievalSearch() {
  const [sim, setSim] = useState(0.91);
  const ref = useLiveTicker(() => setSim(Number(between(0.87, 0.94).toFixed(2))), 3200);
  return (
    <Signature
      refEl={ref}
      className="sig-rag"
      live="Query · top 3 chunks"
      value={
        <>
          sim <b>{sim.toFixed(2)}</b>
        </>
      }
    >
      {Array.from({ length: CHUNKS }, (_, i) => {
        const rank = HITS.indexOf(i);
        return (
          <span
            key={i}
            className={`rag-chunk${rank >= 0 ? ' is-hit' : ''}`}
            style={vars({ '--i': i, '--n': CHUNKS, '--rank': Math.max(rank, 0) })}
          />
        );
      })}
      <span className="rag-sweep" />
    </Signature>
  );
}

/* ---------- 05 Data science agent: chart with a trend line ---------- */

const SERIES = Array.from({ length: 16 }, (_, i) => 0.22 + (i / 15) * 0.6 + Math.sin(i * 1.7) * 0.09);
const TREND = SERIES.map((v, i) => `${(i + 0.5) * 10},${(50 - v * 50).toFixed(1)}`).join(' ');
const LAST = SERIES[SERIES.length - 1];

function InsightChart() {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <Signature refEl={ref} className="sig-chart" live="Agent · insight" value={<b>Trend ↑</b>}>
      {SERIES.map((v, i) => (
        <span key={i} className="chart-bar" style={vars({ '--i': i, '--n': SERIES.length, '--h': v.toFixed(3) })} />
      ))}
      <svg className="sig-svg chart-line" viewBox="0 0 160 56" preserveAspectRatio="none" aria-hidden="true">
        <polyline points={TREND} pathLength={1} />
      </svg>
      <span className="chart-dot" style={vars({ '--x': `${(15.5 / 16) * 100}%`, '--y': `${((50 - LAST * 50) / 56) * 100}%` })} />
    </Signature>
  );
}
