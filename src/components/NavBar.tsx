"use client";

import Link from "next/link";
import { useMe } from "@/lib/useMe";
import ThemeSwitcher from "@/components/ThemeSwitcher";

export default function NavBar() {
  const { me } = useMe();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/login");
  }

  return (
    <header className="border-b bg-white">
      <nav className="mx-auto flex max-w-4xl flex-wrap items-center gap-4 p-4">
        <Link href="/" className="font-semibold">
          Bug Tracker
        </Link>
        {me?.role === "ADMIN" && (
          <Link
            href="/users"
            className="text-sm text-gray-600 hover:text-black"
          >
            Team
          </Link>
        )}
        <ThemeSwitcher />
        {me ? (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-600">
              {me.name} · {me.role === "ADMIN" ? "Admin" : "User"}
            </span>
            <button onClick={logout} className="underline">
              Log out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-sm">
            <Link href="/login" className="underline">
              Log in
            </Link>
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
