"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { DELETE_USER, GET_USERS } from "@/lib/queries";
import RequireAuth from "@/components/RequireAuth";
import { useMe } from "@/lib/useMe";
import type { User } from "@/lib/types";

function TeamContent() {
  const { me } = useMe();
  const { data, loading } = useQuery<{ users: User[] }>(GET_USERS, {
    fetchPolicy: "cache-and-network",
  });
  const [deleteUser] = useMutation(DELETE_USER, {
    refetchQueries: ["GetUsers"],
  });
  const [error, setError] = useState("");

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

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-semibold">Team</h2>
        <p className="text-sm text-gray-500">
          People create their own accounts on the Sign up page.
        </p>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading && !data && <p>Loading…</p>}
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
                {u.role === "ADMIN" ? "Admin" : "User"}
              </span>
              {me?.id === u.id ? (
                <span className="text-xs text-gray-500">You</span>
              ) : (
                <button
                  onClick={() => handleDelete(u)}
                  className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                >
                  Delete
                </button>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function UsersPage() {
  return (
    <RequireAuth adminOnly>
      <TeamContent />
    </RequireAuth>
  );
}
