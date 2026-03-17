const lightTheme = {
  bg: "#F8FAFC", // slate-50
  bgDeep: "#F1F5F9", // slate-100
  surface: "#FFFFFF",
  border: "#E2E8F0", // slate-200
  borderLight: "#F1F5F9", // slate-100
  navy: "#0F172A", // slate-900
  navyMid: "#1E293B", // slate-800
  navyLight: "#334155", // slate-700
  burgundy: "#E11D48", // rose-600
  burgundyLight: "#F43F5E", // rose-500
  gold: "#2563EB", // blue-600
  goldLight: "#3B82F6", // blue-500
  green: "#059669", // emerald-600
  greenLight: "#10B981", // emerald-500
  text: "#0F172A", // slate-900
  textMid: "#475569", // slate-600
  textLight: "#64748B", // slate-500
  textMuted: "#94A3B8", // slate-400
};

const darkTheme = {
  bg: "#0F172A", // slate-900
  bgDeep: "#020617", // slate-950
  surface: "#1E293B", // slate-800
  border: "#334155", // slate-700
  borderLight: "#1E293B", // slate-800
  navy: "#F8FAFC", // slate-50 (inverted)
  navyMid: "#E2E8F0", // slate-200
  navyLight: "#CBD5E1", // slate-300
  burgundy: "#F43F5E", // rose-500
  burgundyLight: "#FB7185", // rose-400
  gold: "#3B82F6", // blue-500
  goldLight: "#60A5FA", // blue-400
  green: "#10B981", // emerald-500
  greenLight: "#34D399", // emerald-400
  text: "#F8FAFC", // slate-50
  textMid: "#CBD5E1", // slate-300
  textLight: "#94A3B8", // slate-400
  textMuted: "#64748B", // slate-500
};

export const T = { ...lightTheme };

export const toggleTheme = (isDark: boolean) => {
  Object.assign(T, isDark ? darkTheme : lightTheme);
  if (isDark) {
    document.body.style.backgroundColor = T.bg;
    document.body.style.color = T.text;
  } else {
    document.body.style.backgroundColor = T.bg;
    document.body.style.color = T.text;
  }
  window.dispatchEvent(new Event('theme-change'));
};

export const btn = (variant = "primary", disabled = false) => {
  const variants: Record<string, any> = {
    primary: { bg: T.navy, border: T.navy, color: "#fff" },
    success: { bg: T.green, border: T.green, color: "#fff" },
    danger: { bg: T.burgundy, border: T.burgundy, color: "#fff" },
    ghost: { bg: "transparent", border: T.border, color: T.textMid },
    gold: { bg: T.gold, border: T.gold, color: "#fff" },
  };
  const v = variants[variant] || variants.primary;
  return {
    padding: "10px 20px",
    background: disabled ? T.bgDeep : v.bg,
    border: `1.5px solid ${disabled ? T.border : v.border}`,
    borderRadius: 8,
    color: disabled ? T.textMuted : v.color,
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: ".02em",
    transition: "all .15s ease",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  };
};

export const card = (accent?: string) => ({
  background: T.surface,
  border: `1px solid ${accent || T.border}`,
  borderRadius: 16,
  padding: "24px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
});

export const bandColor = (b: number) => {
  if (b >= 8) return T.green;
  if (b >= 7) return T.gold;
  if (b >= 6) return T.navyLight;
  if (b >= 5) return T.burgundy;
  return T.textMuted;
};
