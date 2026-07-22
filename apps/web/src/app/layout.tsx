import type { Metadata } from "next";
import { Geist, Inter, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-serif-display",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Finwise AI | Build confidence before you build wealth.",
  description: "The world's most premium financial learning platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${geist.variable} ${dmSerif.variable} ${inter.className}`}
      >
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
