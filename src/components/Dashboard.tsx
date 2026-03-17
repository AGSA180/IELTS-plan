import React, { useState } from "react";
import { T, bandColor, card, btn } from "../theme";
import { generateStudyPlanAndAnalytics } from "../services/ai";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Headphones, FileText, BarChart2, PenTool, Mic, BookOpen, Timer, Lightbulb, Trophy, TrendingUp, Dumbbell, Sparkles } from "lucide-react";

export function Dashboard({ setView, bandScores, logs, userProfile }: { setView: (id: string) => void, bandScores: Record<string, number>, logs: any[], userProfile?: any }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [plan, setPlan] = useState<any>(null);

  const skills = [
    { id: "listening", label: "Listening", icon: <Headphones size={24} />, desc: "Transcript-based practice · 2 sections", color: T.navyLight },
    { id: "reading", label: "Reading", icon: <FileText size={24} />, desc: "T/F/NG · MCQ · Sentence completion", color: T.navy },
    { id: "writing1", label: "Writing Task 1", icon: <BarChart2 size={24} />, desc: "Graph & diagram description · AI marked", color: T.burgundy },
    { id: "writing2", label: "Writing Task 2", icon: <PenTool size={24} />, desc: "Academic essay · Official band descriptors", color: T.burgundy },
    { id: "speaking", label: "Speaking", icon: <Mic size={24} />, desc: "Parts 1, 2 & 3 · AI band assessment", color: T.green },
    { id: "vocab", label: "Vocabulary", icon: <BookOpen size={24} />, desc: "Academic Word List · Spaced Repetition", color: T.gold },
    { id: "mocktest", label: "Full Mock Test", icon: <Timer size={24} />, desc: "Simulate real exam conditions · 2h 45m", color: T.navy },
  ];

  // Calculate average band from logs
  const scoredLogs = logs.filter(l => l.score || l.band);
  const avgBand = scoredLogs.length > 0
    ? (scoredLogs.reduce((a, b) => a + (b.score || b.band), 0) / scoredLogs.length).toFixed(1)
    : null;

  const targetBand = userProfile?.targetBand || 7.5;

  const chartData = [...scoredLogs]
    .sort((a, b) => new Date(a.createdAt?.toDate?.() || a.id).getTime() - new Date(b.createdAt?.toDate?.() || b.id).getTime())
    .map((l, i) => ({
      name: `Attempt ${i + 1}`,
      band: l.score || l.band,
      skill: l.type || l.skill
    }));

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await generateStudyPlanAndAnalytics(logs, targetBand);
      if (!res || !res.studyPlan || res.studyPlan.length === 0) {
        alert("Failed to generate a complete study plan. Please try again.");
        setPlan(null);
      } else {
        setPlan(res);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to analyze. Please try again.");
    }
    setAnalyzing(false);
  };

  return (
    <div>
      <div style={{ marginBottom: 36, padding: "32px 0", borderBottom: `1px solid ${T.borderLight}` }}>
        <div style={{ fontSize: 10, color: T.gold, letterSpacing: ".18em", fontWeight: 700, marginBottom: 12 }}>IELTS ACADEMIC PREPARATION</div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 600, color: T.navy, margin: "0 0 8px", lineHeight: 1.15 }}>
          Band {targetBand.toFixed(1)} Mastery System
        </h1>
        <p style={{ color: T.textLight, fontSize: 14, margin: "0 0 24px", maxWidth: 560 }}>
          Official task formats · AI-marked writing & speaking · Realistic exam conditions
        </p>
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          {avgBand && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 16, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: "12px 20px" }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: bandColor(parseFloat(avgBand)), fontFamily: "'Cormorant Garamond', serif" }}>{avgBand}</div>
                <div style={{ fontSize: 10, color: T.textMuted }}>CURRENT AVG. BAND</div>
              </div>
              <div style={{ width: 1, height: 40, background: T.borderLight }} />
              <div>
                <div style={{ fontSize: 13, color: T.navy, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                  {parseFloat(avgBand) >= targetBand ? <><Trophy size={14} color={T.gold} /> Target Achieved!</> : parseFloat(avgBand) >= targetBand - 0.5 ? <><TrendingUp size={14} color={T.green} /> Very Close</> : <><Dumbbell size={14} color={T.navyLight} /> Keep Practising</>}
                </div>
                <div style={{ fontSize: 11, color: T.textMuted }}>Target: {targetBand.toFixed(1)} across all skills</div>
              </div>
            </div>
          )}
          
          {userProfile?.streak > 0 && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 12, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: "12px 20px" }}>
              <div style={{ background: T.gold + "20", padding: 8, borderRadius: "50%", color: T.gold }}>
                <Sparkles size={20} />
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: T.navy, fontFamily: "'Cormorant Garamond', serif" }}>{userProfile.streak} Day{userProfile.streak > 1 ? 's' : ''}</div>
                <div style={{ fontSize: 10, color: T.textMuted, letterSpacing: ".05em" }}>CURRENT STREAK</div>
              </div>
            </div>
          )}

          <button onClick={handleAnalyze} disabled={analyzing} style={{ ...btn(analyzing ? "secondary" : "primary"), padding: "16px 24px", height: "fit-content" }}>
            {analyzing ? "Analyzing History..." : <><Sparkles size={16} /> Generate Smart Study Plan</>}
          </button>
        </div>
      </div>

      {chartData.length > 1 && (
        <div style={{ ...card(), marginBottom: 36 }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: T.navy, marginBottom: 20 }}>Your Progress Over Time</h2>
          <div style={{ height: 250, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={T.borderLight} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: T.textMuted }} axisLine={false} tickLine={false} />
                <YAxis domain={[4, 9]} ticks={[4, 5, 6, 7, 8, 9]} tick={{ fontSize: 11, fill: T.textMuted }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: 8, border: `1px solid ${T.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  labelStyle={{ color: T.navy, fontWeight: 700, marginBottom: 4 }}
                />
                <Line type="monotone" dataKey="band" stroke={T.gold} strokeWidth={3} dot={{ r: 4, fill: T.gold, strokeWidth: 0 }} activeDot={{ r: 6, fill: T.navy }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {plan && (
        <div style={{ ...card(), marginBottom: 36, border: `2px solid ${T.gold}` }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: T.navy, marginBottom: 20 }}>Your Personalized Study Plan</h2>
          
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, color: T.burgundy, marginBottom: 12, textTransform: "uppercase", letterSpacing: ".05em" }}>Top Weaknesses Detected</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {plan.weaknesses?.map((w: any, i: number) => (
                <div key={i} style={{ background: T.bgDeep, padding: 16, borderRadius: 8 }}>
                  <div style={{ fontWeight: 700, color: T.navy, marginBottom: 4 }}>{w.skill}</div>
                  <div style={{ fontSize: 12, color: T.textMid, marginBottom: 8 }}>{w.description}</div>
                  <div style={{ fontSize: 12, color: T.green, fontWeight: 600, display: "flex", alignItems: "flex-start", gap: 6 }}><Lightbulb size={14} style={{ marginTop: 2, flexShrink: 0 }} /> <span>{w.advice}</span></div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: 14, color: T.navy, marginBottom: 12, textTransform: "uppercase", letterSpacing: ".05em" }}>7-Day Action Plan</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {plan.studyPlan?.map((p: any, i: number) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, background: T.surface, border: `1px solid ${T.borderLight}`, padding: "12px 16px", borderRadius: 8 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: T.navyLight, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                    D{p.day}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: T.navy, fontSize: 14 }}>{p.focus}</div>
                    <div style={{ fontSize: 12, color: T.textMuted }}>{p.task}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 32 }}>
        {skills.map(s => {
          // Find latest score for this skill
          const skillLogs = logs.filter(l => l.type === s.id && l.score);
          const latestScore = skillLogs.length > 0 ? skillLogs[skillLogs.length - 1].score : null;

          return (
            <button key={s.id} onClick={() => setView(s.id)}
              style={{
                background: T.surface, border: `1px solid ${T.border}`, borderTop: `3px solid ${s.color}`,
                borderRadius: 12, padding: "20px", cursor: "pointer", textAlign: "left",
                transition: "all .2s", fontFamily: "inherit",
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,.08)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ color: s.color, marginBottom: 16 }}>{s.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 6, fontFamily: "'Cormorant Garamond', serif" }}>{s.label}</div>
              <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.6, marginBottom: 12 }}>{s.desc}</div>
              {latestScore && (
                <div style={{ display: "inline-block", background: bandColor(latestScore) + "10", border: `1px solid ${bandColor(latestScore)}40`, borderRadius: 5, padding: "2px 8px", fontSize: 11, color: bandColor(latestScore), fontWeight: 700 }}>
                  Latest: Band {latestScore}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ ...card(), background: T.bgDeep }}>
        <div style={{ fontSize: 11, color: T.gold, fontWeight: 700, letterSpacing: ".1em", marginBottom: 16 }}>BAND 7–8 WRITING DESCRIPTORS (OFFICIAL)</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            ["Band 7", T.navy, "Addresses all parts of task; clear progression; varied vocabulary; few errors"],
            ["Band 7.5", T.gold, "Very clear position; sophisticated cohesion; uncommon vocabulary with precision"],
            ["Band 8", T.green, "Fully developed position; seamless cohesion; wide range; rare minor slips only"],
            ["Band 9", T.burgundy, "Expert user; fully appropriate; precise; error-free"],
          ].map(([l, c, d]) => (
            <div key={l as string} style={{ background: T.surface, borderRadius: 8, padding: 12, borderLeft: `3px solid ${c}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: c as string, marginBottom: 5 }}>{l as string}</div>
              <div style={{ fontSize: 12, color: T.textMid, lineHeight: 1.6 }}>{d as string}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
