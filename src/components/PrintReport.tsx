import React from "react";
import { T, btn, bandColor } from "../theme";
import { SectionLabel, BandBadge } from "./Shared";

export function PrintReport({ sessionLog, onClear, userProfile }: { sessionLog: any[], onClear: () => void, userProfile?: any }) {
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const skillGroups = sessionLog.reduce((acc, e) => {
    const key = e.type || e.skill || "other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {} as Record<string, any[]>);

  const scoredLogs = sessionLog.filter(e => e.score || e.band);
  const avgBand = scoredLogs.length > 0
    ? (scoredLogs.reduce((a, e) => a + (e.score || e.band), 0) / scoredLogs.length).toFixed(1)
    : null;

  const totalMistakes = sessionLog.reduce((acc, e) => acc + (e.mistakes?.length || 0), 0);
  const writingEntries = sessionLog.filter(e => e.type?.startsWith("writing"));

  if (sessionLog.length === 0) return (
    <div style={{ textAlign: "center", padding: "80px 40px" }}>
      <div style={{ fontSize: 48, marginBottom: 20 }}>📋</div>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: T.navy, marginBottom: 12 }}>No Activity Yet</h2>
      <p style={{ color: T.textMuted, fontSize: 14 }}>Complete exercises in any skill section and your results will appear here automatically.</p>
    </div>
  );

  return (
    <div>
      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <SectionLabel text="Session Review Report" color={T.navyLight} />
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, color: T.navy, margin: "6px 0 4px" }}>
            Your Learning Report
          </h2>
          <p style={{ color: T.textMuted, fontSize: 13 }}>{sessionLog.length} activities recorded · {today}</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClear} style={btn("danger")}>🗑 Clear Session</button>
          <button onClick={() => window.print()} style={btn("primary")}>🖨 Print Report</button>
        </div>
      </div>

      <div className="print-root" style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: "40px 48px" }}>
        <div style={{ borderBottom: `2px solid ${T.navy}`, paddingBottom: 20, marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: 9, color: T.textMuted, letterSpacing: ".18em", marginBottom: 8 }}>IELTS ACADEMIC MASTER — PERSONAL REVIEW REPORT</div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: T.navy, margin: "0 0 4px", fontWeight: 600 }}>
                {userProfile?.displayName ? `${userProfile.displayName}'s Report` : "Session Review"}
              </h1>
              <div style={{ fontSize: 13, color: T.textMuted }}>{today} {userProfile?.targetBand ? `· Target Band: ${userProfile.targetBand.toFixed(1)}` : ""}</div>
            </div>
            {avgBand && (
              <div style={{ textAlign: "center", background: bandColor(parseFloat(avgBand)) + "10", border: `2px solid ${bandColor(parseFloat(avgBand))}`, borderRadius: 10, padding: "12px 20px" }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: bandColor(parseFloat(avgBand)), fontFamily: "'Cormorant Garamond', serif", lineHeight: 1 }}>{avgBand}</div>
                <div style={{ fontSize: 10, color: T.textMuted, marginTop: 4, letterSpacing: ".08em" }}>SESSION AVG. BAND</div>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 36 }}>
          {[
            ["Activities", sessionLog.length, T.navy],
            ["Avg. Band", avgBand || "—", avgBand ? bandColor(parseFloat(avgBand)) : T.textMuted],
            ["Mistakes", totalMistakes, totalMistakes > 0 ? T.burgundy : T.green],
            ["Writing Done", writingEntries.length, T.gold],
          ].map(([l, v, c]) => (
            <div key={l as string} style={{ background: T.bgDeep, borderRadius: 8, padding: "14px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: c as string, fontFamily: "'Cormorant Garamond', serif", lineHeight: 1 }}>{v as number | string}</div>
              <div style={{ fontSize: 10, color: T.textMuted, marginTop: 6, letterSpacing: ".08em" }}>{(l as string).toUpperCase()}</div>
            </div>
          ))}
        </div>

        {Object.entries(skillGroups).map(([skill, entries]: [string, any[]]) => (
          <div key={skill} style={{ marginBottom: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, paddingBottom: 10, borderBottom: `1px solid ${T.borderLight}` }}>
              <div style={{ width: 4, height: 28, background: T.gold, borderRadius: 2 }} />
              <div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: T.navy, margin: 0, fontWeight: 600 }}>{skill}</h2>
                <div style={{ fontSize: 12, color: T.textMuted }}>{entries.length} attempt{entries.length > 1 ? "s" : ""}</div>
              </div>
              {entries.some(e => e.band) && (
                <div style={{ marginLeft: "auto" }}>
                  <BandBadge band={entries.filter(e=>e.band).reduce((a,e)=>a+e.band,0)/entries.filter(e=>e.band).length} size="sm" />
                </div>
              )}
            </div>

            {entries.map((entry, ei) => (
              <div key={entry.id} style={{ marginBottom: 28, paddingBottom: 28, borderBottom: ei < entries.length - 1 ? `1px dashed ${T.borderLight}` : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 3 }}>
                      {entry.timestamp} · {entry.section}
                    </div>
                    {entry.score && <div style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>Score: {entry.score}</div>}
                  </div>
                  {entry.band && <BandBadge band={entry.band} size="sm" />}
                </div>

                {entry.prompt && (
                  <div style={{ background: T.bgDeep, borderRadius: 8, padding: "12px 14px", marginBottom: 14, borderLeft: `3px solid ${T.gold}` }}>
                    <div style={{ fontSize: 10, color: T.gold, fontWeight: 700, letterSpacing: ".1em", marginBottom: 6 }}>PROMPT</div>
                    <p style={{ fontSize: 13, color: T.textMid, margin: 0, lineHeight: 1.7, fontStyle: "italic" }}>{entry.prompt}</p>
                  </div>
                )}

                {entry.yourResponse && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 10, color: T.navy, fontWeight: 700, letterSpacing: ".1em", marginBottom: 6 }}>YOUR RESPONSE</div>
                    <div style={{ background: T.navy + "04", border: `1px solid ${T.navy}15`, borderRadius: 8, padding: "12px 14px", fontSize: 13, color: T.text, lineHeight: 1.9, fontFamily: "'EB Garamond', Georgia, serif", maxHeight: 180, overflow: "hidden", position: "relative" }}>
                      {entry.yourResponse}
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 40, background: "linear-gradient(transparent, #fff)" }} />
                    </div>
                    {entry.wordCount && <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>{entry.wordCount} words</div>}
                  </div>
                )}

                {entry.transcript && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 10, color: T.navy, fontWeight: 700, letterSpacing: ".1em", marginBottom: 6 }}>YOUR TRANSCRIPT</div>
                    <div style={{ background: T.navy + "04", border: `1px solid ${T.navy}15`, borderRadius: 8, padding: "12px 14px", fontSize: 13, color: T.text, lineHeight: 1.9, fontFamily: "'EB Garamond', Georgia, serif", maxHeight: 180, overflow: "hidden", position: "relative" }}>
                      {entry.transcript}
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 40, background: "linear-gradient(transparent, #fff)" }} />
                    </div>
                  </div>
                )}

                {entry.mistakes && entry.mistakes.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 10, color: T.burgundy, fontWeight: 700, letterSpacing: ".1em", marginBottom: 10 }}>
                      ✗ MISTAKES ({entry.mistakes.length})
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {entry.mistakes.map((m: any, mi: number) => (
                        <div key={mi} style={{ background: T.burgundy + "06", border: `1px solid ${T.burgundy}20`, borderRadius: 8, padding: "10px 14px" }}>
                          <div style={{ fontSize: 12, color: T.text, marginBottom: 6, lineHeight: 1.6 }}>
                            <strong style={{ color: T.textMuted }}>Q:</strong> {m.question}
                          </div>
                          <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
                            <span><strong style={{ color: T.burgundy }}>Your answer:</strong> <span style={{ color: T.burgundy }}>{m.yourAnswer}</span></span>
                            <span><strong style={{ color: T.green }}>Correct:</strong> <span style={{ color: T.green }}>{m.correctAnswer}</span></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {entry.type === "writing" && entry.criteria && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 10, color: T.navyLight, fontWeight: 700, letterSpacing: ".1em", marginBottom: 10 }}>BAND CRITERIA</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {Object.entries(entry.criteria).map(([k, v]) => {
                        const label = k === "taskAchievement" ? "Task Achievement" : k === "taskResponse" ? "Task Response" : k === "coherenceCohesion" ? "Coherence & Cohesion" : k === "lexicalResource" ? "Lexical Resource" : "Grammatical Range";
                        const note = entry.criteriaFeedback?.[k];
                        return (
                          <div key={k} style={{ background: bandColor(v as number) + "08", border: `1px solid ${bandColor(v as number)}25`, borderRadius: 7, padding: "10px 12px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                              <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 700 }}>{label.toUpperCase()}</div>
                              <div style={{ fontSize: 14, fontWeight: 800, color: bandColor(v as number), fontFamily: "monospace" }}>{v as number}/9</div>
                            </div>
                            {note && <div style={{ fontSize: 11, color: T.textMid, lineHeight: 1.6 }}>{note as string}</div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {entry.type === "speaking" && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                    {[["Fluency", entry.fluencyBand], ["Vocabulary", entry.vocabularyBand], ["Grammar", entry.grammarBand]].map(([l, v]) => v && (
                      <div key={l as string} style={{ background: bandColor(v as number) + "08", border: `1px solid ${bandColor(v as number)}25`, borderRadius: 7, padding: "8px 12px", textAlign: "center" }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: bandColor(v as number), fontFamily: "monospace" }}>{v as number}</div>
                        <div style={{ fontSize: 9, color: T.textMuted, marginTop: 2 }}>{l as string}</div>
                      </div>
                    ))}
                  </div>
                )}

                {(entry.whatWorks || entry.strengths) && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                    <div style={{ background: T.green + "06", border: `1px solid ${T.green}20`, borderRadius: 8, padding: "10px 12px" }}>
                      <div style={{ fontSize: 10, color: T.green, fontWeight: 700, marginBottom: 8 }}>✓ WHAT'S WORKING</div>
                      {(entry.whatWorks || entry.strengths || []).map((s: string, i: number) => (
                        <div key={i} style={{ fontSize: 11, color: T.green + "bb", marginBottom: 3, lineHeight: 1.5 }}>• {s}</div>
                      ))}
                    </div>
                    {(entry.improvements) && (
                      <div style={{ background: T.burgundy + "06", border: `1px solid ${T.burgundy}20`, borderRadius: 8, padding: "10px 12px" }}>
                        <div style={{ fontSize: 10, color: T.burgundy, fontWeight: 700, marginBottom: 8 }}>⚠ TO IMPROVE</div>
                        {entry.improvements.map((s: string, i: number) => (
                          <div key={i} style={{ fontSize: 11, color: T.burgundy + "bb", marginBottom: 3, lineHeight: 1.5 }}>• {s}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {entry.bandGap && (
                  <div style={{ background: T.gold + "10", border: `1px solid ${T.gold}30`, borderRadius: 7, padding: "10px 14px", marginBottom: 12 }}>
                    <span style={{ fontSize: 10, color: T.gold, fontWeight: 700, marginRight: 8 }}>▶ KEY TO HIGHER BAND:</span>
                    <span style={{ fontSize: 12, color: T.textMid }}>{entry.bandGap}</span>
                  </div>
                )}

                {(entry.modelOpener || entry.upgradedResponse) && (
                  <div style={{ background: T.navy + "05", border: `1px solid ${T.navy}15`, borderRadius: 8, padding: "12px 14px", marginBottom: 10 }}>
                    <div style={{ fontSize: 10, color: T.navyLight, fontWeight: 700, marginBottom: 6 }}>
                      {entry.modelOpener ? "BAND 8+ MODEL OPENER" : "BAND 8 REWRITE"}
                    </div>
                    <div style={{ fontSize: 13, color: T.text, fontStyle: "italic", lineHeight: 1.8, fontFamily: "'EB Garamond', Georgia, serif" }}>
                      "{entry.modelOpener || entry.upgradedResponse}"
                    </div>
                  </div>
                )}

                {entry.targetVocabulary?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 700, letterSpacing: ".08em", marginBottom: 7 }}>VOCABULARY TO LEARN</div>
                    <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                      {entry.targetVocabulary.map((w: string) => (
                        <span key={w} style={{ background: T.navy + "08", border: `1px solid ${T.navy}20`, borderRadius: 5, padding: "3px 10px", fontSize: 12, color: T.navyMid, fontStyle: "italic" }}>{w}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}

        <div style={{ borderTop: `1px solid ${T.borderLight}`, paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 11, color: T.textMuted, fontStyle: "italic" }}>IELTS Academic Master · Band 7.5 Preparation System</div>
          <div style={{ fontSize: 11, color: T.textMuted }}>{today}</div>
        </div>
      </div>
    </div>
  );
}
