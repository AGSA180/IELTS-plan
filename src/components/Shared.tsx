import React, { useState, useEffect } from "react";
import { T, bandColor } from "../theme";
import { countWords } from "../utils/wordCount";

export function BandBadge({ band, size = "md" }: { band: number, size?: "sm" | "md" | "lg" }) {
  const sz = size === "lg" ? { fontSize: 28, padding: "8px 18px" } : size === "sm" ? { fontSize: 12, padding: "3px 9px" } : { fontSize: 18, padding: "5px 14px" };
  return (
    <div style={{
      display: "inline-block", ...sz,
      background: bandColor(band) + "14",
      border: `2px solid ${bandColor(band)}`,
      borderRadius: 8, fontWeight: 800,
      color: bandColor(band), fontFamily: "'Cormorant Garamond', Georgia, serif",
      letterSpacing: ".04em",
    }}>
      Band {band}
    </div>
  );
}

export const CriterionBar: React.FC<{ label: string, score: number, max?: number }> = ({ label, score, max = 9 }) => {
  const pct = (score / max) * 100;
  const col = bandColor(score);
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
        <span style={{ color: T.textMid, fontWeight: 600 }}>{label}</span>
        <span style={{ color: col, fontWeight: 700 }}>{score}/9</span>
      </div>
      <div style={{ height: 5, background: T.bgDeep, borderRadius: 3 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: col, borderRadius: 3, transition: "width 1s ease" }} />
      </div>
    </div>
  );
}

export function TimerBar({ seconds, onEnd }: { seconds: number, onEnd?: () => void }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => { setLeft(seconds); }, [seconds]);
  useEffect(() => {
    if (left <= 0) { onEnd?.(); return; }
    const t = setTimeout(() => setLeft(l => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  const pct = (left / seconds) * 100;
  const col = pct > 50 ? T.green : pct > 20 ? T.gold : T.burgundy;
  const m = Math.floor(left / 60), s = left % 60;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ flex: 1, height: 4, background: T.bgDeep, borderRadius: 2 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: col, borderRadius: 2, transition: "width 1s linear" }} />
      </div>
      <span style={{ fontFamily: "monospace", fontSize: 15, color: col, minWidth: 48, fontWeight: 700 }}>
        {m}:{String(s).padStart(2, "0")}
      </span>
    </div>
  );
}

export const WordCount = React.memo(function WordCount({ text, target }: { text: string, target: number }) {
  const n = React.useMemo(() => countWords(text), [text]);
  const ok = n >= target;
  return (
    <span style={{ fontSize: 12, color: ok ? T.green : n >= target * 0.8 ? T.gold : T.textMuted, fontWeight: 600 }}>
      {n} words {ok ? "✓" : `(minimum: ${target})`}
    </span>
  );
});

export function SectionLabel({ text, color }: { text: string, color?: string }) {
  return (
    <span style={{ fontSize: 10, letterSpacing: ".12em", color: color || T.gold, background: (color || T.gold) + "14",
      padding: "3px 9px", borderRadius: 4, border: `1px solid ${(color || T.gold)}30`, fontWeight: 700, textTransform: "uppercase" }}>
      {text}
    </span>
  );
}
