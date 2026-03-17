import React, { useState, useEffect } from "react";
import { T, btn, card } from "../theme";
import { SectionLabel, BandBadge } from "./Shared";
import { LISTENING_SECTIONS, READING_PASSAGES, READING_TOPICS, LISTENING_CONTEXTS } from "../data";
import { generateListeningSection, generateReadingPassage } from "../services/ai";
import { playTTS, stopTTS } from "../utils/tts";
import { Volume2, Square } from "lucide-react";

export function ListeningSection({ logEntry }: { logEntry: any }) {
  const [sectionData, setSectionData] = useState<any>(LISTENING_SECTIONS[0]);
  const [generating, setGenerating] = useState(false);
  const [phase, setPhase] = useState("intro");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<{correct: number, total: number} | null>(null);
  const [useAI, setUseAI] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const section = sectionData;

  useEffect(() => {
    return () => stopTTS();
  }, []);

  const handlePlayAudio = () => {
    if (isPlaying) {
      stopTTS();
      setIsPlaying(false);
    } else {
      // Randomly select between British, Australian, and American accents for variety in listening
      const accents = ["en-GB", "en-AU", "en-US"];
      const randomAccent = accents[Math.floor(Math.random() * accents.length)];
      playTTS(section.transcript, 0.95, randomAccent);
      setIsPlaying(true);
      // Basic way to reset state when speech ends (not perfect but works for simple use case)
      const utterance = new SpeechSynthesisUtterance("");
      utterance.onend = () => setIsPlaying(false);
    }
  };

  const generateNew = async () => {
    setGenerating(true);
    const ctx = LISTENING_CONTEXTS[Math.floor(Math.random() * LISTENING_CONTEXTS.length)];
    const data = await generateListeningSection(ctx);
    if (data) setSectionData({
      id: `ai_${Date.now()}`,
      section: data.scenario?.includes("3") ? 3 : 1,
      scenario: data.scenario || ctx.ctx,
      context: data.context || ctx.ctx,
      transcript: data.transcript,
      questions: data.questions || [],
    });
    setPhase("intro"); setAnswers({}); setSubmitted(false); setScore(null);
    setGenerating(false); setUseAI(true);
  };

  const nextBuiltIn = () => {
    const idx = LISTENING_SECTIONS.findIndex(s => s.id === sectionData.id);
    const next = LISTENING_SECTIONS[(idx + 1) % LISTENING_SECTIONS.length];
    setSectionData(next); setPhase("intro"); setAnswers({}); setSubmitted(false); setScore(null); setUseAI(false);
  };

  const submit = () => {
    let correct = 0;
    const mistakes: any[] = [];
    section.questions.forEach((q: any) => {
      const userAns = (answers[q.id] || "").trim().toLowerCase();
      const correct_ans = (q.answer || "").toLowerCase();
      const isOk = q.type === "mcq"
        ? userAns === correct_ans
        : (userAns.includes(correct_ans) || correct_ans.includes(userAns));
      if (isOk) correct++;
      else mistakes.push({ question: q.question || q.q, yourAnswer: answers[q.id] || "(blank)", correctAnswer: q.answer });
    });
    setScore({ correct, total: section.questions.length });
    setSubmitted(true);
    if (logEntry) logEntry({
      skill: "Listening", section: section.scenario,
      score: `${correct}/${section.questions.length}`,
      band: correct / section.questions.length >= .9 ? 8.5 : correct / section.questions.length >= .8 ? 8 : correct / section.questions.length >= .7 ? 7.5 : correct / section.questions.length >= .6 ? 7 : 6.5,
      mistakes, type: "objective",
    });
  };

  const isCorrect = (q: any) => {
    const userAns = (answers[q.id] || "").trim().toLowerCase();
    const ca = (q.answer || "").toLowerCase();
    return q.type === "mcq" ? userAns === ca : (userAns.includes(ca) || ca.includes(userAns));
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", gap: 10, marginBottom: 6, alignItems: "center" }}>
            <SectionLabel text="Listening" color={T.navyLight} />
            <SectionLabel text={section.scenario} />
            {useAI && <SectionLabel text="AI Generated" color={T.green} />}
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: T.navy, margin: 0 }}>
            Section {section.section}
          </h2>
          <p style={{ color: T.textLight, fontSize: 13, marginTop: 4 }}>{section.context}</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={nextBuiltIn} style={{ ...btn("ghost"), fontSize: 11 }}>Built-in →</button>
          <button onClick={generateNew} disabled={generating} style={{ ...btn("gold", generating), fontSize: 11 }}>
            {generating ? "⟳ Generating…" : "✦ New AI Section"}
          </button>
        </div>
      </div>

      {generating && (
        <div style={{ ...card(), textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: 36, animation: "spin 1.5s linear infinite", display: "inline-block", color: T.gold }}>⟳</div>
          <p style={{ color: T.textMuted, margin: "14px 0 0", fontSize: 13 }}>Generating a unique listening section…</p>
        </div>
      )}

      {!generating && phase === "intro" && (
        <div style={card()}>
          <div style={{ fontSize: 13, color: T.textLight, marginBottom: 16, lineHeight: 1.7 }}>
            <strong style={{ color: T.navy }}>Instructions:</strong> Read the transcript carefully — as if listening — then answer questions from memory.
          </div>
          <button onClick={() => setPhase("reading")} style={btn("primary")}>Read Transcript</button>
        </div>
      )}

      {!generating && phase === "reading" && (
        <div>
          <div style={{ ...card(T.navyLight + "40"), marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: `1px solid ${T.borderLight}`, paddingBottom: 12 }}>
              <div style={{ fontSize: 11, color: T.navyLight, letterSpacing: ".1em", fontWeight: 700 }}>TRANSCRIPT — READ CAREFULLY AS IF LISTENING</div>
              <button onClick={handlePlayAudio} style={{ ...btn("gold"), padding: "6px 12px", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                {isPlaying ? <Square size={14} /> : <Volume2 size={14} />} {isPlaying ? "Stop Audio" : "Play Audio"}
              </button>
            </div>
            {(section.transcript || "").split("\\n\\n").map((para: string, i: number) => (
              <p key={i} style={{ fontSize: 14, color: T.text, lineHeight: 2, margin: "0 0 10px", fontFamily: "'EB Garamond', serif" }}>{para}</p>
            ))}
          </div>
          <button onClick={() => { setPhase("answering"); stopTTS(); setIsPlaying(false); }} style={btn("primary")}>Proceed to Questions →</button>
        </div>
      )}

      {!generating && phase === "answering" && (
        <div>
          <div style={{ ...card(), borderLeft: `3px solid ${T.burgundy}`, marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: T.burgundy, margin: 0, fontWeight: 600 }}>⚠ Do NOT refer back to the transcript. Answer from memory only.</p>
          </div>
          {section.questions.map((q: any, i: number) => (
            <div key={q.id} style={{ ...card(), marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 6 }}>Question {i + 1}</div>
              <p style={{ fontSize: 14, color: T.text, margin: "0 0 12px", lineHeight: 1.7 }}>{q.question || q.q}</p>
              {q.type === "short" && (
                <input value={answers[q.id] || ""} onChange={e => setAnswers(p => ({ ...p, [q.id]: e.target.value }))}
                  disabled={submitted} placeholder="Your answer…"
                  style={{ width: "100%", padding: "8px 12px", border: `1.5px solid ${submitted ? (isCorrect(q) ? T.green : T.burgundy) : T.border}`, borderRadius: 7, fontSize: 14, color: T.text, background: submitted ? (isCorrect(q) ? T.green + "0a" : T.burgundy + "0a") : T.surface, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                />
              )}
              {q.type === "mcq" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {(q.options || []).map((opt: string, oi: number) => {
                    const letter = opt[0];
                    const isSel = answers[q.id] === letter;
                    const isRight = q.answer === letter;
                    let bg = T.surface, border = T.border, col = T.textMid;
                    if (submitted) { if (isRight) { bg = T.green + "10"; border = T.green; col = T.green; } else if (isSel) { bg = T.burgundy + "10"; border = T.burgundy; col = T.burgundy; } }
                    else if (isSel) { bg = T.navy + "08"; border = T.navy; col = T.navy; }
                    return <button key={oi} onClick={() => { if (!submitted) setAnswers(p => ({ ...p, [q.id]: letter })); }} style={{ padding: "10px 14px", background: bg, border: `1.5px solid ${border}`, borderRadius: 7, color: col, cursor: submitted ? "default" : "pointer", textAlign: "left", fontSize: 13, transition: "all .15s" }}>{opt}</button>;
                  })}
                </div>
              )}
              {submitted && <div style={{ marginTop: 8, fontSize: 12 }}>{isCorrect(q) ? <span style={{ color: T.green }}>✓ Correct</span> : <span style={{ color: T.burgundy }}>✗ Correct: <strong>{q.answer}</strong></span>}</div>}
            </div>
          ))}
          {!submitted
            ? <button onClick={submit} style={btn("primary")}>Submit Answers</button>
            : (
              <div style={{ ...card(), borderTop: `4px solid ${T.navy}`, marginTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${T.borderLight}` }}>
                  <div>
                    <div style={{ fontSize: 11, color: T.textMuted, letterSpacing: ".12em", marginBottom: 8, fontWeight: 700 }}>OFFICIAL LISTENING REPORT</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: T.navy, fontFamily: "monospace", lineHeight: 1 }}>{score?.correct}<span style={{ fontSize: 18, color: T.textMuted }}>/{score?.total}</span></div>
                    <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>Raw Score</div>
                  </div>
                  <BandBadge band={score!.correct / score!.total >= .9 ? 8.5 : score!.correct / score!.total >= .8 ? 8 : score!.correct / score!.total >= .7 ? 7.5 : score!.correct / score!.total >= .6 ? 7 : 6.5} size="lg" />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button onClick={generateNew} style={btn("gold")}>✦ New AI Section</button>
                </div>
              </div>
            )
          }
        </div>
      )}
    </div>
  );
}

export function ReadingSection({ logEntry }: { logEntry: any }) {
  const [passageData, setPassageData] = useState<any>(null);
  const [builtInIdx, setBuiltInIdx] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<{correct: number, total: number} | null>(null);
  const [useAI, setUseAI] = useState(false);

  const passage = passageData || READING_PASSAGES[builtInIdx % READING_PASSAGES.length];

  const generateNew = async () => {
    setGenerating(true);
    const topic = READING_TOPICS[Math.floor(Math.random() * READING_TOPICS.length)];
    const data = await generateReadingPassage(topic);
    if (data) {
      const questions = [];
      if (data.tfng?.length) questions.push({ type:"tfng", instruction:"Do the following statements agree with the information in the passage? Write TRUE, FALSE or NOT GIVEN.", items: data.tfng.map((q:any) => ({ id:q.id, q:q.statement, answer:q.answer })) });
      if (data.mcq?.length) questions.push({ type:"mcq", instruction:"Choose the correct letter, A, B, C or D.", items: data.mcq.map((q:any) => ({ id:q.id, q:q.question, options:q.options, answer:q.answer })) });
      if (data.completion?.length) questions.push({ type:"complete", instruction:"Complete the sentences using NO MORE THAN THREE WORDS from the passage.", items: data.completion.map((q:any) => ({ id:q.id, q:q.sentence, answer:q.answer })) });
      setPassageData({ id:`ai_${Date.now()}`, title:data.title, difficulty:2, text:data.paragraphs, questions });
      setUseAI(true);
    }
    setAnswers({}); setSubmitted(false); setScore(null);
    setGenerating(false);
  };

  const nextBuiltIn = () => {
    setPassageData(null); setBuiltInIdx(i => i + 1);
    setAnswers({}); setSubmitted(false); setScore(null); setUseAI(false);
  };

  const submit = () => {
    let correct = 0, total = 0;
    const mistakes: any[] = [];
    passage.questions.forEach((qGroup: any) => {
      qGroup.items.forEach((q: any) => {
        total++;
        const ua = (answers[q.id] || "").trim().toUpperCase();
        const ca = q.answer.toUpperCase();
        let isOk = false;
        if (qGroup.type === "complete") isOk = (answers[q.id] || "").trim().toLowerCase().includes(q.answer.toLowerCase().split(" ")[0]);
        else isOk = ua === ca;
        if (isOk) correct++;
        else mistakes.push({ question: q.q, yourAnswer: answers[q.id] || "(blank)", correctAnswer: q.answer, type: qGroup.type });
      });
    });
    setScore({ correct, total }); setSubmitted(true);
    if (logEntry) logEntry({ skill:"Reading", section:passage.title, score:`${correct}/${total}`, band: correct/total >= .9 ? 8.5 : correct/total >= .8 ? 8 : correct/total >= .7 ? 7.5 : correct/total >= .6 ? 7 : 6.5, mistakes, type:"objective" });
  };

  const isCorrect = (q: any, type: string) => {
    if (type === "complete") return (answers[q.id] || "").trim().toLowerCase().includes(q.answer.toLowerCase().split(" ")[0]);
    return (answers[q.id] || "").trim().toUpperCase() === q.answer.toUpperCase();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", gap: 10, marginBottom: 6, alignItems: "center" }}>
            <SectionLabel text="Academic Reading" color={T.navyLight} />
            <SectionLabel text={`Passage — ${passage.title}`} />
            {useAI && <SectionLabel text="AI Generated" color={T.green} />}
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: T.navy, margin: 0 }}>{passage.title}</h2>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={nextBuiltIn} style={{ ...btn("ghost"), fontSize: 11 }}>Built-in →</button>
          <button onClick={generateNew} disabled={generating} style={{ ...btn("gold", generating), fontSize: 11 }}>
            {generating ? "⟳ Generating…" : "✦ New AI Passage"}
          </button>
        </div>
      </div>

      {generating && (
        <div style={{ ...card(), textAlign:"center", padding: 48 }}>
          <div style={{ fontSize: 36, animation:"spin 1.5s linear infinite", display:"inline-block", color: T.gold }}>⟳</div>
          <p style={{ color: T.textMuted, margin:"14px 0 0", fontSize: 13 }}>Generating a unique academic passage with questions…</p>
        </div>
      )}

      {!generating && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ ...card(), maxHeight: 600, overflowY: "auto" }}>
          <div style={{ fontSize: 10, color: T.textMuted, letterSpacing: ".1em", marginBottom: 14 }}>READING PASSAGE</div>
          {passage.text.map((para: string, i: number) => (
            <p key={i} style={{ fontSize: 14, color: T.text, lineHeight: 2.1, margin: "0 0 14px", fontFamily: "'EB Garamond', Georgia, serif" }}>
              <sup style={{ color: T.textMuted, fontSize: 10, marginRight: 4 }}>{i + 1}</sup>{para}
            </p>
          ))}
        </div>

        <div style={{ maxHeight: 600, overflowY: "auto" }}>
          {passage.questions.map((qGroup: any, gi: number) => (
            <div key={gi} style={{ ...card(), marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: T.gold, fontWeight: 700, letterSpacing: ".1em", marginBottom: 8 }}>
                {qGroup.type === "tfng" ? "TRUE / FALSE / NOT GIVEN" : qGroup.type === "mcq" ? "MULTIPLE CHOICE" : "SENTENCE COMPLETION"}
              </div>
              <p style={{ fontSize: 12, color: T.textMid, marginBottom: 14, lineHeight: 1.6, fontStyle: "italic" }}>{qGroup.instruction}</p>

              {qGroup.type === "tfng" && qGroup.items.map((q: any, qi: number) => (
                <div key={q.id} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: qi < qGroup.items.length - 1 ? `1px solid ${T.borderLight}` : "none" }}>
                  <p style={{ fontSize: 13, color: T.text, margin: "0 0 8px", lineHeight: 1.7 }}>{qi + 1}. {q.q}</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["TRUE", "FALSE", "NOT GIVEN"].map(opt => {
                      const sel = answers[q.id] === opt;
                      const correct = q.answer === opt;
                      let style: any = { padding: "5px 12px", borderRadius: 5, fontSize: 11, fontWeight: 600, cursor: submitted ? "default" : "pointer", border: "1.5px solid", transition: "all .15s" };
                      if (submitted) {
                        style.background = correct ? T.green + "15" : (sel && !correct) ? T.burgundy + "15" : T.bgDeep;
                        style.borderColor = correct ? T.green : (sel && !correct) ? T.burgundy : T.border;
                        style.color = correct ? T.green : (sel && !correct) ? T.burgundy : T.textMuted;
                      } else {
                        style.background = sel ? T.navy + "08" : T.bgDeep;
                        style.borderColor = sel ? T.navy : T.border;
                        style.color = sel ? T.navy : T.textMid;
                      }
                      return <button key={opt} onClick={() => { if (!submitted) setAnswers(p => ({ ...p, [q.id]: opt })); }} style={style}>{opt}</button>;
                    })}
                  </div>
                </div>
              ))}

              {qGroup.type === "mcq" && qGroup.items.map((q: any, qi: number) => (
                <div key={q.id} style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 13, color: T.text, margin: "0 0 10px", lineHeight: 1.7 }}>{qi + 1}. {q.q}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {q.options.map((opt: string, oi: number) => {
                      const letter = opt[0];
                      const isSel = answers[q.id] === letter;
                      const isRight = q.answer === letter;
                      let bg = T.bgDeep, border = T.border, col = T.textMid;
                      if (submitted) {
                        if (isRight) { bg = T.green + "10"; border = T.green; col = T.green; }
                        else if (isSel) { bg = T.burgundy + "10"; border = T.burgundy; col = T.burgundy; }
                      } else if (isSel) { bg = T.navy + "08"; border = T.navy; col = T.navy; }
                      return (
                        <button key={oi} onClick={() => { if (!submitted) setAnswers(p => ({ ...p, [q.id]: letter })); }}
                          style={{ padding: "8px 12px", background: bg, border: `1.5px solid ${border}`, borderRadius: 6, color: col, cursor: submitted ? "default" : "pointer", textAlign: "left", fontSize: 12, transition: "all .15s" }}>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {qGroup.type === "complete" && qGroup.items.map((q: any, qi: number) => (
                <div key={q.id} style={{ marginBottom: 14 }}>
                  <p style={{ fontSize: 13, color: T.text, margin: "0 0 8px", lineHeight: 1.7 }}>
                    {qi + 1}. {q.q.split("__________")[0]}
                    <input
                      value={answers[q.id] || ""}
                      onChange={e => setAnswers(p => ({ ...p, [q.id]: e.target.value }))}
                      disabled={submitted}
                      style={{
                        width: 160, padding: "3px 8px", margin: "0 6px",
                        border: `1.5px solid ${submitted ? (isCorrect(q, "complete") ? T.green : T.burgundy) : T.border}`,
                        borderRadius: 5, fontSize: 12, background: T.surface, outline: "none", fontFamily: "inherit",
                        color: submitted ? (isCorrect(q, "complete") ? T.green : T.burgundy) : T.text,
                      }}
                    />
                    {q.q.split("__________")[1]}
                  </p>
                  {submitted && !isCorrect(q, "complete") && (
                    <p style={{ fontSize: 11, color: T.burgundy, margin: 0 }}>Answer: <strong>{q.answer}</strong></p>
                  )}
                </div>
              ))}
            </div>
          ))}

          {!submitted
            ? <button onClick={submit} style={btn("primary")}>Submit All Answers</button>
            : (
              <div style={{ ...card(), borderTop: `4px solid ${T.navy}`, marginTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${T.borderLight}` }}>
                  <div>
                    <div style={{ fontSize: 11, color: T.textMuted, letterSpacing: ".12em", marginBottom: 8, fontWeight: 700 }}>OFFICIAL READING REPORT</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: T.navy, fontFamily: "monospace", lineHeight: 1 }}>{score?.correct}<span style={{ fontSize: 18, color: T.textMuted }}>/{score?.total}</span></div>
                    <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>Raw Score</div>
                  </div>
                  <BandBadge band={score!.correct / score!.total >= .9 ? 8.5 : score!.correct / score!.total >= .8 ? 8 : score!.correct / score!.total >= .7 ? 7.5 : score!.correct / score!.total >= .6 ? 7 : 6.5} size="lg" />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button onClick={generateNew} style={btn("gold")}>✦ New AI Passage</button>
                </div>
              </div>
            )
          }
        </div>
      </div>}
    </div>
  );
}
