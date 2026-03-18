import React, { useState, useRef, useMemo, useEffect } from "react";
import { T, btn, card, bandColor } from "../theme";

function AudioPlayer({ blob }: { blob: Blob }) {
  const [url, setUrl] = useState<string>("");
  useEffect(() => {
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [blob]);
  return <audio src={url} controls style={{ height: 30 }} />;
}
import { SectionLabel, BandBadge, WordCount, TimerBar } from "./Shared";
import { SPEAKING_PARTS, VOCAB_AWL, SPEAKING_P1_TOPICS, SPEAKING_P3_THEMES } from "../data";
import { generateSpeakingPart1, generateSpeakingPart2, generateSpeakingPart3, getSpeakingFeedback, evaluateSpeakingAudio, generateAcademicVocab } from "../services/ai";
import { playTTS, stopTTS } from "../utils/tts";
import { countWords } from "../utils/wordCount";
import { Volume2, Mic, Square, Play, RefreshCw, CheckCircle, XCircle, BrainCircuit, Activity, Lightbulb } from "lucide-react";

export function SpeakingSection({ logEntry }: { logEntry: any }) {
  const [part, setPart] = useState(1);
  const [qIdx, setQIdx] = useState(0);
  const [cueCardIdx, setCueCardIdx] = useState(0);
  const [phase, setPhase] = useState("prompt");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [fb, setFb] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [prepStarted, setPrepStarted] = useState(false);
  const [speakStarted, setSpeakStarted] = useState(false);
  const wc = useMemo(() => countWords(response), [response]);

  useEffect(() => {
    return () => stopTTS();
  }, []);

  const handlePlayAudio = (text: string) => {
    if (isPlaying) {
      stopTTS();
      setIsPlaying(false);
    } else {
      playTTS(text, 0.9);
      setIsPlaying(true);
      const utterance = new SpeechSynthesisUtterance("");
      utterance.onend = () => setIsPlaying(false);
    }
  };

  const [aiP1, setAiP1] = useState<any>(null);
  const [aiP2, setAiP2] = useState<any>(null);
  const [aiP3, setAiP3] = useState<any>(null);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const p1Topic = aiP1 || SPEAKING_PARTS.part1[qIdx % SPEAKING_PARTS.part1.length];
  const p1Q = p1Topic.questions[0];
  const cue = aiP2 || SPEAKING_PARTS.part2[cueCardIdx % SPEAKING_PARTS.part2.length];
  const p3Topic = aiP3 || SPEAKING_PARTS.part3[qIdx % SPEAKING_PARTS.part3.length];
  const p3Q = p3Topic.questions[qIdx % p3Topic.questions.length];

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setAudioBlob(null);
      setResponse("");
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access is required to record audio.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const generatePart = async (p: number) => {
    setGenerating(true);
    try {
      if (p === 1) {
        const topic = SPEAKING_P1_TOPICS[Math.floor(Math.random() * SPEAKING_P1_TOPICS.length)];
        const res = await generateSpeakingPart1(topic);
        setAiP1(res);
      } else if (p === 2) {
        const res = await generateSpeakingPart2();
        setAiP2(res);
      } else if (p === 3) {
        const theme = SPEAKING_P3_THEMES[Math.floor(Math.random() * SPEAKING_P3_THEMES.length)];
        const res = await generateSpeakingPart3(theme);
        setAiP3(res);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to generate new part. Please try again.");
    }
    setGenerating(false);
  };

  const analyze = async () => {
    if (!audioBlob && (!response.trim() || wc < 20)) return;
    setLoading(true); setFb(null);
    const q = part === 1 ? p1Q : part === 2 ? cue.cue : p3Q;
    
    let res;
    if (audioBlob) {
      try {
        const base64Audio = await blobToBase64(audioBlob);
        res = await evaluateSpeakingAudio(base64Audio, audioBlob.type, q);
      } catch (e) {
        console.error(e);
        alert("Failed to analyze audio. Please try typing your response instead.");
        setLoading(false);
        return;
      }
    } else {
      res = await getSpeakingFeedback(part, q, response);
    }

    setFb(res);
    setLoading(false);
    setPhase("feedback");
    if (res && logEntry) logEntry({
      skill: `Speaking Part ${part}`,
      section: part === 1 ? p1Topic.topic : part === 2 ? "Cue Card" : p3Topic.topic,
      prompt: part === 1 ? p1Q : part === 2 ? cue.cue : p3Q,
      yourResponse: res.transcript || response,
      transcript: res.transcript,
      band: res.band,
      fluencyBand: res.fluencyBand,
      vocabularyBand: res.vocabularyBand,
      grammarBand: res.grammarBand,
      strengths: res.strengths,
      improvements: res.improvements,
      upgradedResponse: res.upgradedResponse,
      bandGap: res.bandGap,
      type: "speaking",
    });
  };

  const next = () => {
    setPhase("prompt"); setResponse(""); setFb(null);
    setPrepStarted(false); setSpeakStarted(false);
    if (part === 1) setQIdx(i => i + 1);
    else if (part === 2) setCueCardIdx(i => i + 1);
  };

  const bandDescriptors = {
    fluency: "Natural rhythm; uses fillers effectively; self-corrects without losing fluency",
    vocabulary: "Paraphrases effectively; uses less common vocabulary; collocations accurate",
    grammar: "Mix of simple/complex structures; error-free sentences predominate",
    pronunciation: "Easy to understand; uses stress and intonation to convey meaning",
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 0, background: T.bgDeep, borderRadius: 10, padding: 4 }}>
          {[1, 2, 3].map(p => (
            <button key={p} onClick={() => { setPart(p); setPhase("prompt"); setResponse(""); setFb(null); setPrepStarted(false); setSpeakStarted(false); }}
              style={{ padding: "8px 22px", borderRadius: 7, border: "none", fontFamily: "inherit", background: part === p ? T.navy : "transparent", color: part === p ? "#fff" : T.textLight, cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all .15s" }}>
              Part {p}
            </button>
          ))}
        </div>
        <button onClick={() => generatePart(part)} disabled={generating} style={{ ...btn("gold", generating), fontSize: 11 }}>
          {generating ? "⟳ Generating…" : `✦ New AI Part ${part}`}
        </button>
      </div>

      {generating && (
        <div style={{ ...card(), textAlign: "center", padding: 36 }}>
          <div style={{ fontSize: 32, animation: "spin 1.5s linear infinite", display: "inline-block", color: T.gold }}>⟳</div>
          <p style={{ color: T.textMuted, margin: "12px 0 0", fontSize: 13 }}>Generating unique Speaking Part {part} content…</p>
        </div>
      )}

      {!generating && <div style={{ ...card(), marginBottom: 16, background: T.bgDeep }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {[
            ["Part 1", "4–5 min · Personal questions · Familiar topics", part === 1],
            ["Part 2", "3–4 min · Cue card · 1 min prep + 2 min talk", part === 2],
            ["Part 3", "4–5 min · Abstract discussion · Linked to Part 2", part === 3],
          ].map(([l, d, active]) => (
            <div key={l as string} style={{ background: active ? T.navy + "0c" : "transparent", border: `1px solid ${active ? T.navy + "30" : "transparent"}`, borderRadius: 8, padding: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: active ? T.navy : T.textMuted, marginBottom: 3 }}>{l as string}</div>
              <div style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.5 }}>{d as string}</div>
            </div>
          ))}
        </div>
      </div>}

      {!generating && <div style={{ ...card(), marginBottom: 20 }}>
        <div style={{ fontSize: 10, color: T.gold, fontWeight: 700, letterSpacing: ".1em", marginBottom: 12 }}>BAND 7.5 CRITERIA</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {Object.entries(bandDescriptors).map(([k, v]) => (
            <div key={k} style={{ display: "flex", gap: 8 }}>
              <span style={{ color: T.gold, fontSize: 14, marginTop: 1 }}>✦</span>
              <div>
                <div style={{ fontSize: 11, color: T.navyMid, fontWeight: 700, textTransform: "capitalize", marginBottom: 2 }}>{k}</div>
                <div style={{ fontSize: 11, color: T.textLight, lineHeight: 1.5 }}>{v}</div>
              </div>
            </div>
          ))}
        </div>
      </div>}

      {!generating && part === 1 && (
        <div>
          <SectionLabel text={`Topic: ${p1Topic.topic}`} color={T.navyLight} />
          <div style={{ marginTop: 12, ...card() }}>
            {p1Topic.questions.map((q: string, i: number) => (
              <div key={i} style={{ padding: "12px 0", borderBottom: i < p1Topic.questions.length - 1 ? `1px solid ${T.borderLight}` : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div style={{ fontSize: 11, color: T.textMuted }}>Question {i + 1}</div>
                  <button onClick={() => handlePlayAudio(q)} style={{ background: "none", border: "none", cursor: "pointer", color: T.navyLight, padding: 4 }}>
                    <Volume2 size={18} />
                  </button>
                </div>
                <p style={{ fontSize: 15, color: T.text, margin: 0, lineHeight: 1.7, fontFamily: "'EB Garamond', serif" }}>{q}</p>
              </div>
            ))}
          </div>
          <div style={{ ...card(), marginTop: 14 }}>
            <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 10, fontWeight: 700 }}>YOUR PRACTICE RESPONSE</div>
            
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              {isRecording ? (
                <button onClick={stopRecording} style={{ ...btn("primary"), background: T.burgundy, borderColor: T.burgundy, flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "white", animation: "pulse 1s infinite" }} />
                  Stop Recording
                </button>
              ) : (
                <button onClick={startRecording} style={{ ...btn("gold"), flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
                  <Mic size={16} /> Record Audio Response
                </button>
              )}
            </div>

            {audioBlob && (
              <div style={{ marginBottom: 16, padding: 12, background: T.green + "10", borderRadius: 8, border: `1px solid ${T.green}30`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: T.green, fontWeight: 600 }}>✓ Audio recorded successfully</span>
                <AudioPlayer blob={audioBlob} />
              </div>
            )}

            <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 8, textAlign: "center" }}>— OR TYPE YOUR RESPONSE —</div>

            <textarea value={response} onChange={e => setResponse(e.target.value)}
              placeholder="Write your spoken response here. Aim for 4–6 sentences per question. Use natural conversational English..."
              rows={6}
              disabled={isRecording || !!audioBlob}
              style={{
                width: "100%", background: T.surface, border: `1.5px solid ${T.border}`,
                borderRadius: 8, color: T.text, padding: 14, fontSize: 14, lineHeight: 1.9,
                resize: "vertical", outline: "none", fontFamily: "'EB Garamond', Georgia, serif", boxSizing: "border-box",
                opacity: (isRecording || audioBlob) ? 0.5 : 1
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
              <button onClick={() => { setQIdx(i => i + 1); setAudioBlob(null); setResponse(""); }} style={btn("ghost")}>Next Topic →</button>
              <button onClick={analyze} disabled={loading || (!audioBlob && wc < 20)} style={btn("primary", loading || (!audioBlob && wc < 20))}>
                {loading ? "Evaluating…" : "Get Band Score"}
              </button>
            </div>
          </div>
        </div>
      )}

      {!generating && part === 2 && (
        <div>
          <div style={{ ...card(), borderLeft: `3px solid ${T.burgundy}`, marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 10, color: T.burgundy, fontWeight: 700, letterSpacing: ".1em" }}>CUE CARD</div>
              <button onClick={() => handlePlayAudio(cue.cue + ". " + cue.bullets.join(". "))} style={{ background: "none", border: "none", cursor: "pointer", color: T.navyLight, padding: 4 }}>
                <Volume2 size={18} />
              </button>
            </div>
            <p style={{ fontSize: 15, color: T.text, margin: "0 0 14px", lineHeight: 1.7, fontFamily: "'EB Garamond', serif" }}>{cue.cue}</p>
            <div style={{ background: T.bgDeep, borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 10, color: T.textMuted, marginBottom: 8 }}>YOU SHOULD SAY:</div>
              {cue.bullets.map((b: string, i: number) => (
                <div key={i} style={{ fontSize: 13, color: T.textMid, marginBottom: 4 }}>• {b}</div>
              ))}
            </div>
          </div>
          <div style={{ fontSize: 13, color: T.textMid, marginBottom: 14, background: T.gold + "10", border: `1px solid ${T.gold}30`, borderRadius: 8, padding: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: prepStarted || speakStarted ? 12 : 0 }}>
              <Lightbulb size={16} color={T.gold} /> <span>In the real test, you get 1 minute to prepare notes. Practise speaking for exactly 2 minutes.</span>
            </div>
            
            {!prepStarted && !speakStarted && (
              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button onClick={() => setPrepStarted(true)} style={{ ...btn("ghost"), flex: 1, borderColor: T.gold, color: T.gold }}>Start 1m Prep</button>
                <button onClick={() => setSpeakStarted(true)} style={{ ...btn("gold"), flex: 1 }}>Start 2m Speaking</button>
              </div>
            )}
            
            {prepStarted && !speakStarted && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.gold, marginBottom: 6, letterSpacing: ".05em" }}>PREPARATION TIME (1 MIN)</div>
                <TimerBar seconds={60} onEnd={() => { setPrepStarted(false); setSpeakStarted(true); }} />
                <button onClick={() => { setPrepStarted(false); setSpeakStarted(true); }} style={{ ...btn("ghost"), width: "100%", marginTop: 10, fontSize: 12, padding: "6px" }}>Skip to Speaking</button>
              </div>
            )}
            
            {speakStarted && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.burgundy, marginBottom: 6, letterSpacing: ".05em" }}>SPEAKING TIME (2 MINS)</div>
                <TimerBar seconds={120} onEnd={() => setSpeakStarted(false)} />
              </div>
            )}
          </div>
          <div style={{ ...card() }}>
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              {isRecording ? (
                <button onClick={stopRecording} style={{ ...btn("primary"), background: T.burgundy, borderColor: T.burgundy, flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "white", animation: "pulse 1s infinite" }} />
                  Stop Recording
                </button>
              ) : (
                <button onClick={startRecording} style={{ ...btn("gold"), flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
                  <Mic size={16} /> Record Audio Response
                </button>
              )}
            </div>

            {audioBlob && (
              <div style={{ marginBottom: 16, padding: 12, background: T.green + "10", borderRadius: 8, border: `1px solid ${T.green}30`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: T.green, fontWeight: 600 }}>✓ Audio recorded successfully</span>
                <AudioPlayer blob={audioBlob} />
              </div>
            )}

            <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 8, textAlign: "center" }}>— OR TYPE YOUR RESPONSE —</div>

            <textarea value={response} onChange={e => setResponse(e.target.value)}
              placeholder="Write your full 2-minute monologue response. Aim for 250–300 words in your written practice..."
              rows={10}
              disabled={isRecording || !!audioBlob}
              style={{
                width: "100%", background: T.surface, border: `1.5px solid ${T.border}`,
                borderRadius: 8, color: T.text, padding: 14, fontSize: 14, lineHeight: 2,
                resize: "vertical", outline: "none", fontFamily: "'EB Garamond', Georgia, serif", boxSizing: "border-box",
                opacity: (isRecording || audioBlob) ? 0.5 : 1
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
              <WordCount text={response} target={200} />
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => { setCueCardIdx(i => i + 1); setAudioBlob(null); setResponse(""); }} style={btn("ghost")}>Next Card →</button>
                <button onClick={analyze} disabled={loading || (!audioBlob && wc < 80)} style={btn("primary", loading || (!audioBlob && wc < 80))}>
                  {loading ? "Evaluating…" : "Get Band Score"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!generating && part === 3 && (
        <div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: T.textMid, marginBottom: 10 }}>
              Topic: <strong style={{ color: T.navy }}>{p3Topic.topic}</strong>
            </div>
            {p3Topic.questions.map((q: string, i: number) => (
              <div key={i} style={{ ...card(), marginBottom: 10, background: i === qIdx % p3Topic.questions.length ? T.navy + "04" : T.bgDeep, border: `1px solid ${i === qIdx % p3Topic.questions.length ? T.navy + "30" : T.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ fontSize: 14, color: T.text, margin: 0, lineHeight: 1.8, fontFamily: "'EB Garamond', serif" }}>
                    <span style={{ color: T.navyLight, fontWeight: 700, marginRight: 8 }}>Q{i + 1}.</span>{q}
                  </p>
                  <button onClick={() => handlePlayAudio(q)} style={{ background: "none", border: "none", cursor: "pointer", color: T.navyLight, padding: 4 }}>
                    <Volume2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ ...card() }}>
            <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 10, fontWeight: 700 }}>RESPOND TO QUESTION {(qIdx % p3Topic.questions.length) + 1}</div>
            
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              {isRecording ? (
                <button onClick={stopRecording} style={{ ...btn("primary"), background: T.burgundy, borderColor: T.burgundy, flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "white", animation: "pulse 1s infinite" }} />
                  Stop Recording
                </button>
              ) : (
                <button onClick={startRecording} style={{ ...btn("gold"), flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
                  <Mic size={16} /> Record Audio Response
                </button>
              )}
            </div>

            {audioBlob && (
              <div style={{ marginBottom: 16, padding: 12, background: T.green + "10", borderRadius: 8, border: `1px solid ${T.green}30`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: T.green, fontWeight: 600 }}>✓ Audio recorded successfully</span>
                <AudioPlayer blob={audioBlob} />
              </div>
            )}

            <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 8, textAlign: "center" }}>— OR TYPE YOUR RESPONSE —</div>

            <textarea value={response} onChange={e => setResponse(e.target.value)}
              placeholder="Give a developed answer — 3–5 sentences with reasons and examples. Part 3 requires abstract discussion..."
              rows={7}
              disabled={isRecording || !!audioBlob}
              style={{
                width: "100%", background: T.surface, border: `1.5px solid ${T.border}`,
                borderRadius: 8, color: T.text, padding: 14, fontSize: 14, lineHeight: 2,
                resize: "vertical", outline: "none", fontFamily: "'EB Garamond', Georgia, serif", boxSizing: "border-box",
                opacity: (isRecording || audioBlob) ? 0.5 : 1
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
              <button onClick={() => { setQIdx(i => i + 1); setAudioBlob(null); setResponse(""); setFb(null); }} style={btn("ghost")}>Next Question →</button>
              <button onClick={analyze} disabled={loading || (!audioBlob && wc < 30)} style={btn("primary", loading || (!audioBlob && wc < 30))}>
                {loading ? "Evaluating…" : "Get Band Score"}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: "center", padding: 36, marginTop: 16 }}>
          <div style={{ fontSize: 28, animation: "spin 1.5s linear infinite", display: "inline-block", color: T.gold }}>⟳</div>
          <p style={{ color: T.textMuted, fontSize: 13, margin: "10px 0 0" }}>Official IELTS Examiner evaluating your response…</p>
        </div>
      )}

      {fb && (
        <div style={{ ...card(), borderTop: `4px solid ${bandColor(fb.band)}`, marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${T.borderLight}` }}>
            <div>
              <div style={{ fontSize: 11, color: T.textMuted, letterSpacing: ".12em", marginBottom: 8, fontWeight: 700 }}>OFFICIAL EXAMINER REPORT</div>
              <BandBadge band={fb.band} size="lg" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[["Fluency", fb.fluencyBand], ["Vocabulary", fb.vocabularyBand], ["Grammar", fb.grammarBand], ["Pronunciation", fb.pronunciationBand || "—"]].map(([l, v]) => (
                <div key={l as string} style={{ background: T.bgDeep, borderRadius: 7, padding: "8px 12px", textAlign: "center", border: `1px solid ${T.borderLight}` }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: typeof v === "number" ? bandColor(v) : T.textMuted, fontFamily: "monospace" }}>{v as number | string}</div>
                  <div style={{ fontSize: 9, color: T.textMuted, marginTop: 2, fontWeight: 600 }}>{(l as string).toUpperCase()}</div>
                </div>
              ))}
            </div>
          </div>

          {fb.transcript && (
            <div style={{ marginBottom: 20, padding: 16, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: T.navy, fontWeight: 700, letterSpacing: ".05em", marginBottom: 8 }}>YOUR TRANSCRIPT</div>
              <div style={{ fontSize: 14, color: T.text, lineHeight: 1.8, fontFamily: "'EB Garamond', Georgia, serif" }}>"{fb.transcript}"</div>
            </div>
          )}

          {fb.criteriaFeedback && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: T.navy, fontWeight: 700, letterSpacing: ".05em", marginBottom: 10, borderBottom: `1px solid ${T.borderLight}`, paddingBottom: 4 }}>EXAMINER JUSTIFICATION</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  ["Fluency & Coherence", fb.criteriaFeedback.fluency],
                  ["Lexical Resource", fb.criteriaFeedback.vocabulary],
                  ["Grammatical Range", fb.criteriaFeedback.grammar]
                ].map(([l, note]) => note && (
                  <div key={l as string} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 10, color: T.navyMid, marginBottom: 5, fontWeight: 700 }}>{(l as string).toUpperCase()}</div>
                    <div style={{ fontSize: 12, color: T.textMid, lineHeight: 1.7, fontStyle: "italic" }}>"{note as string}"</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {fb.pronunciationNote && (
            <div style={{ background: T.gold + "10", border: `1px solid ${T.gold}30`, borderRadius: 7, padding: 12, marginBottom: 14, fontSize: 12, color: T.textMid }}>
              <strong style={{ color: T.gold }}>Pronunciation Note:</strong> {fb.pronunciationNote}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            <div style={{ background: T.green + "08", border: `1px solid ${T.green}25`, borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 11, color: T.green, fontWeight: 700, marginBottom: 8 }}>✓ Strengths</div>
              {fb.strengths?.map((s: string, i: number) => <div key={i} style={{ fontSize: 12, color: T.green + "cc", marginBottom: 4 }}>• {s}</div>)}
            </div>
            <div style={{ background: T.burgundy + "08", border: `1px solid ${T.burgundy}25`, borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 11, color: T.burgundy, fontWeight: 700, marginBottom: 8 }}>⚠ Improve</div>
              {fb.improvements?.map((s: string, i: number) => <div key={i} style={{ fontSize: 12, color: T.burgundy + "cc", marginBottom: 4 }}>• {s}</div>)}
            </div>
          </div>

          {fb.upgradedResponse && (
            <div style={{ background: T.navy + "06", border: `1px solid ${T.navy}20`, borderRadius: 8, padding: 14, marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: T.navyLight, fontWeight: 700, marginBottom: 6 }}>BAND 8 VERSION</div>
              <div style={{ fontSize: 14, color: T.text, fontStyle: "italic", lineHeight: 1.9, fontFamily: "'EB Garamond', serif" }}>"{fb.upgradedResponse}"</div>
            </div>
          )}

          {fb.bandGap && (
            <div style={{ background: T.gold + "12", border: `1px solid ${T.gold}40`, borderRadius: 8, padding: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 11, color: T.gold, fontWeight: 700, marginRight: 8 }}>▶ KEY TO BAND 7.5:</span>
              <span style={{ fontSize: 13, color: T.textMid }}>{fb.bandGap}</span>
            </div>
          )}

          <button onClick={() => { next(); setFb(null); }} style={btn("primary")}>Next Practice →</button>
        </div>
      )}
    </div>
  );
}

export function VocabSection() {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mode, setMode] = useState("cards");
  const [generatingVocab, setGeneratingVocab] = useState(false);
  
  const [vocabList, setVocabList] = useState<any[]>(() => {
    const saved = localStorage.getItem('ielts_vocab_list');
    return saved ? JSON.parse(saved) : VOCAB_AWL;
  });

  // Spaced Repetition State
  // Format: { word: { nextReview: timestamp, interval: days, ease: factor } }
  const [srsData, setSrsData] = useState<Record<string, { nextReview: number, interval: number, ease: number }>>(() => {
    const saved = localStorage.getItem('ielts_srs_data');
    return saved ? JSON.parse(saved) : {};
  });

  const [quizQ, setQuizQ] = useState<any>(null);
  const [quizAns, setQuizAns] = useState<string | null>(null);
  const [filter, setFilter] = useState("due"); // Default to due for review

  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  const now = Date.now();

  const generateNewVocab = async () => {
    setGeneratingVocab(true);
    try {
      const existingWords = vocabList.map(v => v.w);
      const newWords = await generateAcademicVocab(10, existingWords);
      if (newWords && newWords.length > 0) {
        const updatedList = [...vocabList, ...newWords];
        setVocabList(updatedList);
        localStorage.setItem('ielts_vocab_list', JSON.stringify(updatedList));
        setFilter("new");
        setIdx(0);
        setFlipped(false);
      }
    } catch (error) {
      console.error("Failed to generate vocab:", error);
      alert("Failed to generate new vocabulary. Please try again.");
    } finally {
      setGeneratingVocab(false);
    }
  };

  const pool = useMemo(() => {
    if (filter === "all") return vocabList;
    if (filter === "new") return vocabList.filter(v => !srsData[v.w]);
    if (filter === "due") return vocabList.filter(v => srsData[v.w] && srsData[v.w].nextReview <= now);
    if (filter === "learning") return vocabList.filter(v => srsData[v.w] && srsData[v.w].interval < 3);
    return vocabList;
  }, [filter, srsData, now, vocabList]);

  const card_item = pool[idx % Math.max(pool.length, 1)];

  // SuperMemo-2 inspired algorithm
  const handleReview = (quality: number) => {
    if (!card_item) return;
    
    const word = card_item.w;
    const currentData = srsData[word] || { interval: 0, ease: 2.5, nextReview: 0 };
    
    let newInterval;
    let newEase = currentData.ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (newEase < 1.3) newEase = 1.3;

    if (quality < 3) {
      newInterval = 1; // Reset if forgotten
    } else if (currentData.interval === 0) {
      newInterval = 1;
    } else if (currentData.interval === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(currentData.interval * newEase);
    }

    const nextReview = now + newInterval * 24 * 60 * 60 * 1000;

    const newData = {
      ...srsData,
      [word]: { interval: newInterval, ease: newEase, nextReview }
    };

    setSrsData(newData);
    localStorage.setItem('ielts_srs_data', JSON.stringify(newData));
    
    setFlipped(false);
    
    // If we're in 'due' mode and just reviewed, the pool will shrink.
    // We don't need to increment idx if the current item is removed from the pool.
    if (filter !== "due") {
      setTimeout(() => setIdx(i => i + 1), 80);
    }
  };

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

  const startQuiz = () => {
    const c = vocabList[Math.floor(Math.random() * vocabList.length)];
    const wrong = vocabList.filter(x => x.w !== c.w).sort(() => Math.random() - .5).slice(0, 3);
    const opts = [...wrong.map(x => x.d), c.d].sort(() => Math.random() - .5);
    setQuizQ({ card: c, opts, correct: c.d });
    setQuizAns(null);
    setMode("quiz");
  };

  const stats = useMemo(() => {
    let due = 0, newCards = 0, learning = 0, mastered = 0;
    vocabList.forEach(v => {
      const data = srsData[v.w];
      if (!data) newCards++;
      else if (data.nextReview <= now) due++;
      else if (data.interval < 21) learning++;
      else mastered++;
    });
    return { due, newCards, learning, mastered };
  }, [srsData, now]);

  if (!card_item && filter === "due") return (
    <div style={{ textAlign: "center", padding: 40, ...card() }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>🎉</div>
      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: T.navy, margin: "0 0 8px" }}>You're all caught up!</h3>
      <p style={{ color: T.textMuted, marginBottom: 20 }}>No more words due for review right now.</p>
      <button onClick={() => setFilter("new")} style={btn("primary")}>Learn New Words</button>
    </div>
  );

  if (!card_item) return (
    <div style={{ textAlign: "center", padding: 40 }}>
      <p style={{ color: T.textMuted }}>No cards match your filter. Change the filter above.</p>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <SectionLabel text="Spaced Repetition" color={T.navyLight} />
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: T.navy, margin: "6px 0 4px" }}>Academic Word List — Band 7–8</h2>
          <div style={{ display: "flex", gap: 14 }}>
            <span style={{ fontSize: 12, color: T.burgundy, fontWeight: filter === 'due' ? 700 : 400 }}>🔥 Due: {stats.due}</span>
            <span style={{ fontSize: 12, color: T.navy, fontWeight: filter === 'new' ? 700 : 400 }}>✨ New: {stats.newCards}</span>
            <span style={{ fontSize: 12, color: T.gold, fontWeight: filter === 'learning' ? 700 : 400 }}>📈 Learning: {stats.learning}</span>
            <span style={{ fontSize: 12, color: T.green }}>✓ Mastered: {stats.mastered}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <select value={filter} onChange={e => { setFilter(e.target.value); setIdx(0); setFlipped(false); }}
            style={{ padding: "7px 12px", border: `1.5px solid ${T.border}`, borderRadius: 7, fontSize: 12, color: T.textMid, background: T.surface, outline: "none", fontFamily: "inherit" }}>
            <option value="due">Due for Review ({stats.due})</option>
            <option value="new">New Words ({stats.newCards})</option>
            <option value="learning">Learning ({stats.learning})</option>
            <option value="all">All Words ({vocabList.length})</option>
          </select>
          <button onClick={() => setMode("cards")} style={btn(mode === "cards" ? "primary" : "ghost")}>Cards</button>
          <button onClick={startQuiz} style={btn("gold")}>Quiz</button>
          <button onClick={generateNewVocab} disabled={generatingVocab} style={{ ...btn("primary", generatingVocab), display: "flex", alignItems: "center", gap: 6 }}>
            <BrainCircuit size={14} />
            {generatingVocab ? "Generating..." : "AI Vocab"}
          </button>
        </div>
      </div>

      {mode === "cards" && (
        <>
          {pool.length === 0 ? (
            <div style={{
              minHeight: 240, background: T.surface,
              border: `1.5px dashed ${T.border}`, borderRadius: 14,
              padding: 30, marginBottom: 16, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
              textAlign: "center"
            }}>
              <CheckCircle size={48} color={T.green} style={{ marginBottom: 16 }} />
              <h3 style={{ fontSize: 18, color: T.navy, marginBottom: 8 }}>You're all caught up!</h3>
              <p style={{ fontSize: 14, color: T.textMid, maxWidth: 300 }}>
                There are no words in this category right now. Try changing the filter or generating new AI vocabulary.
              </p>
            </div>
          ) : (
            <div style={{
              minHeight: 240, background: flipped ? T.navy + "04" : T.surface,
              border: `1.5px solid ${flipped ? T.navy + "40" : T.border}`, borderRadius: 14,
              padding: 30, marginBottom: 16, display: "flex", flexDirection: "column", justifyContent: "center",
              transition: "all .25s",
            }}>
              {!flipped ? (
                <div style={{ textAlign: "center", cursor: "pointer" }} onClick={() => setFlipped(true)}>
                  <div style={{ fontSize: 11, color: T.textMuted, letterSpacing: ".12em", marginBottom: 14 }}>WORD</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 8 }}>
                    <div style={{ fontSize: 44, fontFamily: "'Cormorant Garamond', serif", color: T.navy }}>{card_item.w}</div>
                    <button onClick={(e) => speakWord(card_item.w, e)} style={{ background: T.navy + "10", border: "none", cursor: "pointer", color: T.navy, padding: 10, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                      <Volume2 size={24} />
                    </button>
                  </div>
                  {card_item.p && (
                    <div style={{ fontSize: 16, color: T.textMid, fontFamily: "monospace", marginBottom: 12 }}>{card_item.p}</div>
                  )}
                  <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 14 }}>
                    {[6.5, 7, 7.5, 8].map(b => (
                      <span key={b} style={{ fontSize: 11, color: card_item.band >= b ? T.gold : T.borderLight }}>★</span>
                    ))}
                    <span style={{ fontSize: 10, color: T.gold, marginLeft: 6 }}>Band {card_item.band}+</span>
                  </div>
                  <div style={{ fontSize: 12, color: T.textMuted }}>click to reveal</div>
                </div>
              ) : (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                    <div style={{ fontSize: 36, fontFamily: "'Cormorant Garamond', serif", color: T.navy }}>{card_item.w}</div>
                    <button onClick={(e) => speakWord(card_item.w, e)} style={{ background: T.navy + "10", border: "none", cursor: "pointer", color: T.navy, padding: 8, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                      <Volume2 size={20} />
                    </button>
                  </div>
                  {card_item.p && (
                    <div style={{ fontSize: 15, color: T.textMid, fontFamily: "monospace", marginBottom: 14 }}>{card_item.p}</div>
                  )}
                  <div style={{ fontSize: 14, color: T.text, marginBottom: 10, lineHeight: 1.7 }}>
                    <span style={{ color: T.textMuted, fontSize: 11 }}>DEFINITION  </span>{card_item.d}
                  </div>
                  <div style={{ borderLeft: `3px solid ${T.gold}`, paddingLeft: 14, marginBottom: 14 }}>
                    <div style={{ fontSize: 13, color: T.textMid, fontStyle: "italic", lineHeight: 1.8 }}>{card_item.e}</div>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <span style={{ fontSize: 10, color: T.textMuted }}>SYNONYMS: </span>
                    {card_item.s.map(s => (
                      <span key={s} style={{ fontSize: 11, color: T.navyMid, background: T.navy + "0c", padding: "2px 8px", borderRadius: 4, marginRight: 6 }}>{s}</span>
                    ))}
                  </div>
                  <div>
                    <span style={{ fontSize: 10, color: T.textMuted }}>COLLOCATIONS: </span>
                    {card_item.collocations?.map(c => (
                      <span key={c} style={{ fontSize: 11, color: T.gold + "cc", background: T.gold + "10", padding: "2px 8px", borderRadius: 4, marginRight: 6, fontStyle: "italic" }}>{c}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {flipped && pool.length > 0 && (
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => handleReview(1)} style={{ flex: 1, ...btn("danger"), padding: "12px 0" }}>
                <div style={{ fontWeight: 700 }}>Again</div>
                <div style={{ fontSize: 10, opacity: 0.8, marginTop: 2 }}>&lt; 1m</div>
              </button>
              <button onClick={() => handleReview(3)} style={{ flex: 1, ...btn("secondary"), padding: "12px 0" }}>
                <div style={{ fontWeight: 700 }}>Hard</div>
                <div style={{ fontSize: 10, opacity: 0.8, marginTop: 2 }}>
                  {srsData[card_item?.w]?.interval ? `${Math.round(srsData[card_item.w].interval * 1.2)}d` : '1d'}
                </div>
              </button>
              <button onClick={() => handleReview(4)} style={{ flex: 1, ...btn("primary"), padding: "12px 0" }}>
                <div style={{ fontWeight: 700 }}>Good</div>
                <div style={{ fontSize: 10, opacity: 0.8, marginTop: 2 }}>
                  {srsData[card_item?.w]?.interval ? `${Math.round(srsData[card_item.w].interval * 2.5)}d` : '3d'}
                </div>
              </button>
              <button onClick={() => handleReview(5)} style={{ flex: 1, ...btn("success"), padding: "12px 0" }}>
                <div style={{ fontWeight: 700 }}>Easy</div>
                <div style={{ fontSize: 10, opacity: 0.8, marginTop: 2 }}>
                  {srsData[card_item?.w]?.interval ? `${Math.round(srsData[card_item.w].interval * 3.5)}d` : '4d'}
                </div>
              </button>
            </div>
          )}
        </>
      )}

      {mode === "quiz" && quizQ && (
        <div style={card()}>
          <div style={{ fontSize: 11, color: T.textMuted, letterSpacing: ".1em", marginBottom: 14 }}>CHOOSE THE CORRECT DEFINITION</div>
          <div style={{ fontSize: 36, fontFamily: "'Cormorant Garamond', serif", color: T.navy, marginBottom: 20 }}>{quizQ.card.w}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {quizQ.opts.map((opt: string, i: number) => {
              const isSel = quizAns === opt;
              const isRight = opt === quizQ.correct;
              let bg = T.bgDeep, border = T.border, col = T.textMid;
              if (quizAns) {
                if (isRight) { bg = T.green + "10"; border = T.green; col = T.green; }
                else if (isSel) { bg = T.burgundy + "10"; border = T.burgundy; col = T.burgundy; }
              } else if (isSel) { bg = T.navy + "08"; border = T.navy; col = T.navy; }
              return (
                <button key={i} onClick={() => { if (!quizAns) setQuizAns(opt); }}
                  style={{ padding: "12px 16px", background: bg, border: `1.5px solid ${border}`, borderRadius: 8, color: col, cursor: quizAns ? "default" : "pointer", textAlign: "left", fontSize: 13, lineHeight: 1.6, transition: "all .15s" }}>
                  {opt}
                </button>
              );
            })}
          </div>
          {quizAns && (
            <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: quizAns === quizQ.correct ? T.green : T.burgundy, fontWeight: 600 }}>
                {quizAns === quizQ.correct ? "✓ Correct!" : `✗ Correct answer above`}
              </span>
              <button onClick={startQuiz} style={btn("primary")}>Next Question →</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
