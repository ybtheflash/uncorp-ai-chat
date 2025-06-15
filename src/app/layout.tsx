import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // Assuming globals.css is in src/app/
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import {
  ColorSchemeProvider,
  useColorSchemeFromCookie,
} from "@/components/providers/ColorSchemeProvider";
import ClientLayout from "./ClientLayout";
import LoadVideoOverlay from "./LoadVideoOverlay";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "UnCorp AI Chat",
  description: "A secure, personal chat interface for Gemini 1.5 Pro",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-background text-foreground font-sans antialiased`}
      >
        <ClientLayout>
          <LoadVideoOverlay />
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
