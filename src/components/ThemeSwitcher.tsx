"use client";

import { useSyncExternalStore } from "react";

const themes = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "ocean", label: "Ocean" },
  { value: "forest", label: "Forest" },
  { value: "sunset", label: "Sunset" },
];

function subscribe(callback: () => void) {
  window.addEventListener("theme-change", callback);
  return () => window.removeEventListener("theme-change", callback);
}

function read(key: string, fallback: string) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {}
  window.dispatchEvent(new Event("theme-change"));
}

export default function ThemeSwitcher() {
  const theme = useSyncExternalStore(
    subscribe,
    () => read("theme", "light"),
    () => "light",
  );
  const bg = useSyncExternalStore(
    subscribe,
    () => read("custom-bg", ""),
    () => "",
  );

  function changeTheme(value: string) {
    document.documentElement.dataset.theme = value;
    save("theme", value);
  }

  function changeBg(value: string) {
    if (value) document.documentElement.style.setProperty("--app-bg", value);
    else document.documentElement.style.removeProperty("--app-bg");
    save("custom-bg", value);
  }

  return (
    <div className="ml-auto flex items-center gap-2 text-sm">
      <select
        className="rounded border bg-white p-1"
        value={theme}
        onChange={(e) => changeTheme(e.target.value)}
        aria-label="Theme"
      >
        {themes.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
      <input
        type="color"
        value={bg || "#ffffff"}
        onChange={(e) => changeBg(e.target.value)}
        className="h-7 w-9 cursor-pointer rounded border bg-white p-0.5"
        aria-label="Background colour"
        title="Custom background colour"
      />
      {bg && (
        <button onClick={() => changeBg("")} className="text-xs underline">
          Reset
        </button>
      )}
    </div>
  );
}
