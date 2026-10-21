"use client";

import { useState, type SyntheticEvent } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
    adminCode: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: SyntheticEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Sign up failed.");
        setBusy(false);
        return;
      }
      window.location.assign("/");
    } catch {
      setError("Could not reach the server.");
      setBusy(false);
    }
  }

  const field = "w-full rounded border bg-white p-2 text-sm";

  return (
    <div className="mx-auto mt-8 max-w-sm rounded-lg border bg-white p-6">
      <h1 className="mb-4 text-xl font-semibold">Create an account</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          className={field}
          placeholder="Full name"
          autoComplete="name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className={field}
          type="email"
          placeholder="Email"
          autoComplete="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          className={field}
          type="password"
          placeholder="Password (at least 8 characters)"
          autoComplete="new-password"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="role"
              checked={form.role === "USER"}
              onChange={() => setForm({ ...form, role: "USER" })}
            />
            User
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="role"
              checked={form.role === "ADMIN"}
              onChange={() => setForm({ ...form, role: "ADMIN" })}
            />
            Admin
          </label>
        </div>

        {form.role === "ADMIN" && (
          <input
            className={field}
            type="password"
            placeholder="Admin code"
            required
            value={form.adminCode}
            onChange={(e) => setForm({ ...form, adminCode: e.target.value })}
          />
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          disabled={busy}
          className="w-full rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {busy ? "Creating account…" : "Sign up"}
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
