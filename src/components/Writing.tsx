import React, { useState } from "react";
import { T, btn, card, bandColor } from "../theme";
import { SectionLabel, TimerBar, WordCount, BandBadge, CriterionBar } from "./Shared";
import { WRITING_T1_PROMPTS, WRITING_T2_PROMPTS } from "../data";
import { generateWritingT1, generateWritingT2, getWritingFeedback, getWritingHints, chatWithExaminer } from "../services/ai";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Lightbulb, Sparkles, Send, RefreshCw, MessageCircle, Timer, GraduationCap, Volume2 } from "lucide-react";

function ChartRenderer({ prompt }: { prompt: any }) {
  if (!prompt.chartData) {
    return <p style={{ fontSize: 13, color: T.textMid, margin: 0, lineHeight: 1.8 }}>{prompt.data}</p>;
  }

  const COLORS = ['#1a365d', '#d4af37', '#718096', '#2b6cb0', '#4a5568', '#e2e8f0'];

  switch (prompt.type) {
    case 'line graph':
      return (
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={prompt.chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.borderLight} />
              <XAxis dataKey="year" stroke={T.textMuted} fontSize={12} />
              <YAxis stroke={T.textMuted} fontSize={12} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {Object.keys(prompt.chartData[0]).filter(k => k !== 'year').map((key, i) => (
                <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} strokeWidth={2} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    case 'bar chart':
      return (
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={prompt.chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.borderLight} />
              <XAxis dataKey="subject" stroke={T.textMuted} fontSize={12} />
              <YAxis stroke={T.textMuted} fontSize={12} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {Object.keys(prompt.chartData[0]).filter(k => k !== 'subject').map((key, i) => (
                <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    case 'pie chart':
      return (
        <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 20 }}>
          {Object.keys(prompt.chartData).map((yearKey) => (
            <div key={yearKey} style={{ width: 250, height: 250, textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 'bold', color: T.navy, marginBottom: 10 }}>{yearKey.replace('year', '')}</div>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={prompt.chartData[yearKey]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {prompt.chartData[yearKey].map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      );
    case 'table':
      return (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: T.navy, color: 'white' }}>
                {prompt.chartData.headers.map((h: string, i: number) => (
                  <th key={i} style={{ padding: '10px 12px', border: `1px solid ${T.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {prompt.chartData.rows.map((row: string[], i: number) => (
                <tr key={i} style={{ backgroundColor: i % 2 === 0 ? T.surface : T.bgDeep }}>
                  {row.map((cell: string, j: number) => (
                    <td key={j} style={{ padding: '8px 12px', border: `1px solid ${T.border}`, color: T.text }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'process diagram':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 10 }}>
          {prompt.chartData.steps.map((step: string, i: number) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ background: T.gold, color: 'white', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 'bold', flexShrink: 0 }}>{i + 1}</div>
              <div style={{ background: T.surface, padding: '10px 15px', borderRadius: 8, border: `1px solid ${T.border}`, flexGrow: 1, fontSize: 13, color: T.text }}>{step.replace(/^\d+\.\s*/, '')}</div>
              {i < prompt.chartData.steps.length - 1 && <div style={{ color: T.gold, fontSize: 20 }}>↓</div>}
            </div>
          ))}
        </div>
      );
    case 'map comparison':
      return (
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 250, background: T.surface, padding: 15, borderRadius: 8, border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 14, fontWeight: 'bold', color: T.navy, marginBottom: 10, borderBottom: `1px solid ${T.borderLight}`, paddingBottom: 5 }}>Before</div>
            <p style={{ fontSize: 13, color: T.textMid, lineHeight: 1.6 }}>{prompt.chartData.before}</p>
          </div>
          <div style={{ flex: 1, minWidth: 250, background: T.surface, padding: 15, borderRadius: 8, border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 14, fontWeight: 'bold', color: T.navy, marginBottom: 10, borderBottom: `1px solid ${T.borderLight}`, paddingBottom: 5 }}>After (Planned)</div>
            <p style={{ fontSize: 13, color: T.textMid, lineHeight: 1.6 }}>{prompt.chartData.after}</p>
          </div>
        </div>
      );
    case 'mixed charts':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
          <div style={{ width: '100%', height: 250 }}>
            <div style={{ fontSize: 12, fontWeight: 'bold', color: T.navy, marginBottom: 5, textAlign: 'center' }}>Visitors (Millions)</div>
            <ResponsiveContainer>
              <BarChart data={prompt.chartData.bar} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={T.borderLight} />
                <XAxis dataKey="year" stroke={T.textMuted} fontSize={12} />
                <YAxis stroke={T.textMuted} fontSize={12} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {Object.keys(prompt.chartData.bar[0]).filter(k => k !== 'year').map((key, i) => (
                  <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ width: '100%', height: 250, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 'bold', color: T.navy, marginBottom: 5 }}>Age Distribution (2012)</div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={prompt.chartData.pie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                  {prompt.chartData.pie.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    default:
      return <p style={{ fontSize: 13, color: T.textMid, margin: 0, lineHeight: 1.8 }}>{prompt.data}</p>;
  }
}

function ExaminerChat({ task, prompt, userText, feedback }: { task: number, prompt: string, userText: string, feedback: any }) {
  const [messages, setMessages] = useState<{role: "user" | "examiner", text: string}[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);
    try {
      const reply = await chatWithExaminer(task, prompt, userText, feedback, messages, userMsg);
      setMessages(prev => [...prev, { role: "examiner", text: reply }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: "examiner", text: "I'm sorry, I encountered an error. Please try asking again." }]);
    }
    setLoading(false);
  };

  return (
    <div className="no-print" style={{ marginTop: 24, borderTop: `1px solid ${T.borderLight}`, paddingTop: 20 }}>
      <div style={{ fontSize: 13, color: T.navy, fontWeight: 700, letterSpacing: ".05em", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}><MessageCircle size={16} /> CHAT WITH THE EXAMINER</div>
      
      {messages.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16, maxHeight: 300, overflowY: "auto", paddingRight: 8 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ 
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              background: m.role === "user" ? T.navy : T.surface,
              color: m.role === "user" ? "#fff" : T.text,
              border: m.role === "user" ? "none" : `1px solid ${T.border}`,
              padding: "10px 14px", borderRadius: 12, maxWidth: "85%",
              fontSize: 13.5, lineHeight: 1.5, fontFamily: "'EB Garamond', Georgia, serif"
            }}>
              {m.text}
            </div>
          ))}
          {loading && (
            <div style={{ alignSelf: "flex-start", fontSize: 13, color: T.textMuted, fontStyle: "italic" }}>
              Examiner is typing...
            </div>
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          placeholder="Ask the examiner about your feedback or how to improve..."
          style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 14, fontFamily: "inherit" }}
        />
        <button onClick={handleSend} disabled={loading || !input.trim()} style={{ ...btn("primary"), padding: "0 20px" }}>
          Send
        </button>
      </div>
    </div>
  );
}

function SentenceUpgrader({ context }: { context: string }) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    try {
      const { upgradeSentenceToBand9 } = await import("../services/ai");
      const res = await upgradeSentenceToBand9(input, context);
      setResult(res);
    } catch (e) {
      console.error(e);
      alert("Failed to upgrade sentence.");
    }
    setLoading(false);
  };

  return (
    <div className="no-print" style={{ marginTop: 24, borderTop: `1px solid ${T.borderLight}`, paddingTop: 20 }}>
      <div style={{ fontSize: 13, color: T.gold, fontWeight: 700, letterSpacing: ".05em", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}><Sparkles size={16} /> BAND 9 SENTENCE UPGRADER</div>
      <p style={{ fontSize: 12, color: T.textMid, marginBottom: 12 }}>Paste a sentence from your essay that you'd like to improve:</p>
      
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleUpgrade()}
          placeholder="e.g. Many people think that technology is very good for us."
          style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 14, fontFamily: "inherit" }}
        />
        <button onClick={handleUpgrade} disabled={loading || !input.trim()} style={{ ...btn("gold"), padding: "0 20px" }}>
          {loading ? "Upgrading..." : "Upgrade"}
        </button>
      </div>

      {result && (
        <div style={{ background: T.gold + "0a", border: `1px solid ${T.gold}40`, borderRadius: 8, padding: 16 }}>
          <div style={{ fontSize: 11, color: T.gold, fontWeight: 700, marginBottom: 6 }}>UPGRADED VERSION</div>
          <div style={{ fontSize: 15, color: T.navy, fontStyle: "italic", marginBottom: 12, fontFamily: "'EB Garamond', Georgia, serif" }}>"{result.upgradedSentence}"</div>
          <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 700, marginBottom: 4 }}>WHY IT'S BETTER:</div>
          <div style={{ fontSize: 13, color: T.textMid, lineHeight: 1.6 }}>{result.explanation}</div>
        </div>
      )}
    </div>
  );
}

function WritingFeedbackPanel({ fb, task, userText, prompt, onNext }: { fb: any, task: number, userText: string, prompt: string, onNext: () => void }) {
  const [showModel, setShowModel] = useState(false);
  
  const speakWord = (word: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Use a highly reliable, CORS-friendly dictionary audio API (type=1 is British English)
    const audioUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word)}&type=1`;
    const audio = new Audio(audioUrl);
    
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.log("Audio playback failed, trying Web Speech API", error);
        // Fallback to Web Speech API if the audio file fails or is blocked
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(word);
          utterance.lang = 'en-GB';
          utterance.rate = 0.9;
          window.speechSynthesis.speak(utterance);
        }
      });
    }
  };

  const criteria = task === 1
    ? [["Task Achievement", fb.criteria?.taskAchievement, fb.criteriaFeedback?.taskAchievement],
       ["Coherence & Cohesion", fb.criteria?.coherenceCohesion, fb.criteriaFeedback?.coherenceCohesion],
       ["Lexical Resource", fb.criteria?.lexicalResource, fb.criteriaFeedback?.lexicalResource],
       ["Grammatical Range", fb.criteria?.grammaticalRange, fb.criteriaFeedback?.grammaticalRange]]
    : [["Task Response", fb.criteria?.taskResponse, fb.criteriaFeedback?.taskResponse],
       ["Coherence & Cohesion", fb.criteria?.coherenceCohesion, fb.criteriaFeedback?.coherenceCohesion],
       ["Lexical Resource", fb.criteria?.lexicalResource, fb.criteriaFeedback?.lexicalResource],
       ["Grammatical Range", fb.criteria?.grammaticalRange, fb.criteriaFeedback?.grammaticalRange]];

  return (
    <div style={{ ...card(), borderTop: `4px solid ${bandColor(fb.overallBand)}`, marginTop: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, paddingBottom: 20, borderBottom: `1px solid ${T.borderLight}` }}>
        <div>
          <div style={{ fontSize: 11, color: T.textMuted, letterSpacing: ".12em", marginBottom: 8, fontWeight: 700 }}>OFFICIAL EXAMINER REPORT</div>
          <BandBadge band={fb.overallBand} size="lg" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, textAlign: "center" }}>
          {criteria.map(([l, v]) => v && (
            <div key={l as string} style={{ background: T.bgDeep, borderRadius: 8, padding: "8px 12px", border: `1px solid ${T.borderLight}` }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: bandColor(v as number), fontFamily: "monospace" }}>{v as number}</div>
              <div style={{ fontSize: 9, color: T.textMuted, marginTop: 2, fontWeight: 600 }}>{(l as string).split(" ")[0].toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        {criteria.map(([l, v]) => v && <CriterionBar key={l as string} label={l as string} score={v as number} />)}
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: T.navy, fontWeight: 700, letterSpacing: ".05em", marginBottom: 10, borderBottom: `1px solid ${T.borderLight}`, paddingBottom: 4 }}>EXAMINER JUSTIFICATION</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {criteria.map(([l, v, note]) => note && (
            <div key={l as string} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 10, color: T.navyMid, marginBottom: 5, fontWeight: 700 }}>{(l as string).toUpperCase()}</div>
              <div style={{ fontSize: 12, color: T.textMid, lineHeight: 1.7, fontStyle: "italic" }}>"{note as string}"</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
        <div style={{ background: T.green + "08", border: `1px solid ${T.green}30`, borderRadius: 8, padding: 14 }}>
          <div style={{ fontSize: 11, color: T.green, fontWeight: 700, marginBottom: 10 }}>✓ What's Working</div>
          {fb.whatWorks?.map((s: string, i: number) => <div key={i} style={{ fontSize: 12, color: T.green + "cc", marginBottom: 5 }}>• {s}</div>)}
        </div>
        <div style={{ background: T.burgundy + "08", border: `1px solid ${T.burgundy}30`, borderRadius: 8, padding: 14 }}>
          <div style={{ fontSize: 11, color: T.burgundy, fontWeight: 700, marginBottom: 10 }}>⚠ To Improve</div>
          {fb.improvements?.map((s: string, i: number) => <div key={i} style={{ fontSize: 12, color: T.burgundy + "cc", marginBottom: 5 }}>• {s}</div>)}
        </div>
      </div>

      {fb.bandGap && (
        <div style={{ background: T.gold + "12", border: `1px solid ${T.gold}40`, borderRadius: 8, padding: 14, marginBottom: 16 }}>
          <span style={{ fontSize: 11, color: T.gold, fontWeight: 700, marginRight: 8 }}>▶ KEY TO HIGHER BAND:</span>
          <span style={{ fontSize: 13, color: T.textMid }}>{fb.bandGap}</span>
        </div>
      )}

      {fb.modelOpener && !fb.modelEssay && (
        <div style={{ background: T.navy + "06", border: `1px solid ${T.navy}20`, borderRadius: 8, padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: T.navyLight, fontWeight: 700, marginBottom: 6 }}>BAND 8+ MODEL OPENER FOR THIS PROMPT</div>
          <div style={{ fontSize: 14, color: T.text, fontStyle: "italic", lineHeight: 1.8, fontFamily: "'EB Garamond', Georgia, serif" }}>"{fb.modelOpener}"</div>
        </div>
      )}

      {fb.rewrittenParagraph && !fb.modelEssay && (
        <div style={{ background: T.navy + "06", border: `1px solid ${T.navy}20`, borderRadius: 8, padding: 14, marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: T.navyLight, fontWeight: 700, marginBottom: 6 }}>REWRITTEN PARAGRAPH (BAND 8)</div>
          <div style={{ fontSize: 13.5, color: T.text, lineHeight: 1.9, fontFamily: "'EB Garamond', Georgia, serif" }}>{fb.rewrittenParagraph}</div>
        </div>
      )}

      {fb.modelEssay && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", gap: 10 }} className="no-print">
            <button onClick={() => setShowModel(!showModel)} style={{ ...btn("ghost"), flex: 1, border: `1px solid ${T.gold}50`, color: T.gold, background: T.gold + "0a" }}>
              {showModel ? "Hide Comparison" : "⚖️ Compare with Band 9 Model"}
            </button>
            <button onClick={() => { setShowModel(true); setTimeout(() => window.print(), 100); }} style={{ ...btn("ghost"), padding: "8px 16px" }}>
              🖨️ Print Report
            </button>
          </div>
          {showModel && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, marginTop: 16 }}>
              <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: 20 }}>
                <div style={{ fontSize: 11, color: T.navy, fontWeight: 700, letterSpacing: ".1em", marginBottom: 12 }}>YOUR RESPONSE</div>
                <div style={{ fontSize: 14.5, color: T.text, lineHeight: 2, fontFamily: "'EB Garamond', Georgia, serif", whiteSpace: "pre-wrap" }}>
                  {userText}
                </div>
              </div>
              <div style={{ background: T.gold + "05", border: `1px solid ${T.gold}50`, borderRadius: 8, padding: 20 }}>
                <div style={{ fontSize: 11, color: T.gold, fontWeight: 700, letterSpacing: ".1em", marginBottom: 12 }}>BAND 9 MODEL ESSAY</div>
                <div style={{ fontSize: 14.5, color: T.text, lineHeight: 2, fontFamily: "'EB Garamond', Georgia, serif", whiteSpace: "pre-wrap" }}>
                  {fb.modelEssay}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {fb.targetVocabulary?.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 700, marginBottom: 8 }}>VOCABULARY TO INCORPORATE</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {fb.targetVocabulary.map((w: string) => (
              <span key={w} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: T.navy + "0c", border: `1px solid ${T.navy}25`, borderRadius: 6, padding: "4px 12px", fontSize: 12, color: T.navyMid, fontStyle: "italic" }}>
                {w}
                <button onClick={(e) => speakWord(w, e)} style={{ background: "none", border: "none", cursor: "pointer", color: T.navyLight, padding: 0, display: "flex", alignItems: "center" }}>
                  <Volume2 size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <SentenceUpgrader context={prompt} />
      <ExaminerChat task={task} prompt={prompt} userText={userText} feedback={fb} />

      <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
        <button onClick={onNext} style={btn("primary")} className="no-print">Next Prompt →</button>
      </div>
    </div>
  );
}

export function WritingTask1({ logEntry }: { logEntry: any }) {
  const [promptData, setPromptData] = useState<any>(WRITING_T1_PROMPTS[0]);
  const [builtInIdx, setBuiltInIdx] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const [text, setText] = useState("");
  const [started, setStarted] = useState(false);
  const [expired, setExpired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fb, setFb] = useState<any>(null);
  const prompt = promptData;
  const wc = text.trim() === "" ? 0 : text.trim().split(/\s+/).filter(Boolean).length;

  const generateNew = async () => {
    setGenerating(true);
    const data = await generateWritingT1();
    if (data) { setPromptData(data); setUseAI(true); }
    setText(""); setFb(null); setStarted(false); setExpired(false);
    setGenerating(false);
  };

  const nextBuiltIn = () => {
    setBuiltInIdx(i => i + 1);
    setPromptData(WRITING_T1_PROMPTS[(builtInIdx + 1) % WRITING_T1_PROMPTS.length]);
    setText(""); setFb(null); setStarted(false); setExpired(false); setUseAI(false);
  };

  const analyze = async () => {
    if (wc < 100) return;
    setLoading(true); setFb(null);
    const res = await getWritingFeedback(1, `${prompt.title} (${prompt.type})`, text, wc);
    setFb(res);
    setLoading(false);
    if (res && logEntry) logEntry({
      skill: "Writing Task 1", section: prompt.title, prompt: `${prompt.title} (${prompt.type})`,
      yourResponse: text, wordCount: wc, band: res.overallBand, criteria: res.criteria,
      criteriaFeedback: res.criteriaFeedback, whatWorks: res.whatWorks, improvements: res.improvements,
      bandGap: res.bandGap, modelOpener: res.modelOpener, rewrittenParagraph: res.rewrittenParagraph,
      targetVocabulary: res.targetVocabulary, type: "writing",
    });
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 6, alignItems: "center" }}>
        <SectionLabel text="Academic Writing" color={T.navyLight} />
        <SectionLabel text="Task 1 · 20 minutes · 150 words min." />
        {useAI && <SectionLabel text="AI Generated" color={T.green} />}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: T.navy }}>Describe the Visual Information</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={nextBuiltIn} style={{ ...btn("ghost"), fontSize: 11 }}>Built-in →</button>
          <button onClick={generateNew} disabled={generating} style={{ ...btn("gold", generating), fontSize: 11, display: "flex", alignItems: "center", gap: 6 }}>
            {generating ? <><RefreshCw size={12} style={{ animation: "spin 1.5s linear infinite" }} /> Generating…</> : <><Sparkles size={12} /> New AI Prompt</>}
          </button>
        </div>
      </div>

      {generating && (
        <div style={{ ...card(), textAlign: "center", padding: 48 }}>
          <RefreshCw size={36} color={T.gold} style={{ animation: "spin 1.5s linear infinite" }} />
          <p style={{ color: T.textMuted, margin: "14px 0 0", fontSize: 13 }}>Generating a unique Task 1 chart prompt…</p>
        </div>
      )}

      {!generating && <div style={{ ...card(), marginBottom: 16, borderLeft: `3px solid ${T.gold}` }}>
        <div style={{ fontSize: 10, color: T.gold, letterSpacing: ".1em", fontWeight: 700, marginBottom: 10 }}>TASK PROMPT</div>
        <p style={{ fontSize: 14, color: T.text, lineHeight: 1.8, margin: "0 0 14px" }}>{prompt.title}</p>
        <p style={{ fontSize: 12, color: T.textMid, margin: "0 0 10px", fontStyle: "italic" }}>Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>
        <div style={{ background: T.bgDeep, borderRadius: 8, padding: 14 }}>
          <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 8, fontWeight: 700 }}>DATA REFERENCE ({(prompt.type||"").toUpperCase()})</div>
          <ChartRenderer prompt={prompt} />
        </div>
      </div>}

      {!started
        ? <button onClick={() => setStarted(true)} style={btn("primary")}>▶ Start Writing (20 min)</button>
        : <>
          {!expired && <div style={{ marginBottom: 12 }}><TimerBar seconds={prompt.timeLimit} onEnd={() => setExpired(true)} /></div>}
          {expired && <div style={{ fontSize: 12, color: T.burgundy, marginBottom: 10, fontWeight: 600 }}>⏰ Time expired — submit your response</div>}
          <textarea value={text} onChange={e => setText(e.target.value)}
            placeholder="Begin with an overview of the main features, then describe the key data in detail..."
            style={{
              width: "100%", minHeight: 220, background: T.surface, border: `1.5px solid ${T.border}`,
              borderRadius: 10, color: T.text, padding: 18, fontSize: 14, lineHeight: 2,
              resize: "vertical", outline: "none", fontFamily: "'EB Garamond', Georgia, serif", boxSizing: "border-box",
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, marginBottom: 16 }}>
            <WordCount text={text} target={150} />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={nextBuiltIn} style={btn("ghost")}>Skip →</button>
              <button onClick={analyze} disabled={loading || wc < 100} style={btn("primary", loading || wc < 100)}>
                {loading ? "Marking…" : "Get Band Score"}
              </button>
            </div>
          </div>
        </>
      }

      {loading && (
        <div style={{ textAlign: "center", padding: 40 }}>
          <RefreshCw size={32} color={T.gold} style={{ animation: "spin 1.5s linear infinite" }} />
          <p style={{ color: T.textMuted, margin: "12px 0 0", fontSize: 13 }}>Official IELTS Examiner analysing your response…</p>
        </div>
      )}

      {fb && <WritingFeedbackPanel fb={fb} task={1} userText={text} prompt={`${prompt.title}\n\n${prompt.data}`} onNext={nextBuiltIn} />}
    </div>
  );
}

export function WritingTask2({ logEntry }: { logEntry: any }) {
  const [promptData, setPromptData] = useState<any>(WRITING_T2_PROMPTS[0]);
  const [builtInIdx, setBuiltInIdx] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const [text, setText] = useState("");
  const [started, setStarted] = useState(false);
  const [expired, setExpired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fb, setFb] = useState<any>(null);
  const [mode, setMode] = useState<"practice" | "exam">("practice");
  const [hints, setHints] = useState<any>(null);
  const [loadingHints, setLoadingHints] = useState(false);
  const prompt = promptData;
  const wc = text.trim() === "" ? 0 : text.trim().split(/\s+/).filter(Boolean).length;

  const fetchHints = async () => {
    setLoadingHints(true);
    const res = await getWritingHints(prompt.prompt, prompt.type || "Essay");
    setHints(res);
    setLoadingHints(false);
  };

  const generateNew = async () => {
    setGenerating(true);
    const data = await generateWritingT2();
    if (data) { setPromptData(data); setUseAI(true); }
    setText(""); setFb(null); setStarted(false); setExpired(false); setHints(null);
    setGenerating(false);
  };

  const nextBuiltIn = () => {
    setBuiltInIdx(i => i + 1);
    setPromptData(WRITING_T2_PROMPTS[(builtInIdx + 1) % WRITING_T2_PROMPTS.length]);
    setText(""); setFb(null); setStarted(false); setExpired(false); setUseAI(false); setHints(null);
  };

  const analyze = async () => {
    if (wc < 150) return;
    setLoading(true); setFb(null);
    const res = await getWritingFeedback(2, prompt.prompt, text, wc);
    setFb(res);
    setLoading(false);
    if (res && logEntry) logEntry({
      skill: "Writing Task 2", section: prompt.type, prompt: prompt.prompt,
      yourResponse: text, wordCount: wc, band: res.overallBand, criteria: res.criteria,
      criteriaFeedback: res.criteriaFeedback, whatWorks: res.whatWorks, improvements: res.improvements,
      bandGap: res.bandGap, modelOpener: res.modelOpener, rewrittenParagraph: res.rewrittenParagraph,
      targetVocabulary: res.targetVocabulary, type: "writing",
    });
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 6, alignItems: "center" }}>
        <SectionLabel text="Academic Writing" color={T.navyLight} />
        <SectionLabel text={`Task 2 · 40 minutes · 250 words min. · ${prompt.type || ""}`} />
        {useAI && <SectionLabel text="AI Generated" color={T.green} />}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: T.navy }}>Essay Writing</h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ display: "flex", background: T.surface, borderRadius: 8, border: `1px solid ${T.border}`, overflow: "hidden", marginRight: 10 }}>
            <button onClick={() => setMode("practice")} style={{ padding: "6px 12px", fontSize: 11, fontWeight: 600, background: mode === "practice" ? T.navy : "transparent", color: mode === "practice" ? "white" : T.textMid, border: "none", cursor: "pointer", transition: "all .2s", display: "flex", alignItems: "center", gap: 6 }}><GraduationCap size={14} /> Practice</button>
            <button onClick={() => setMode("exam")} style={{ padding: "6px 12px", fontSize: 11, fontWeight: 600, background: mode === "exam" ? T.navy : "transparent", color: mode === "exam" ? "white" : T.textMid, border: "none", cursor: "pointer", transition: "all .2s", display: "flex", alignItems: "center", gap: 6 }}><Timer size={14} /> Exam</button>
          </div>
          <button onClick={nextBuiltIn} style={{ ...btn("ghost"), fontSize: 11 }}>Built-in →</button>
          <button onClick={generateNew} disabled={generating} style={{ ...btn("gold", generating), fontSize: 11, display: "flex", alignItems: "center", gap: 6 }}>
            {generating ? <><RefreshCw size={12} style={{ animation: "spin 1.5s linear infinite" }} /> Generating…</> : <><Sparkles size={12} /> New AI Essay</>}
          </button>
        </div>
      </div>

      {generating && (
        <div style={{ ...card(), textAlign: "center", padding: 48 }}>
          <RefreshCw size={36} color={T.gold} style={{ animation: "spin 1.5s linear infinite" }} />
          <p style={{ color: T.textMuted, margin: "14px 0 0", fontSize: 13 }}>Generating a unique Task 2 essay prompt…</p>
        </div>
      )}

      {!generating && <>
      <div style={{ ...card(), marginBottom: 16, borderLeft: `3px solid ${T.burgundy}` }}>
        <div style={{ fontSize: 10, color: T.burgundy, letterSpacing: ".1em", fontWeight: 700, marginBottom: 10 }}>TASK PROMPT</div>
        <p style={{ fontSize: 15, color: T.text, lineHeight: 1.9, margin: "0 0 10px", fontFamily: "'EB Garamond', Georgia, serif" }}>{prompt.prompt}</p>
        <p style={{ fontSize: 12, color: T.textMid, margin: 0, fontStyle: "italic" }}>Write at least 250 words. You should give reasons for your answer and include relevant examples from your own knowledge or experience.</p>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        {(prompt.tips || []).map((t: string, i: number) => (
          <div key={i} style={{ background: T.navy + "08", border: `1px solid ${T.navy}20`, borderRadius: 6, padding: "5px 10px", fontSize: 11, color: T.navyMid, display: "flex", alignItems: "center", gap: 6 }}>
            <Lightbulb size={14} style={{ color: T.gold }} /> <span>{t}</span>
          </div>
        ))}
      </div>

      {mode === "practice" && !hints && !loadingHints && (
        <button onClick={fetchHints} style={{ ...btn("ghost"), width: "100%", marginBottom: 16, border: `1px dashed ${T.navy}40`, color: T.navy, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Lightbulb size={16} /> Get AI Brainstorming & Hints
        </button>
      )}

      {mode === "practice" && loadingHints && (
        <div style={{ textAlign: "center", padding: 20, marginBottom: 16, background: T.surface, borderRadius: 8, border: `1px solid ${T.borderLight}` }}>
          <RefreshCw size={20} color={T.navy} style={{ animation: "spin 1.5s linear infinite", marginBottom: 8 }} />
          <div style={{ fontSize: 12, color: T.textMid }}>AI is brainstorming ideas...</div>
        </div>
      )}

      {mode === "practice" && hints && (
        <div style={{ ...card(), marginBottom: 16, background: T.navy + "04", border: `1px solid ${T.navy}20` }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <div style={{ fontSize: 11, color: T.navy, fontWeight: 700, marginBottom: 10 }}>🧠 BRAINSTORMING IDEAS</div>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: T.text, lineHeight: 1.7 }}>
                {hints.brainstorming?.map((idea: string, i: number) => <li key={i}>{idea}</li>)}
              </ul>
            </div>
            <div>
              <div style={{ fontSize: 11, color: T.navy, fontWeight: 700, marginBottom: 10 }}>📚 TARGET VOCABULARY</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {hints.vocabulary?.map((v: any, i: number) => (
                  <div key={i} style={{ fontSize: 12, color: T.text }}>
                    <strong style={{ color: T.navy }}>{v.word}:</strong> {v.meaning}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${T.navy}20` }}>
            <div style={{ fontSize: 11, color: T.navy, fontWeight: 700, marginBottom: 10 }}>📝 SUGGESTED STRUCTURE</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {hints.structure?.map((s: any, i: number) => (
                <div key={i} style={{ background: "white", padding: 10, borderRadius: 6, border: `1px solid ${T.borderLight}` }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.navyMid, marginBottom: 4 }}>{s.paragraph.toUpperCase()}</div>
                  <div style={{ fontSize: 12, color: T.textMid }}>{s.tip}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!started && mode === "exam"
        ? <button onClick={() => setStarted(true)} style={btn("primary")}>▶ Start Writing (40 min)</button>
        : <>
          {mode === "exam" && !expired && <div style={{ marginBottom: 12 }}><TimerBar seconds={prompt.timeLimit} onEnd={() => setExpired(true)} /></div>}
          {mode === "exam" && expired && <div style={{ fontSize: 12, color: T.burgundy, marginBottom: 10, fontWeight: 600 }}>⏰ Time expired — submit now</div>}
          <textarea value={text} onChange={e => setText(e.target.value)}
            placeholder={mode === "practice" ? "Practice Mode: Write your essay here. Take your time and use the hints above..." : "Introduction: Paraphrase the question and state your position clearly..."}
            style={{
              width: "100%", minHeight: 320, background: T.surface, border: `1.5px solid ${T.border}`,
              borderRadius: 10, color: T.text, padding: 20, fontSize: 14.5, lineHeight: 2.1,
              resize: "vertical", outline: "none", fontFamily: "'EB Garamond', Georgia, serif", boxSizing: "border-box",
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, marginBottom: 16 }}>
            <WordCount text={text} target={250} />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={nextBuiltIn} style={btn("ghost")}>Skip →</button>
              <button onClick={analyze} disabled={loading || wc < 150} style={btn("primary", loading || wc < 150)}>
                {loading ? "Marking…" : "Get Band Score"}
              </button>
            </div>
          </div>
        </>
      }

      {loading && (
        <div style={{ textAlign: "center", padding: 40 }}>
          <RefreshCw size={32} color={T.gold} style={{ animation: "spin 1.5s linear infinite" }} />
          <p style={{ color: T.textMuted, fontSize: 13, margin: "12px 0 0" }}>Applying official IELTS band descriptors…</p>
        </div>
      )}

      {fb && <WritingFeedbackPanel fb={fb} task={2} userText={text} prompt={prompt.prompt} onNext={nextBuiltIn} />}
      </>}
    </div>
  );
}
