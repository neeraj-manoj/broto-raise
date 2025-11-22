import type { Metadata } from "next";
import { Lexend, Lexend_Giga } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next"

const lexend = Lexend({
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"],
  variable: '--font-lexend',
  display: 'swap',
  preload: true,
});

const lexendGiga = Lexend_Giga({
  weight: ['400', '500', '600', '700', '800', '900'],
  subsets: ["latin"],
  variable: '--font-lexend-giga',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: "BrotoRaise",
  description: "Your Voice, Brocamp's Commitment. Transparent. Fast. Impactful.",
  keywords: ["Brototype", "Brocamp", "complaint management", "student feedback", "tech education"],
  authors: [{ name: "Brototype" }],
  openGraph: {
    title: "BrotoRaise",
    description: "Empowering Brocamp students with transparent and efficient complaint resolution",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${lexend.variable} ${lexendGiga.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
          forcedTheme="dark"
        >
          {children}
          <SpeedInsights />
          <Analytics />
          <Toaster
            position="top-right"
            duration={2000}
            toastOptions={{
              style: {
                background: 'rgba(17, 24, 39, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
                backdropFilter: 'blur(12px)',
              },
              className: 'toast-custom',
            }}
            richColors
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
