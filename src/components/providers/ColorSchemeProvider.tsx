"use client";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";

interface ColorSchemeProviderProps {
  colorScheme: string;
  theme: string;
  children: React.ReactNode;
}

export function ColorSchemeProvider({
  colorScheme: initialColorScheme,
  theme: initialTheme,
  children,
}: ColorSchemeProviderProps) {
  const [colorScheme, setColorScheme] = useState(initialColorScheme);
  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.removeAttribute("style");
    if (colorScheme === "lilac") {
      root.style.setProperty("--primary", "270 40% 70%");
      root.style.setProperty("--primary-foreground", "0 0% 100%");
      root.style.setProperty("--accent", "270 40% 85%");
      root.style.setProperty("--accent-foreground", "270 40% 30%");
    } else if (colorScheme === "blue") {
      root.style.setProperty("--primary", "217 91% 60%");
      root.style.setProperty("--primary-foreground", "0 0% 100%");
      root.style.setProperty("--accent", "217 91% 80%");
      root.style.setProperty("--accent-foreground", "217 91% 30%");
    } else if (colorScheme === "lightblue") {
      root.style.setProperty("--primary", "199 90% 55%");
      root.style.setProperty("--primary-foreground", "0 0% 100%");
      root.style.setProperty("--accent", "199 90% 80%");
      root.style.setProperty("--accent-foreground", "199 90% 30%");
    } else if (colorScheme === "dark") {
      root.style.setProperty("--primary", "222 47% 15%");
      root.style.setProperty("--primary-foreground", "210 40% 90%");
      root.style.setProperty("--accent", "222 47% 25%");
      root.style.setProperty("--accent-foreground", "210 40% 90%");
    } else if (colorScheme === "amoled") {
      if (theme === "dark") {
        root.style.setProperty("--background", "0 0% 0%");
        root.style.setProperty("--foreground", "0 0% 100%");
        root.style.setProperty("--primary", "0 0% 10%");
        root.style.setProperty("--primary-foreground", "0 0% 100%");
        root.style.setProperty("--accent", "0 0% 20%");
        root.style.setProperty("--accent-foreground", "0 0% 100%");
        document.body.style.color = "#fff";
        document.body.classList.add("amoled-dark");
      } else {
        root.style.setProperty("--primary", "217 91% 60%");
        root.style.setProperty("--primary-foreground", "0 0% 100%");
        root.style.setProperty("--accent", "217 91% 80%");
        root.style.setProperty("--accent-foreground", "217 91% 30%");
        document.body.style.color = "";
        document.body.classList.remove("amoled-dark");
      }
    }
    return () => {
      document.body.style.color = "";
      document.body.classList.remove("amoled-dark");
    };
  }, [colorScheme, theme]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cookieScheme = Cookies.get("colorScheme");
      const cookieTheme = Cookies.get("theme");
      if (cookieScheme) setColorScheme(cookieScheme);
      if (cookieTheme) setTheme(cookieTheme);
    }
  }, []);

  return <>{children}</>;
}

export function useColorSchemeFromCookie(
  defaultScheme = "lilac",
  defaultTheme = "light"
) {
  const [colorScheme, setColorScheme] = useState(defaultScheme);
  const [theme, setTheme] = useState(defaultTheme);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cookieScheme = Cookies.get("colorScheme");
      const cookieTheme = Cookies.get("theme");
      if (cookieScheme) setColorScheme(cookieScheme);
      if (cookieTheme) setTheme(cookieTheme);
    }
  }, []);

  return { colorScheme, setColorScheme, theme, setTheme };
}
