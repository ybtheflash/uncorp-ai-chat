"use client";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import {
  ColorSchemeProvider,
  useColorSchemeFromCookie,
} from "@/components/providers/ColorSchemeProvider";
import LoadVideoOverlay from "./LoadVideoOverlay";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { colorScheme, theme } = useColorSchemeFromCookie();
  return (
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ColorSchemeProvider colorScheme={colorScheme} theme={theme}>
          <LoadVideoOverlay />
          {children}
        </ColorSchemeProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
