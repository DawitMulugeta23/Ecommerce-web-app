import { createContext, useContext, useEffect, useState } from "react";

// 1. Context መፍጠር (ከሌላ ፋይል ለመጥራት export መሆን አለበት)
export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // LocalStorage ላይ ዳታ ካለ ማየት
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 2. Custom Hook (Navbar ላይ የምንጠቀመው ይሄን ነው)
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
