import "./globals.css";
import type { ReactNode } from "react";
import Link from "next/link";
import Script from "next/script";
import ApolloWrapper from "@/lib/apollo-provider";
import ThemeSwitcher from "@/components/ThemeSwitcher";

export const metadata = { title: "Bug Tracker" };

const applySavedTheme = `
try {
  var t = localStorage.getItem("theme");
  if (t) document.documentElement.dataset.theme = t;
  var b = localStorage.getItem("custom-bg");
  if (b) document.documentElement.style.setProperty("--app-bg", b);
} catch (e) {}
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">
        <Script
          id="apply-saved-theme"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: applySavedTheme }}
        />
        <ApolloWrapper>
          <header className="border-b bg-white">
            <nav className="mx-auto flex max-w-4xl items-center gap-6 p-4">
              <Link href="/" className="font-semibold">
                Bug Tracker
              </Link>
              <Link
                href="/users"
                className="text-sm text-gray-600 hover:text-black"
              >
                Team
              </Link>
              <ThemeSwitcher />
            </nav>
          </header>
          <main className="mx-auto max-w-4xl p-4">{children}</main>
        </ApolloWrapper>
      </body>
    </html>
  );
}
