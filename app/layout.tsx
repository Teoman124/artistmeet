import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/src/lib/auth";
import { UserService } from "@/src/services/user.service";
import { ProfileMenu } from "@/app/components/profile-menu";
import { SimpleThemeProvider } from "@/app/components/SimpleThemeProvider";
import { Header } from "@/app/components/Header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ArtistMeet",
  description: "Connect with artists and share your music",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  let userAvatarUrl = null;
  let username = '';

  if (session) {
    const user = await UserService.getUserByUsername(session.username);
    if (user) {
      username = user.username;
      userAvatarUrl = user.avatar_url;
    }
  }

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-white text-neutral-950 dark:bg-neutral-950 dark:text-white">
        <SimpleThemeProvider>
          <Header username={username} avatarUrl={userAvatarUrl} session={!!session} />

          {/* Meer ruimte tussen header en content */}
          <main className="flex-1 pt-8">
            <div className="mx-auto max-w-7xl px-4">{children}</div>
          </main>

          <footer className="w-full border-t border-gray-200 dark:border-gray-800 mt-16">
            <div className="mx-auto max-w-7xl px-4 py-8 text-center text-sm text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} ArtistMeet, All rights reserved.
            </div>
          </footer>
        </SimpleThemeProvider>
      </body>
    </html>
  );
}