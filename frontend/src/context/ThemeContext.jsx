import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [lightMode, setLightMode] = useState(() => {
    try {
      return localStorage.getItem("scgis-theme") === "light";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    localStorage.setItem("scgis-theme", lightMode ? "light" : "dark");
    document.getElementById("root")?.setAttribute("data-light-mode", lightMode ? "true" : "false");
  }, [lightMode]);

  const toggleTheme = () => setLightMode((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ lightMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

/* ─── Shared theme‑token helpers ───────────────────────────────────── */

export function useAuthTheme() {
  const { lightMode } = useTheme();
  return lightMode
    ? {
        pageBg: "bg-gradient-to-br from-slate-50 via-white to-indigo-50",
        heading: "text-slate-900",
        label: "text-slate-600",
        inputCls: "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:ring-brand-500/20 focus:bg-white",
        iconCls: "text-slate-400",
        errorBg: "border-red-300 bg-red-50 text-red-700",
        errorIcon: "text-red-500",
        btnPrimary: "bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-500 text-white shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40",
        btnSecondary: "border-slate-200 bg-slate-50 text-slate-700 hover:border-brand-400 hover:bg-slate-100",
        dividerLine: "border-slate-200",
        dividerBg: "bg-white text-slate-400",
        footer: "text-slate-400",
        link: "text-brand-600 hover:text-brand-500",
        toggleBg: "bg-slate-200",
        toggleDot: "bg-white",
        pwIcon: "text-slate-400 hover:text-slate-700",
        roleSelected: "border-brand-400 bg-brand-50 text-slate-900 shadow-lg shadow-brand-500/10 ring-2 ring-brand-400/30",
        roleDefault: "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700",
        roleIconSelected: "text-brand-500",
        roleIconDefault: "text-slate-400",
        roleSubtitle: "text-slate-400",
        deptPanel: "border-brand-300 bg-brand-50",
        deptLabel: "text-brand-700",
        deptSelect: "border-brand-300 bg-white text-slate-900 focus:border-brand-500 focus:ring-brand-400/30",
        deptOption: "bg-white text-slate-900",
        showPwBtn: "text-slate-500 hover:text-brand-600",
      }
    : {
        pageBg: "bg-surface-950",
        heading: "text-white",
        label: "text-surface-200/70",
        inputCls: "bg-white/5 border-white/10 text-white placeholder-surface-200/30 focus:border-brand-400 focus:ring-brand-500/20 focus:bg-white/[0.08]",
        iconCls: "text-surface-200/40",
        errorBg: "border-red-500/30 bg-red-500/10 text-red-300",
        errorIcon: "text-red-400",
        btnPrimary: "bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-500 text-white shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40",
        btnSecondary: "border-white/10 bg-white/5 text-surface-100 hover:border-brand-500/30 hover:bg-white/10",
        dividerLine: "border-white/10",
        dividerBg: "bg-surface-950 text-surface-200/40",
        footer: "text-surface-200/40",
        link: "text-brand-400 hover:text-brand-300",
        toggleBg: "bg-white/15",
        toggleDot: "bg-white",
        pwIcon: "text-surface-200/40 hover:text-white",
        roleSelected: "border-brand-400 bg-brand-500/20 text-white shadow-lg shadow-brand-500/15 ring-2 ring-brand-500/30",
        roleDefault: "border-white/10 bg-white/5 text-surface-200/60 hover:border-white/20 hover:bg-white/10 hover:text-white",
        roleIconSelected: "text-brand-300",
        roleIconDefault: "text-surface-200/40",
        roleSubtitle: "text-surface-200/50",
        deptPanel: "border-brand-500/30 bg-brand-500/10",
        deptLabel: "text-brand-200",
        deptSelect: "border-brand-500/40 bg-surface-900 text-white focus:border-brand-300 focus:ring-brand-400/30",
        deptOption: "bg-surface-900 text-white",
        showPwBtn: "text-surface-200/60 hover:text-brand-300",
      };
}

export function useDashboardTheme() {
  const { lightMode } = useTheme();
  return lightMode
    ? {
        /* Shell */
        shellBg: "bg-gradient-to-br from-slate-100 via-gray-50 to-indigo-50/50",
        sidebarBg: "bg-white/95 border-r border-slate-200",
        sidebarBrand: "text-slate-900",
        sidebarSubBrand: "text-brand-600",
        sidebarLabel: "text-slate-400",
        sidebarLink: "text-slate-600 hover:bg-brand-50 hover:text-brand-700",
        sidebarActive: "bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-500/25 ring-1 ring-white/20",
        sidebarFooterBg: "bg-slate-50 border-t border-slate-200",
        sidebarUserName: "text-slate-900",
        sidebarLogout: "text-slate-400 hover:bg-red-50 hover:text-red-500",
        headerBg: "bg-white/80 border-b border-slate-200",
        headerText: "text-slate-500",
        statusDot: "bg-emerald-500",

        /* Content area */
        bannerBg: "bg-gradient-to-r from-indigo-100/80 via-brand-50 to-slate-50 border-slate-200",
        bannerHeading: "text-slate-900",
        bannerSub: "text-slate-600",
        bannerPill: "border-brand-300 bg-brand-50 text-brand-700",

        cardBg: "bg-white border-slate-200 shadow-md",
        cardLabel: "text-slate-500",
        cardIcon: "bg-slate-50 ring-1 ring-slate-200",
        cardMeta: "text-slate-400",

        panelBg: "bg-white border-slate-200 shadow-md",
        panelHeading: "text-slate-900",
        panelSub: "text-slate-500",
        panelBorder: "border-slate-200",

        filterBg: "bg-slate-100 border-slate-200",
        filterActive: "bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/25",
        filterInactive: "text-slate-500 hover:text-slate-800",

        tableBg: "bg-white",
        tableHeaderBg: "bg-slate-50",
        tableHeaderText: "text-slate-600",
        tableRowHover: "hover:bg-brand-50/50",
        tableText: "text-slate-800",
        tableBorder: "border-slate-100",

        listItemBg: "bg-slate-50/50 border-slate-100 hover:border-brand-300 hover:bg-brand-50/30 hover:shadow-md",
        listTitle: "text-slate-900 group-hover:text-brand-600",
        listMeta: "text-slate-500",
        listArrow: "bg-slate-100 text-slate-400 group-hover:bg-brand-100 group-hover:text-brand-600",

        emptyIcon: "bg-slate-50 border-slate-200",
        emptyText: "text-slate-800",
        emptySub: "text-slate-400",

        textPrimary: "text-slate-900",
        textSecondary: "text-slate-600",
        textMuted: "text-slate-400",

        btnPrimary: "bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-500/25",
        btnSecondary: "border-slate-200 bg-white text-slate-700 hover:border-brand-400 hover:bg-slate-50",

        inputBg: "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:ring-brand-500/20 focus:bg-white",
        selectBg: "bg-slate-50 border-slate-200 text-slate-900 focus:border-brand-500 focus:ring-brand-500/20",
        selectOption: "bg-white text-slate-900",

        chartTooltip: { backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", color: "#0f172a", fontSize: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.08)" },
        chartGrid: "rgba(0,0,0,0.06)",
        chartAxis: "#64748b",
      }
    : {
        /* Shell */
        shellBg: "",
        sidebarBg: "bg-[#060a18]/90 border-r border-white/10",
        sidebarBrand: "text-white",
        sidebarSubBrand: "text-brand-300/80",
        sidebarLabel: "text-surface-200/40",
        sidebarLink: "text-surface-200/70 hover:bg-white/[0.07] hover:text-white",
        sidebarActive: "bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-500/25 ring-1 ring-white/20",
        sidebarFooterBg: "bg-black/20 border-t border-white/10",
        sidebarUserName: "text-white",
        sidebarLogout: "text-surface-200/40 hover:bg-red-500/15 hover:text-red-400",
        headerBg: "bg-[#060a18]/70 border-b border-white/10",
        headerText: "text-surface-200/60",
        statusDot: "bg-emerald-400",

        /* Content */
        bannerBg: "bg-gradient-to-r from-indigo-900/80 via-brand-900/50 to-slate-900/80 border-white/15",
        bannerHeading: "text-white",
        bannerSub: "text-indigo-200/80",
        bannerPill: "border-brand-400/30 bg-brand-500/10 text-brand-300",

        cardBg: "bg-indigo-500/10 border-indigo-500/20",
        cardLabel: "text-surface-200/70",
        cardIcon: "bg-white/5 ring-1 ring-white/10",
        cardMeta: "text-surface-200/50",

        panelBg: "bg-[#080d20]/80 border-white/10 shadow-2xl",
        panelHeading: "text-white",
        panelSub: "text-surface-200/60",
        panelBorder: "border-white/10",

        filterBg: "bg-black/40 border-white/10",
        filterActive: "bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/25",
        filterInactive: "text-surface-200/60 hover:text-white",

        tableBg: "bg-transparent",
        tableHeaderBg: "bg-white/[0.03]",
        tableHeaderText: "text-surface-200/50",
        tableRowHover: "hover:bg-white/[0.02]",
        tableText: "text-white",
        tableBorder: "border-white/5",

        listItemBg: "bg-white/[0.02] border-white/5 hover:border-brand-500/40 hover:bg-brand-500/[0.04] hover:shadow-lg hover:shadow-brand-500/5",
        listTitle: "text-white group-hover:text-brand-300",
        listMeta: "text-surface-200/50",
        listArrow: "bg-white/5 text-surface-200/40 group-hover:bg-brand-500/20 group-hover:text-brand-300",

        emptyIcon: "bg-white/5 border-white/10",
        emptyText: "text-white",
        emptySub: "text-surface-200/50",

        textPrimary: "text-white",
        textSecondary: "text-surface-200/70",
        textMuted: "text-surface-200/40",

        btnPrimary: "bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-500/25",
        btnSecondary: "border-white/15 bg-white/5 text-white hover:bg-white/10",

        inputBg: "bg-white/5 border-white/10 text-white placeholder-surface-200/30 focus:border-brand-400 focus:ring-brand-500/20 focus:bg-white/[0.08]",
        selectBg: "bg-surface-900 border-brand-500/40 text-white focus:border-brand-300 focus:ring-brand-400/30",
        selectOption: "bg-surface-900 text-white",

        chartTooltip: { backgroundColor: "#0b132b", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "14px", color: "#f1f5f9", fontSize: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" },
        chartGrid: "rgba(255,255,255,0.06)",
        chartAxis: "#94a3b8",
      };
}