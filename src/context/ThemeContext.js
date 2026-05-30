import { createContext, useContext, useMemo, useState } from "react";

const PALETTES = {
  light: {
    mode: "light",
    name: "Light",
    colors: {
      primary: "#1c1c1e",
      accent: "#FDCB6E",
      bg: "#f8f7f4",
      surface: "#ffffff",
      surfaceAlt: "#f1efea",
      text: "#2D3436",
      textMuted: "#636E72",
      border: "#e8e6e1",
      danger: "#E53935",
      success: "#2E7D32",
      warning: "#fb923c",
      info: "#60a5fa",
      tabInactive: "#999999",
      profileCard: "#1c1c1e",
      profileText: "#f8f7f4",
      profileMuted: "#a09e9a",
    },
  },
  dark: {
    mode: "dark",
    name: "Dark",
    colors: {
      primary: "#f8f7f4",
      accent: "#FDCB6E",
      bg: "#0f0f10",
      surface: "#1a1a1c",
      surfaceAlt: "#222226",
      text: "#f2f0eb",
      textMuted: "#a09e9a",
      border: "#2a2a2e",
      danger: "#ff6b6b",
      success: "#4ade80",
      warning: "#fb923c",
      info: "#60a5fa",
      tabInactive: "#777777",
      profileCard: "#222226",
      profileText: "#f8f7f4",
      profileMuted: "#b7b2a8",
    },
  },
};

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState("light");

  const value = useMemo(() => {
    const theme = PALETTES[themeMode] || PALETTES.light;

    return {
      theme,
      themeMode,
      isDark: themeMode === "dark",
      setThemeMode,
      toggleTheme: () => setThemeMode((prev) => (prev === "dark" ? "light" : "dark")),
    };
  }, [themeMode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
};
