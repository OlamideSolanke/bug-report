import "./globals.css";
import type { ReactNode } from "react";
import Script from "next/script";
import ApolloWrapper from "@/lib/apollo-provider";
import NavBar from "@/components/NavBar";

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
          <NavBar />
          <main className="mx-auto max-w-4xl p-4">{children}</main>
        </ApolloWrapper>
      </body>
    </html>
  );
}
