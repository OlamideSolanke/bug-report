"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_USER, DELETE_USER, GET_USERS } from "@/lib/queries";
import type { User } from "@/lib/types";

export default function UsersPage() {
  const { data, loading } = useQuery<{ users: User[] }>(GET_USERS);
  const [createUser] = useMutation(CREATE_USER, {
    refetchQueries: ["GetUsers"],
  });
  const [deleteUser] = useMutation(DELETE_USER, {
    refetchQueries: ["GetUsers"],
  });
  const [form, setForm] = useState({ name: "", email: "", role: "DEVELOPER" });
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await createUser({ variables: { input: form } });
      setForm({ name: "", email: "", role: "DEVELOPER" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  async function handleDelete(user: User) {
    const ok = window.confirm(
      `Delete ${user.name}? This also deletes the bugs they reported and their comments. Bugs assigned to them will become unassigned.`,
    );
    if (!ok) return;
    setError("");
    try {
      await deleteUser({ variables: { id: user.id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete user");
    }
  }

  const field = "rounded border bg-white p-2 text-sm";

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-white p-4">
        <h2 className="mb-3 font-semibold">Add team member</h2>
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-3">
          <input
            className={field}
            placeholder="Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className={field}
            placeholder="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <select
            className={field}
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="DEVELOPER">Developer</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button className="rounded bg-black px-4 py-2 text-sm text-white">
            Add
          </button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </section>

      <section>
        <h2 className="mb-3 font-semibold">Team</h2>
        {loading && <p>Loading…</p>}
        <ul className="space-y-2">
          {data?.users.map((u) => (
            <li
              key={u.id}
              className="flex items-center justify-between rounded-lg border bg-white p-3 text-sm"
            >
              <span>
                {u.name} <span className="text-gray-500">({u.email})</span>
              </span>
              <span className="flex items-center gap-3">
                <span className="text-xs font-medium text-gray-600">
                  {u.role}
                </span>
                <button
                  onClick={() => handleDelete(u)}
                  className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                >
                  Delete
                </button>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
