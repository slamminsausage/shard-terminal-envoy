/**
 * TerminalGauges — Decorative non-functional meters & gauges
 *
 * Provides retro-styled readouts that flicker and drift randomly.
 * Pure decoration: these don't represent real data.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';

// ── Utility: seeded pseudo-random for deterministic-per-terminal values ──────

function seedHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ── Mini bar gauge ───────────────────────────────────────────────────────────

interface MiniBarProps {
  label: string;
  color: string;
  seed: string;
  /** Static percentage 0-100 (overrides random drift) */
  value?: number;
}

function MiniBar({ label, color, seed, value }: MiniBarProps) {
  const rng = useMemo(() => seededRandom(seedHash(seed + label)), [seed, label]);
  const baseValue = useMemo(() => value ?? Math.round(rng() * 60 + 30), [value]);
  const [current, setCurrent] = useState(baseValue);

  useEffect(() => {
    if (value !== undefined) return; // no drift on fixed values
    const id = setInterval(() => {
      setCurrent((prev) => {
        const drift = (Math.random() - 0.5) * 6;
        return Math.max(5, Math.min(100, Math.round(prev + drift)));
      });
    }, 2000 + Math.random() * 3000);
    return () => clearInterval(id);
  }, [value]);

  return (
    <div className="flex items-center gap-1.5" style={{ minWidth: 0 }}>
      <span
        className="font-mono uppercase tracking-wider shrink-0"
        style={{ fontSize: '7px', color: `${color}99`, letterSpacing: '0.08em' }}
      >
        {label}
      </span>
      <div
        className="flex-1 h-1 rounded-sm overflow-hidden"
        style={{ backgroundColor: `${color}18`, minWidth: '28px' }}
      >
        <div
          className="h-full rounded-sm"
          style={{
            width: `${current}%`,
            backgroundColor: current > 85 ? '#ff4444' : color,
            boxShadow: `0 0 4px ${current > 85 ? '#ff444466' : color + '44'}`,
            transition: 'width 1.5s ease, background-color 0.5s ease',
          }}
        />
      </div>
      <span
        className="font-mono shrink-0 tabular-nums"
        style={{ fontSize: '7px', color: `${color}88`, minWidth: '18px', textAlign: 'right' }}
      >
        {current}%
      </span>
    </div>
  );
}

// ── Numeric readout with drift ───────────────────────────────────────────────

interface NumericReadoutProps {
  label: string;
  unit: string;
  color: string;
  seed: string;
  min?: number;
  max?: number;
  decimals?: number;
}

function NumericReadout({ label, unit, color, seed, min = 0, max = 100, decimals = 1 }: NumericReadoutProps) {
  const rng = useMemo(() => seededRandom(seedHash(seed + label)), [seed, label]);
  const baseValue = useMemo(() => rng() * (max - min) + min, []);
  const [current, setCurrent] = useState(baseValue);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((prev) => {
        const range = max - min;
        const drift = (Math.random() - 0.5) * range * 0.04;
        return Math.max(min, Math.min(max, prev + drift));
      });
    }, 1800 + Math.random() * 2500);
    return () => clearInterval(id);
  }, [min, max]);

  return (
    <div className="flex items-center gap-1">
      <span
        className="font-mono uppercase tracking-wider"
        style={{ fontSize: '7px', color: `${color}88` }}
      >
        {label}
      </span>
      <span
        className="font-mono tabular-nums"
        style={{ fontSize: '8px', color, textShadow: `0 0 6px ${color}44` }}
      >
        {current.toFixed(decimals)}
      </span>
      <span
        className="font-mono"
        style={{ fontSize: '6px', color: `${color}66` }}
      >
        {unit}
      </span>
    </div>
  );
}

// ── Blinking status dot ──────────────────────────────────────────────────────

interface StatusLightProps {
  label: string;
  color: string;
  blinkRate?: number; // ms, 0 = solid
}

function StatusLight({ label, color, blinkRate = 0 }: StatusLightProps) {
  const [on, setOn] = useState(true);

  useEffect(() => {
    if (!blinkRate) return;
    const id = setInterval(() => setOn((p) => !p), blinkRate);
    return () => clearInterval(id);
  }, [blinkRate]);

  return (
    <div className="flex items-center gap-1">
      <div
        style={{
          width: 4,
          height: 4,
          borderRadius: '50%',
          backgroundColor: on ? color : `${color}33`,
          boxShadow: on ? `0 0 4px ${color}88` : 'none',
          transition: 'all 0.15s ease',
        }}
      />
      <span
        className="font-mono uppercase tracking-wider"
        style={{ fontSize: '7px', color: `${color}99` }}
      >
        {label}
      </span>
    </div>
  );
}

// ── Segment display (hex/numeric readout) ────────────────────────────────────

interface SegmentDisplayProps {
  label: string;
  color: string;
  seed: string;
  digits?: number;
}

function SegmentDisplay({ label, color, seed, digits = 4 }: SegmentDisplayProps) {
  const rng = useMemo(() => seededRandom(seedHash(seed + label)), [seed, label]);
  const [value, setValue] = useState(() => {
    const n = Math.floor(rng() * Math.pow(16, digits));
    return n.toString(16).toUpperCase().padStart(digits, '0');
  });

  useEffect(() => {
    const id = setInterval(() => {
      setValue((prev) => {
        const n = parseInt(prev, 16);
        const drift = Math.floor((Math.random() - 0.5) * 16);
        const next = Math.max(0, Math.min(Math.pow(16, digits) - 1, n + drift));
        return next.toString(16).toUpperCase().padStart(digits, '0');
      });
    }, 3000 + Math.random() * 4000);
    return () => clearInterval(id);
  }, [digits]);

  return (
    <div className="flex items-center gap-1">
      <span className="font-mono uppercase" style={{ fontSize: '7px', color: `${color}88` }}>
        {label}
      </span>
      <span
        className="font-mono tabular-nums tracking-widest"
        style={{
          fontSize: '9px',
          color,
          textShadow: `0 0 6px ${color}55`,
          fontFamily: 'var(--font-display)',
          letterSpacing: '0.15em',
        }}
      >
        0x{value}
      </span>
    </div>
  );
}

// ── Oscilloscope bar (animated dashes) ───────────────────────────────────────

interface OscilloscopeProps {
  color: string;
  width?: number;
}

function Oscilloscope({ color, width = 12 }: OscilloscopeProps) {
  const [bars, setBars] = useState<number[]>(() =>
    Array.from({ length: width }, () => Math.random())
  );

  useEffect(() => {
    const id = setInterval(() => {
      setBars((prev) =>
        prev.map((v) => Math.max(0.05, Math.min(1, v + (Math.random() - 0.5) * 0.4)))
      );
    }, 300);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-end gap-px" style={{ height: '10px' }}>
      {bars.map((v, i) => (
        <div
          key={i}
          style={{
            width: 2,
            height: `${Math.round(v * 100)}%`,
            backgroundColor: color,
            opacity: 0.6 + v * 0.4,
            boxShadow: `0 0 2px ${color}44`,
            transition: 'height 0.25s ease',
          }}
        />
      ))}
    </div>
  );
}

// ── Exported composite gauge strips ──────────────────────────────────────────

/** Horizontal strip of gauges for the terminal taskbar / footer */
export function TaskbarGauges({ accentColor, terminalCode }: { accentColor: string; terminalCode: string }) {
  return (
    <div className="flex items-center gap-3 overflow-hidden">
      <MiniBar label="MEM" color={accentColor} seed={terminalCode} />
      <MiniBar label="CPU" color={accentColor} seed={terminalCode + 'cpu'} />
      <StatusLight label="TX" color={accentColor} blinkRate={800} />
      <StatusLight label="RX" color="#3ae2b3" blinkRate={1200} />
    </div>
  );
}

/** Vertical stack of gauges for the menu bar / sidebar */
export function MenuBarGauges({ accentColor, terminalCode }: { accentColor: string; terminalCode: string }) {
  return (
    <div className="flex items-center gap-3 overflow-hidden">
      <NumericReadout label="FREQ" unit="GHz" color={accentColor} seed={terminalCode} min={1.2} max={4.8} />
      <SegmentDisplay label="ADDR" color={accentColor} seed={terminalCode} digits={4} />
      <Oscilloscope color={accentColor} width={8} />
    </div>
  );
}

/** Full gauge panel for the log detail view sidebar */
export function LogDetailGauges({ accentColor, terminalCode }: { accentColor: string; terminalCode: string }) {
  return (
    <div className="flex flex-col gap-1.5 py-1">
      <MiniBar label="BUFFER" color={accentColor} seed={terminalCode + 'buf'} />
      <MiniBar label="SIGNAL" color={accentColor} seed={terminalCode + 'sig'} />
      <MiniBar label="DECRYPT" color={accentColor} seed={terminalCode + 'dec'} />
      <div className="flex items-center gap-3 mt-0.5">
        <NumericReadout label="TEMP" unit="°C" color={accentColor} seed={terminalCode} min={28} max={72} />
        <NumericReadout label="LATENCY" unit="ms" color={accentColor} seed={terminalCode + 'lat'} min={2} max={180} decimals={0} />
      </div>
      <div className="flex items-center gap-2 mt-0.5">
        <StatusLight label="LINK" color="#3ae2b3" />
        <StatusLight label="SYNC" color={accentColor} blinkRate={1500} />
        <StatusLight label="ERR" color="#ff4444" blinkRate={0} />
        <SegmentDisplay label="PID" color={accentColor} seed={terminalCode + 'pid'} digits={3} />
      </div>
    </div>
  );
}

/** Compact inline gauge row for file icons */
export function FileIconGauge({ color, seed }: { color: string; seed: string }) {
  const rng = useMemo(() => seededRandom(seedHash(seed)), [seed]);
  const size = useMemo(() => {
    const kb = Math.floor(rng() * 900 + 12);
    return kb >= 1000 ? `${(kb / 1024).toFixed(1)}MB` : `${kb}KB`;
  }, []);

  return (
    <span
      className="font-mono tabular-nums"
      style={{ fontSize: '7px', color: `${color}77` }}
    >
      {size}
    </span>
  );
}

/** Audio log signal strength meter */
export function SignalMeter({ color }: { color: string }) {
  const [bars] = useState(() =>
    Array.from({ length: 5 }, (_, i) => i < Math.floor(Math.random() * 3 + 2))
  );

  return (
    <div className="flex items-end gap-px" style={{ height: '10px' }}>
      {bars.map((active, i) => (
        <div
          key={i}
          style={{
            width: 3,
            height: `${40 + i * 15}%`,
            backgroundColor: active ? color : `${color}22`,
            borderRadius: 1,
          }}
        />
      ))}
    </div>
  );
}
