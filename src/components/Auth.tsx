import React, { useState } from 'react';
import { signInWithGoogle, logOut } from '../firebase';
import { T, btn, card } from '../theme';

export function LoginScreen() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bgDeep, fontFamily: "'EB Garamond', Georgia, serif" }}>
      <div style={{ ...card(), maxWidth: 400, width: "100%", textAlign: "center", padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 10 }}>🎓</div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: T.navy, marginBottom: 10 }}>IELTS Academic Pro</h1>
        <p style={{ color: T.textMid, marginBottom: 30, fontSize: 16 }}>Sign in to save your practice reports, track your progress, and get personalized AI feedback.</p>
        
        <button 
          onClick={handleLogin} 
          disabled={loading}
          style={{ ...btn("primary"), width: "100%", padding: "12px 20px", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
        >
          {loading ? "Signing in..." : "Sign in with Google"}
        </button>
      </div>
    </div>
  );
}

export function OnboardingScreen({ user, onComplete }: { user: any, onComplete: (data: any) => void }) {
  const [targetBand, setTargetBand] = useState("7.0");
  const [testDate, setTestDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onComplete({ targetBand: parseFloat(targetBand), testDate });
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bgDeep, fontFamily: "'EB Garamond', Georgia, serif" }}>
      <div style={{ ...card(), maxWidth: 450, width: "100%", padding: 40 }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, color: T.navy, marginBottom: 10 }}>Welcome, {user.displayName?.split(' ')[0]}!</h1>
        <p style={{ color: T.textMid, marginBottom: 30, fontSize: 15 }}>Let's set up your profile so the AI examiner can tailor its feedback to your specific goals.</p>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: T.navy, marginBottom: 8 }}>Target Band Score</label>
            <select 
              value={targetBand} 
              onChange={e => setTargetBand(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 16, fontFamily: "inherit" }}
            >
              {[6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0].map(b => (
                <option key={b} value={b}>{b.toFixed(1)}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 30 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: T.navy, marginBottom: 8 }}>Upcoming Test Date (Optional)</label>
            <input 
              type="date" 
              value={testDate}
              onChange={e => setTestDate(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 16, fontFamily: "inherit" }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ ...btn("primary"), width: "100%", padding: "12px 20px", fontSize: 16 }}
          >
            {loading ? "Saving..." : "Start Practicing →"}
          </button>
        </form>
      </div>
    </div>
  );
}
