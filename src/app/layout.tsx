import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nexus AI — Intelligent Startup Incubation Platform",
  description:
    "AI-powered incubation ecosystem that democratizes access to startup mentorship, validation, investor matching, and progress tracking. Your AI-native Y Combinator.",
  keywords: [
    "startup incubation",
    "AI mentorship",
    "investor matching",
    "startup validation",
    "idea evaluation",
  ],
  openGraph: {
    title: "Nexus AI — Intelligent Startup Incubation Platform",
    description: "AI-powered startup incubation for the next generation of founders",
    type: "website",
  },
};

import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
