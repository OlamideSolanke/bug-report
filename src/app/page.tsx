"use client";

import { useState, type SyntheticEvent } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_BUG, GET_BUGS, GET_USERS } from "@/lib/queries";
import { PriorityBadge, StatusBadge } from "@/components/Badges";
import RequireAuth from "@/components/RequireAuth";
import { useMe } from "@/lib/useMe";
import type { Bug, User } from "@/lib/types";

const emptyForm = {
  title: "",
  description: "",
  priority: "MEDIUM",
  assignedTo: "",
};

function HomeContent() {
  const { me } = useMe();
  const isAdmin = me?.role === "ADMIN";

  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  const { data, loading, error } = useQuery<{ bugs: Bug[] }>(GET_BUGS, {
    variables: { status: status || null, priority: priority || null },
    fetchPolicy: "cache-and-network",
  });
  const { data: usersData } = useQuery<{ users: User[] }>(GET_USERS, {
    skip: !isAdmin,
    fetchPolicy: "cache-and-network",
  });
  const [createBug, { loading: creating }] = useMutation(CREATE_BUG, {
    refetchQueries: ["GetBugs"],
  });

  const users = usersData?.users ?? [];

  async function handleSubmit(e: SyntheticEvent) {
    e.preventDefault();
    setFormError("");
    try {
      await createBug({
        variables: {
          input: {
            title: form.title,
            description: form.description,
            priority: form.priority,
            assignedTo: isAdmin ? form.assignedTo || null : null,
          },
        },
      });
      setForm(emptyForm);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  const field = "w-full rounded border bg-white p-2 text-sm";

  return (
    <div className="space-y-8">
      <section className="rounded-lg border bg-white p-4">
        <h2 className="mb-1 font-semibold">Report a bug</h2>
        <p className="mb-3 text-xs text-gray-500">Reporting as {me?.name}</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className={field}
            placeholder="Title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            className={field}
            placeholder="Describe the bug, steps to reproduce, expected result"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              className={field}
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <option value="LOW">Low priority</option>
              <option value="MEDIUM">Medium priority</option>
              <option value="HIGH">High priority</option>
            </select>
            {isAdmin && (
              <select
                className={field}
                value={form.assignedTo}
                onChange={(e) =>
                  setForm({ ...form, assignedTo: e.target.value })
                }
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <button
            disabled={creating}
            className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {creating ? "Saving…" : "Create bug"}
          </button>
        </form>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">All bugs</h2>
          <div className="flex gap-2">
            <select
              className="rounded border bg-white p-1 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Any status</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
            <select
              className="rounded border bg-white p-1 text-sm"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="">Any priority</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
        </div>

        {loading && !data && <p>Loading…</p>}
        {error && <p className="text-red-600">{error.message}</p>}
        {data?.bugs.length === 0 && (
          <p className="text-sm text-gray-500">No bugs found.</p>
        )}

        <ul className="space-y-2">
          {data?.bugs.map((bug) => {
            const card = (
              <>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{bug.title}</span>
                  <span className="flex gap-2">
                    <PriorityBadge priority={bug.priority} />
                    <StatusBadge status={bug.status} />
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Reported by {bug.createdBy.name} ·{" "}
                  {bug.assignedTo
                    ? `Assigned to ${bug.assignedTo.name}`
                    : "Unassigned"}
                </p>
              </>
            );
            return (
              <li key={bug.id}>
                {isAdmin ? (
                  <Link
                    href={`/bugs/${bug.id}`}
                    className="block rounded-lg border bg-white p-3 hover:border-black"
                  >
                    {card}
                  </Link>
                ) : (
                  <div className="rounded-lg border bg-white p-3">{card}</div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

export default function HomePage() {
  return (
    <RequireAuth>
      <HomeContent />
    </RequireAuth>
  );
}
