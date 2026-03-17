import React, { useState, useCallback, useEffect } from "react";
import { T, toggleTheme } from "./theme";
import { Dashboard } from "./components/Dashboard";
import { ListeningSection, ReadingSection } from "./components/ListeningReading";
import { WritingTask1, WritingTask2 } from "./components/Writing";
import { SpeakingSection, VocabSection } from "./components/SpeakingVocab";
import { PrintReport } from "./components/PrintReport";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LoginScreen, OnboardingScreen } from "./components/Auth";
import { FullMockTest } from "./components/FullMockTest";
import { auth, db, logOut } from "./firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, where, getDocs, orderBy, Timestamp } from "firebase/firestore";
import { Home, Headphones, FileText, BarChart2, PenTool, Mic, BookOpen, Timer, ClipboardList } from "lucide-react";

const NAVITEMS = [
  { id: "home", label: "Dashboard", icon: <Home size={18} /> },
  { id: "listening", label: "Listening", icon: <Headphones size={18} /> },
  { id: "reading", label: "Reading", icon: <FileText size={18} /> },
  { id: "writing1", label: "Task 1", icon: <BarChart2 size={18} /> },
  { id: "writing2", label: "Task 2", icon: <PenTool size={18} /> },
  { id: "speaking", label: "Speaking", icon: <Mic size={18} /> },
  { id: "vocab", label: "Vocabulary", icon: <BookOpen size={18} /> },
  { id: "mocktest", label: "Mock Test", icon: <Timer size={18} /> },
  { id: "report", label: "My Report", icon: <ClipboardList size={18} /> },
];

export default function App() {
  const [view, setView] = useState("home");
  const [bandScores, setBandScores] = useState<Record<string, number>>({});
  const [sessionLog, setSessionLog] = useState<any[]>([]);
  
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [, setTick] = useState(0);

  useEffect(() => {
    const handler = () => setTick(t => t + 1);
    window.addEventListener('theme-change', handler);
    return () => window.removeEventListener('theme-change', handler);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            
            // Streak Logic
            const today = new Date().toISOString().split('T')[0];
            let streak = data.streak || 0;
            let lastLoginDate = data.lastLoginDate || "";
            
            if (lastLoginDate !== today) {
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              const yesterdayStr = yesterday.toISOString().split('T')[0];
              
              if (lastLoginDate === yesterdayStr) {
                streak += 1;
              } else {
                streak = 1; // Reset streak if missed a day
              }
              lastLoginDate = today;
              
              // Update in background
              setDoc(doc(db, "users", currentUser.uid), { streak, lastLoginDate }, { merge: true }).catch(console.error);
            }
            
            setUserProfile({ ...data, streak, lastLoginDate });
            
            // Fetch past reports
            const q = query(collection(db, "reports"), where("uid", "==", currentUser.uid), orderBy("createdAt", "asc"));
            const querySnapshot = await getDocs(q);
            const pastLogs = querySnapshot.docs.map(d => {
              const reportData = d.data();
              return {
                ...reportData,
                id: d.id,
                timestamp: reportData.createdAt?.toDate().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) || ""
              };
            });
            setSessionLog(pastLogs);
          } else {
            setUserProfile(null); // Needs onboarding
          }
        } catch (e) {
          console.error("Error fetching user data:", e);
        }
      } else {
        setUserProfile(null);
        setSessionLog([]);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleOnboardingComplete = async (data: any) => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const profile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || "",
      targetBand: data.targetBand,
      testDate: data.testDate || "",
      createdAt: Timestamp.now(),
      streak: 1,
      lastLoginDate: today
    };
    
    // Optimistic update for instant UI response
    setUserProfile(profile);
    
    try {
      await setDoc(doc(db, "users", user.uid), profile);
    } catch (e) {
      console.error("Error saving profile:", e);
      alert("Failed to save profile. Please try again.");
      setUserProfile(null); // Revert on failure
    }
  };

  const logEntry = useCallback(async (entry: any) => {
    if (!user) return;
    const newEntry = {
      ...entry,
      timestamp: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      id: Date.now().toString(),
    };
    setSessionLog(prev => [...prev, newEntry]);

    // Save to Firestore
    try {
      const reportId = `${user.uid}_${Date.now()}`;
      await setDoc(doc(db, "reports", reportId), {
        uid: user.uid,
        type: entry.type,
        score: entry.score,
        feedback: entry.feedback || {},
        userText: entry.userText || "",
        prompt: entry.prompt || "",
        createdAt: Timestamp.now()
      });
    } catch (e) {
      console.error("Error saving report to Firestore:", e);
    }
  }, [user]);

  const clearLog = () => setSessionLog([]);

  if (authLoading) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg, color: T.navy }}>Loading...</div>;
  }

  if (!user) {
    return <LoginScreen />;
  }

  if (!userProfile) {
    return <OnboardingScreen user={user} onComplete={handleOnboardingComplete} />;
  }

  return (
    <ErrorBoundary>
      <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'EB Garamond', Georgia, serif", color: T.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:6px;background:${T.bgDeep}}
        ::-webkit-scrollbar-thumb{background:${T.border};border-radius:3px}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
        textarea:focus,input:focus{border-color:${T.navyLight}!important}
        button:hover:not(:disabled){opacity:.85}

        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
          .print-root {
            border: none !important;
            border-radius: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
          }
          div[style*="position: sticky"] { display: none !important; }
          div[style*="sticky"] { display: none !important; }
          button { display: none !important; }
          @page {
            margin: 20mm 18mm;
            size: A4;
          }
          div { break-inside: avoid; }
          h1, h2 { break-after: avoid; }
        }
      `}</style>

      <div style={{
        background: T.navy, padding: "0 32px",
        display: "flex", justifyContent: "space-between", alignItems: "stretch",
        position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 12px rgba(0,0,0,.15)",
      }} className="no-print">
        <div style={{ display: "flex", alignItems: "center", gap: 20, paddingRight: 32, borderRight: `1px solid ${T.navyLight}30` }}>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: "#fff", fontWeight: 600, cursor: "pointer", lineHeight: 1.1 }} onClick={() => setView("home")}>
              IELTS Academic
            </div>
            <div style={{ fontSize: 9, color: "#ffffff50", letterSpacing: ".12em" }}>BAND {userProfile.targetBand?.toFixed(1) || "7.5"} PREPARATION</div>
          </div>
        </div>

        <nav style={{ display: "flex", alignItems: "stretch" }}>
          {NAVITEMS.map(n => (
            <button key={n.id} onClick={() => setView(n.id)}
              style={{
                background: view === n.id ? "rgba(255,255,255,.12)" : "transparent",
                border: "none", borderBottom: view === n.id ? `2px solid ${T.gold}` : "2px solid transparent",
                padding: "0 18px", color: view === n.id ? "#fff" : "rgba(255,255,255,.55)",
                cursor: "pointer", fontSize: 14, fontWeight: view === n.id ? 600 : 400,
                transition: "all .15s", fontFamily: "inherit", letterSpacing: ".02em",
                position: "relative", display: "flex", alignItems: "center", gap: "8px"
              }}>
              <span style={{ display: "inline-flex", alignItems: "center" }}>{n.icon}</span>{n.label}
              {n.id === "report" && sessionLog.length > 0 && (
                <span style={{
                  position: "absolute", top: 8, right: 6,
                  background: T.burgundy, color: "#fff",
                  borderRadius: "50%", width: 16, height: 16,
                  fontSize: 9, fontWeight: 800, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  fontFamily: "monospace",
                }}>{sessionLog.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 16, paddingLeft: 32, borderLeft: `1px solid ${T.navyLight}30` }}>
          <button onClick={() => toggleTheme(T.bg === "#F8FAFC")} style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", padding: 8, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.7, transition: "opacity 0.2s" }} onMouseEnter={e => e.currentTarget.style.opacity = "1"} onMouseLeave={e => e.currentTarget.style.opacity = "0.7"} title="Toggle Dark Mode">
            {T.bg === "#F8FAFC" ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>}
          </button>
          <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <div style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>{userProfile.displayName?.split(' ')[0] || "Student"}</div>
            <button onClick={logOut} style={{ background: "none", border: "none", color: T.gold, fontSize: 10, cursor: "pointer", padding: 0, textDecoration: "underline" }}>Sign Out</button>
          </div>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: T.gold, color: T.navy, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>
            {userProfile.targetBand?.toFixed(1) || "7.5"}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "36px 32px", animation: "fadeIn .3s ease" }}>
        {view === "home" && <Dashboard setView={setView} bandScores={bandScores} logs={sessionLog} userProfile={userProfile} />}
        {view === "listening" && <ListeningSection logEntry={logEntry} />}
        {view === "reading" && <ReadingSection logEntry={logEntry} />}
        {view === "writing1" && <WritingTask1 logEntry={logEntry} />}
        {view === "writing2" && <WritingTask2 logEntry={logEntry} />}
        {view === "speaking" && <SpeakingSection logEntry={logEntry} />}
        {view === "vocab" && <VocabSection />}
        {view === "mocktest" && <FullMockTest logEntry={logEntry} />}
        {view === "report" && <PrintReport sessionLog={sessionLog} onClear={clearLog} userProfile={userProfile} />}
      </div>
    </div>
    </ErrorBoundary>
  );
}
