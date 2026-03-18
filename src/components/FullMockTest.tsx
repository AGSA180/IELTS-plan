import React, { useState, useEffect, useCallback } from "react";
import { T, btn, card } from "../theme";
import { SectionLabel } from "./Shared";
import { ListeningSection, ReadingSection } from "./ListeningReading";
import { WritingTask1, WritingTask2 } from "./Writing";
import { SpeakingSection } from "./SpeakingVocab";
import { Timer, Trophy } from "lucide-react";

const TEST_STAGES = [
  { id: "intro", label: "Introduction", duration: 0 },
  { id: "listening", label: "Listening", duration: 30 * 60 }, // 30 mins
  { id: "reading", label: "Reading", duration: 60 * 60 }, // 60 mins
  { id: "writing", label: "Writing", duration: 60 * 60 }, // 60 mins (Task 1 & 2)
  { id: "speaking", label: "Speaking", duration: 15 * 60 }, // 15 mins
  { id: "complete", label: "Test Complete", duration: 0 },
];

export function FullMockTest({ logEntry }: { logEntry: any }) {
  const [stageIdx, setStageIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  const currentStage = TEST_STAGES[stageIdx];

  const handleNextStage = useCallback(() => {
    setStageIdx(prevIdx => {
      if (prevIdx < TEST_STAGES.length - 1) {
        const nextIdx = prevIdx + 1;
        setTimeLeft(TEST_STAGES[nextIdx].duration);
        if (TEST_STAGES[nextIdx].id === "complete") {
          setIsActive(false);
        }
        return nextIdx;
      }
      return prevIdx;
    });
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(interval);
            handleNextStage();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, handleNextStage]);

  const startTest = () => {
    setStageIdx(1);
    setTimeLeft(TEST_STAGES[1].duration);
    setIsActive(true);
    setTestResults([]);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleLogEntry = (entry: any) => {
    setTestResults(prev => [...prev, entry]);
    logEntry({ ...entry, isMockTest: true });
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, paddingBottom: 16, borderBottom: `1px solid ${T.borderLight}` }}>
        <div>
          <SectionLabel text="Full Mock Test" color={T.burgundy} />
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: T.navy, margin: "8px 0 0" }}>
            {currentStage.label}
          </h1>
        </div>
        {isActive && currentStage.duration > 0 && (
          <div style={{ background: timeLeft < 300 ? T.burgundy + "10" : T.navy + "10", border: `1px solid ${timeLeft < 300 ? T.burgundy : T.navy}30`, borderRadius: 8, padding: "8px 16px", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 700, letterSpacing: ".1em" }}>TIME REMAINING</span>
            <span style={{ fontSize: 24, fontFamily: "monospace", fontWeight: 800, color: timeLeft < 300 ? T.burgundy : T.navy }}>
              {formatTime(timeLeft)}
            </span>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {TEST_STAGES.slice(1, -1).map((s, i) => (
          <div key={s.id} style={{ flex: 1, height: 4, background: stageIdx > i + 1 ? T.green : stageIdx === i + 1 ? T.gold : T.borderLight, borderRadius: 2 }} />
        ))}
      </div>

      {currentStage.id === "intro" && (
        <div style={{ ...card(), textAlign: "center", padding: "48px 24px" }}>
          <div style={{ color: T.navy, marginBottom: 16, display: "flex", justifyContent: "center" }}><Timer size={48} /></div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: T.navy, marginBottom: 16 }}>Full IELTS Mock Test</h2>
          <p style={{ fontSize: 16, color: T.textMid, maxWidth: 600, margin: "0 auto 32px", lineHeight: 1.6 }}>
            Experience the real test conditions. This mock test will guide you through Listening, Reading, Writing, and Speaking with strict time limits.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 32 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: T.navy }}>30m</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>LISTENING</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: T.navy }}>60m</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>READING</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: T.navy }}>60m</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>WRITING</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: T.navy }}>15m</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>SPEAKING</div>
            </div>
          </div>
          <button onClick={startTest} style={{ ...btn("primary"), fontSize: 16, padding: "16px 32px" }}>Start Mock Test</button>
        </div>
      )}

      {currentStage.id === "listening" && (
        <div>
          <ListeningSection logEntry={handleLogEntry} />
          <div style={{ marginTop: 24, textAlign: "right" }}>
            <button onClick={handleNextStage} style={btn("primary")}>Complete Listening & Proceed →</button>
          </div>
        </div>
      )}

      {currentStage.id === "reading" && (
        <div>
          <ReadingSection logEntry={handleLogEntry} />
          <div style={{ marginTop: 24, textAlign: "right" }}>
            <button onClick={handleNextStage} style={btn("primary")}>Complete Reading & Proceed →</button>
          </div>
        </div>
      )}

      {currentStage.id === "writing" && (
        <div>
          <div style={{ marginBottom: 24, padding: 16, background: T.gold + "10", borderRadius: 8, border: `1px solid ${T.gold}30` }}>
            <strong style={{ color: T.gold }}>Writing Section:</strong> You have 60 minutes total. We recommend 20 mins for Task 1 and 40 mins for Task 2.
          </div>
          <WritingTask1 logEntry={handleLogEntry} />
          <div style={{ margin: "40px 0", borderBottom: `2px dashed ${T.borderLight}` }} />
          <WritingTask2 logEntry={handleLogEntry} />
          <div style={{ marginTop: 24, textAlign: "right" }}>
            <button onClick={handleNextStage} style={btn("primary")}>Complete Writing & Proceed →</button>
          </div>
        </div>
      )}

      {currentStage.id === "speaking" && (
        <div>
          <SpeakingSection logEntry={handleLogEntry} />
          <div style={{ marginTop: 24, textAlign: "right" }}>
            <button onClick={handleNextStage} style={btn("primary")}>Finish Mock Test 🎉</button>
          </div>
        </div>
      )}

      {currentStage.id === "complete" && (
        <div style={{ ...card(), textAlign: "center", padding: "48px 24px" }}>
          <div style={{ color: T.gold, marginBottom: 16, display: "flex", justifyContent: "center" }}><Trophy size={48} /></div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: T.navy, marginBottom: 16 }}>Mock Test Completed!</h2>
          <p style={{ fontSize: 16, color: T.textMid, maxWidth: 600, margin: "0 auto 32px", lineHeight: 1.6 }}>
            Congratulations on completing the full IELTS mock test. Your results have been saved to your report.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
            <button onClick={() => setStageIdx(0)} style={btn("ghost")}>Back to Start</button>
          </div>
        </div>
      )}
    </div>
  );
}
