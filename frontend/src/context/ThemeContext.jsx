import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [lightMode, setLightMode] = useState(() => {
    try {
      const saved = localStorage.getItem("scgis_theme");
      return saved === "light";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("scgis_theme", lightMode ? "light" : "dark");
    } catch {
      // ignore
    }
  }, [lightMode]);

  const toggleTheme = () => setLightMode((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ lightMode, toggleTheme }}>
      <div data-light-mode={lightMode ? "true" : "false"} className="min-h-screen">
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}

export function useAuthTheme() {
  const { lightMode } = useTheme();
  return lightMode
    ? {
        pageBg: "bg-slate-50/90 text-slate-800",
        cardBg: "bg-white/95 border-slate-200/90 shadow-2xl shadow-indigo-950/5 ring-1 ring-slate-200/80 backdrop-blur-xl",
        heading: "text-slate-900 font-display font-extrabold tracking-tight",
        label: "text-slate-700 font-semibold",
        inputCls: "bg-slate-50/80 border-slate-300/80 text-slate-900 placeholder-slate-400 focus:border-brand-600 focus:ring-4 focus:ring-brand-500/15 focus:bg-white shadow-sm",
        iconCls: "text-slate-400",
        errorBg: "border-red-200 bg-red-50/90 text-red-700 shadow-sm",
        errorIcon: "text-red-500",
        btnPrimary: "bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-500 text-white shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:brightness-105 active:scale-[0.99]",
        btnSecondary: "border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 hover:border-slate-400 active:scale-[0.99]",
        dividerLine: "border-slate-200",
        dividerBg: "bg-slate-50 text-slate-400 font-semibold",
        footer: "text-slate-500",
        link: "text-brand-600 hover:text-brand-700 font-semibold",
        toggleBg: "bg-slate-200 border-slate-300 shadow-inner",
        toggleDot: "bg-white shadow-md text-amber-500",
        pwIcon: "text-slate-400 hover:text-slate-700",
        roleSelected: "border-brand-600 bg-gradient-to-br from-brand-50 to-indigo-50/80 text-brand-900 shadow-md shadow-brand-500/15 ring-2 ring-brand-500/30",
        roleDefault: "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 shadow-sm",
        roleIconSelected: "text-brand-600",
        roleIconDefault: "text-slate-400",
        roleSubtitle: "text-slate-500 font-medium",
        deptPanel: "border-brand-200 bg-gradient-to-br from-brand-50/70 via-white to-indigo-50/50 shadow-inner",
        deptLabel: "text-brand-900 font-bold",
        deptSelect: "border-slate-300 bg-white text-slate-900 shadow-sm focus:border-brand-600 focus:ring-4 focus:ring-brand-500/15",
        deptOption: "bg-white text-slate-900",
        showPwBtn: "text-slate-500 hover:text-brand-600 font-medium",
        loginBtn: "border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 hover:border-slate-400 active:scale-[0.99]",
      }
    : {
        pageBg: "bg-[#060a18]/90 text-surface-100",
        cardBg: "bg-[#091026]/90 border-white/10 shadow-2xl shadow-black/60 ring-1 ring-white/10 backdrop-blur-2xl",
        heading: "text-white font-display font-extrabold tracking-tight",
        label: "text-surface-200 font-semibold",
        inputCls: "bg-white/[0.05] border-white/15 text-white placeholder-surface-200/35 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/25 focus:bg-white/[0.08] shadow-inner",
        iconCls: "text-surface-200/40",
        errorBg: "border-red-500/30 bg-red-500/10 text-red-300 shadow-lg shadow-red-950/50",
        errorIcon: "text-red-400",
        btnPrimary: "bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-500 text-white shadow-xl shadow-brand-500/30 hover:shadow-brand-500/50 hover:brightness-110 active:scale-[0.99]",
        btnSecondary: "border-white/15 bg-white/5 text-surface-100 hover:border-brand-500/30 hover:bg-white/10 active:scale-[0.99]",
        dividerLine: "border-white/10",
        dividerBg: "bg-surface-950 text-surface-200/40 font-semibold",
        footer: "text-surface-200/50",
        link: "text-brand-400 hover:text-brand-300 font-semibold",
        toggleBg: "bg-white/15 border-white/10 shadow-inner",
        toggleDot: "bg-surface-900 shadow-md text-amber-300",
        pwIcon: "text-surface-200/40 hover:text-white",
        roleSelected: "border-brand-400 bg-gradient-to-br from-brand-500/25 to-indigo-500/15 text-white shadow-xl shadow-brand-500/20 ring-2 ring-brand-500/40",
        roleDefault: "border-white/10 bg-white/[0.03] text-surface-200/60 hover:border-white/20 hover:bg-white/[0.06] hover:text-white shadow-sm",
        roleIconSelected: "text-brand-300",
        roleIconDefault: "text-surface-200/40",
        roleSubtitle: "text-surface-200/50 font-medium",
        deptPanel: "border-brand-500/30 bg-gradient-to-br from-brand-500/15 to-indigo-500/10 shadow-inner",
        deptLabel: "text-brand-200 font-bold",
        deptSelect: "border-brand-500/40 bg-surface-900/90 text-white shadow-sm focus:border-brand-300 focus:ring-4 focus:ring-brand-400/30",
        deptOption: "bg-surface-900 text-white",
        showPwBtn: "text-surface-200/60 hover:text-brand-300 font-medium",
        loginBtn: "border-white/15 bg-white/5 text-white hover:bg-white/10 hover:border-white/25 active:scale-[0.99]",
      };
}

export function useDashboardTheme() {
  const { lightMode } = useTheme();
  return lightMode
    ? {
        /* Shell */
        shellBg: "bg-gradient-to-br from-slate-100 via-gray-50 to-indigo-50/50",
        sidebarBg: "bg-white/95 border-r border-slate-200/90 shadow-sm",
        sidebarBrand: "text-slate-900 font-display font-black",
        sidebarSubBrand: "text-brand-600 font-bold",
        sidebarLabel: "text-slate-400 font-bold",
        sidebarLink: "text-slate-600 hover:bg-brand-50 hover:text-brand-700",
        sidebarActive: "bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-500/25 ring-1 ring-white/20",
        sidebarFooterBg: "bg-slate-50/80 border-t border-slate-200/80",
        sidebarUserName: "text-slate-900 font-bold",
        sidebarLogout: "text-slate-400 hover:bg-red-50 hover:text-red-500",
        headerBg: "bg-white/85 border-b border-slate-200/90 shadow-sm",
        headerText: "text-slate-600 font-semibold",
        statusDot: "bg-emerald-500 shadow-sm shadow-emerald-500/40",

        /* Content area */
        bannerBg: "bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-slate-800 shadow-2xl shadow-slate-900/10",
        bannerHeading: "text-white font-display font-extrabold",
        bannerSub: "text-indigo-100/90",
        bannerPill: "border-amber-400/40 bg-amber-500/20 text-amber-300 font-bold",

        cardBg: "bg-white border-slate-200 shadow-md hover:shadow-xl hover:border-slate-300 transition-all duration-300",
        cardLabel: "text-slate-600 font-bold",
        cardIcon: "bg-slate-50 text-slate-800 shadow-sm ring-1 ring-slate-200",
        cardMeta: "text-slate-500 font-medium",

        panelBg: "bg-white border-slate-200 shadow-md hover:shadow-lg transition-all duration-300",
        panelHeading: "text-slate-900 font-display font-extrabold",
        panelSub: "text-slate-500 font-medium",
        panelBorder: "border-slate-200",

        filterBg: "bg-slate-100 border-slate-200 shadow-inner",
        filterActive: "bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/25",
        filterInactive: "text-slate-600 hover:text-slate-900 font-medium",

        tableBg: "bg-white",
        tableHeaderBg: "bg-slate-50/90",
        tableHeaderText: "text-slate-600 font-bold",
        tableRowHover: "hover:bg-brand-50/50",
        tableText: "text-slate-800",
        tableBorder: "border-slate-100",

        listItemBg: "bg-slate-50/70 border-slate-200 hover:border-brand-400 hover:bg-brand-50/40 hover:shadow-md",
        listTitle: "text-slate-900 group-hover:text-brand-700 font-bold",
        listMeta: "text-slate-500",
        listArrow: "bg-slate-200 text-slate-600 group-hover:bg-brand-100 group-hover:text-brand-700",

        emptyIcon: "bg-slate-100 border-slate-200",
        emptyText: "text-slate-800 font-bold",
        emptySub: "text-slate-500",

        textPrimary: "text-slate-900",
        textSecondary: "text-slate-600",
        textMuted: "text-slate-500",

        btnPrimary: "bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-500 text-white shadow-lg shadow-brand-500/25 hover:brightness-110 active:scale-[0.99]",
        btnSecondary: "border-white/20 bg-white/10 text-white hover:bg-white/20 hover:border-white/30 active:scale-[0.99]",

        inputBg: "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 focus:bg-white",
        selectBg: "bg-slate-50 border-slate-200 text-slate-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15",
        selectOption: "bg-white text-slate-900",

        chartTooltip: { backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", color: "#0f172a", fontSize: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.08)" },
        chartGrid: "rgba(0,0,0,0.06)",
        chartAxis: "#475569",
      }
    : {
        /* Shell */
        shellBg: "",
        sidebarBg: "bg-[#060a18]/95 border-r border-white/10 shadow-2xl backdrop-blur-2xl",
        sidebarBrand: "text-white font-display font-black",
        sidebarSubBrand: "text-brand-300/90 font-bold",
        sidebarLabel: "text-surface-200/40 font-bold",
        sidebarLink: "text-surface-200/70 hover:bg-white/[0.07] hover:text-white",
        sidebarActive: "bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-500/30 ring-1 ring-white/20",
        sidebarFooterBg: "bg-black/30 border-t border-white/10",
        sidebarUserName: "text-white font-bold",
        sidebarLogout: "text-surface-200/40 hover:bg-red-500/15 hover:text-red-400",
        headerBg: "bg-[#060a18]/80 border-b border-white/10 shadow-lg backdrop-blur-xl",
        headerText: "text-surface-200/70 font-semibold",
        statusDot: "bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-pulse",

        /* Content */
        bannerBg: "bg-gradient-to-r from-amber-950/40 via-indigo-950/70 to-slate-900/90 border-white/15 shadow-2xl shadow-black/50",
        bannerHeading: "text-white font-display font-extrabold",
        bannerSub: "text-indigo-200/90",
        bannerPill: "border-amber-400/30 bg-amber-500/15 text-amber-300 font-bold",

        cardBg: "bg-indigo-950/30 border-indigo-500/25 shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-500/40 transition-all duration-300",
        cardLabel: "text-surface-200/70 font-bold",
        cardIcon: "bg-white/5 ring-1 ring-white/10",
        cardMeta: "text-surface-200/50 font-medium",

        panelBg: "bg-[#080d20]/85 border-white/10 shadow-2xl hover:border-white/15 transition-all duration-300",
        panelHeading: "text-white font-display font-extrabold",
        panelSub: "text-surface-200/60 font-medium",
        panelBorder: "border-white/10",

        filterBg: "bg-black/40 border-white/10 shadow-inner",
        filterActive: "bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/30",
        filterInactive: "text-surface-200/60 hover:text-white font-medium",

        tableBg: "bg-transparent",
        tableHeaderBg: "bg-white/[0.04]",
        tableHeaderText: "text-surface-200/60 font-bold",
        tableRowHover: "hover:bg-white/[0.03]",
        tableText: "text-white",
        tableBorder: "border-white/10",

        listItemBg: "bg-white/[0.02] border-white/10 hover:border-brand-500/40 hover:bg-brand-500/[0.05] hover:shadow-xl hover:shadow-brand-500/5",
        listTitle: "text-white group-hover:text-brand-300 font-bold",
        listMeta: "text-surface-200/50",
        listArrow: "bg-white/5 text-surface-200/40 group-hover:bg-brand-500/20 group-hover:text-brand-300",

        emptyIcon: "bg-white/5 border-white/10",
        emptyText: "text-white font-bold",
        emptySub: "text-surface-200/50",

        textPrimary: "text-white",
        textSecondary: "text-surface-200/70",
        textMuted: "text-surface-200/50",

        btnPrimary: "bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-500 text-white shadow-xl shadow-brand-500/30 hover:brightness-110 active:scale-[0.99]",
        btnSecondary: "border-white/15 bg-white/5 text-white hover:bg-white/10 hover:border-white/30 active:scale-[0.99]",

        inputBg: "bg-white/[0.04] border-white/15 text-white placeholder-surface-200/35 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/25 focus:bg-white/[0.08]",
        selectBg: "bg-surface-900 border-brand-500/40 text-white focus:border-brand-300 focus:ring-4 focus:ring-brand-400/30",
        selectOption: "bg-surface-900 text-white",

        chartTooltip: { backgroundColor: "#0b132b", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "14px", color: "#f1f5f9", fontSize: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" },
        chartGrid: "rgba(255,255,255,0.06)",
        chartAxis: "#94a3b8",
      };
}
