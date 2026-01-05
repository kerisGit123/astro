import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { NextIntlClientProvider } from 'next-intl';
import { cookies } from 'next/headers';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ZiWei Path | AI-powered Destiny & Timing",
  description: "Understand who you are, who suits you, and when to act using Zi Wei Dou Shu, Western, and Chinese Zodiac.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get locale from cookie
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en';
  
  // Import messages for the current locale
  const messages = (await import(`@/../messages/${locale}.json`)).default;

  return (
    <ClerkProvider>
      <NextIntlClientProvider messages={messages} locale={locale}>
        <html lang={locale} suppressHydrationWarning>
          <body className={`${inter.className} antialiased`}>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster />
            </ThemeProvider>
          </body>
        </html>
      </NextIntlClientProvider>
    </ClerkProvider>
  );
}
