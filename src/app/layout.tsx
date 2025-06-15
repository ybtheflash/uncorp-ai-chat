import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "./ClientLayout";
import LoadVideoOverlay from "./LoadVideoOverlay";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* SVG favicon for modern browsers */}
        <link rel="icon" type="image/svg+xml" href="/smirk.svg" />
        {/* fallback for browsers that don't support SVG favicons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <title>UnCorp AI Chat</title>
        <meta
          name="description"
          content="A secure, personal chat interface for Gemini 2.0 Flash"
        />
      </head>
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
