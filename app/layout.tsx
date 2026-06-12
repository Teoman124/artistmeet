import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/src/lib/auth";
import { UserService } from "@/src/services/user.service";
import { ProfileMenu } from "@/app/components/profile-menu";
import { SimpleThemeProvider } from "@/app/components/SimpleThemeProvider";
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
      <body className="min-h-full flex flex-col bg-white dark:bg-neutral-950 text-neutral-950 dark:text-white">
        <SimpleThemeProvider>
          <header className="sticky top-0 z-50 w-full bg-white/70 dark:bg-black/70 backdrop-blur-sm shadow-sm">
            <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
              <Link href="/" className="text-lg font-semibold">
                ArtistMeet
              </Link>
              <nav className="relative text-sm text-gray-600 dark:text-gray-300">
                {!session ? (
                  <>
                    <Link href="/login" className="px-3 hover:underline">
                      Login
                    </Link>
                    <Link href="/register" className="px-3 hover:underline">
                      Register
                    </Link>
                  </>
                ) : (
                  <ProfileMenu username={username} avatarUrl={userAvatarUrl} />
                )}
              </nav>
            </div>
          </header>

          <main className="flex-1">
            <div className="mx-auto max-w-7xl px-4 py-10">{children}</div>
          </main>

          <footer className="w-full border-t border-gray-200 dark:border-gray-800">
            <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} ArtistMeet, All rights reserved.
            </div>
          </footer>
        </SimpleThemeProvider>
      </body>
    </html>
  );
}