"use client";

import { useState, type SyntheticEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client";
import {
  ADD_COMMENT,
  ASSIGN_BUG,
  DELETE_BUG,
  GET_BUG,
  GET_USERS,
  UPDATE_STATUS,
} from "@/lib/queries";
import { PriorityBadge, StatusBadge } from "@/components/Badges";
import RequireAuth from "@/components/RequireAuth";
import type { Bug, User } from "@/lib/types";

function BugContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data, loading, error } = useQuery<{ bug: Bug | null }>(GET_BUG, {
    variables: { id },
    fetchPolicy: "cache-and-network",
  });
  const { data: usersData } = useQuery<{ users: User[] }>(GET_USERS);
  const [updateStatus] = useMutation(UPDATE_STATUS);
  const [assignBug] = useMutation(ASSIGN_BUG);
  const [deleteBug] = useMutation(DELETE_BUG);
  const [addComment, { loading: posting }] = useMutation(ADD_COMMENT, {
    refetchQueries: ["GetBug"],
  });
  const [text, setText] = useState("");

  if (loading && !data) return <p>Loading…</p>;
  if (error) return <p className="text-red-600">{error.message}</p>;
  const bug = data?.bug;
  if (!bug) return <p>Bug not found.</p>;

  const users = usersData?.users ?? [];

  async function handleComment(e: SyntheticEvent) {
    e.preventDefault();
    if (!text.trim() || !bug) return;
    await addComment({ variables: { input: { bugId: bug.id, text } } });
    setText("");
  }

  async function handleDelete() {
    if (!bug) return;
    if (
      !window.confirm(
        "Delete this bug and all its comments? This cannot be undone.",
      )
    )
      return;
    await deleteBug({ variables: { id: bug.id } });
    router.push("/");
  }

  const field = "rounded border bg-white p-2 text-sm";

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm text-gray-600 hover:text-black">
        ← All bugs
      </Link>

      <section className="rounded-lg border bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-semibold">{bug.title}</h1>
          <span className="flex gap-2">
            <PriorityBadge priority={bug.priority} />
            <StatusBadge status={bug.status} />
          </span>
        </div>
        <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">
          {bug.description || "No description provided."}
        </p>
        <p className="mt-3 text-xs text-gray-500">
          Reported by {bug.createdBy.name} on{" "}
          {new Date(bug.createdAt).toLocaleString()}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <label className="text-sm">
            <span className="mr-2 text-gray-600">Status</span>
            <select
              className={field}
              value={bug.status}
              onChange={(e) =>
                updateStatus({
                  variables: { id: bug.id, status: e.target.value },
                })
              }
            >
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="mr-2 text-gray-600">Assigned to</span>
            <select
              className={field}
              value={bug.assignedTo?.id ?? ""}
              onChange={(e) =>
                assignBug({
                  variables: { bugId: bug.id, userId: e.target.value || null },
                })
              }
            >
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={handleDelete}
            className="ml-auto rounded border border-red-300 px-3 py-2 text-sm text-red-700 hover:bg-red-50"
          >
            Delete bug
          </button>
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-semibold">Discussion</h2>
        <ul className="mb-4 space-y-2">
          {bug.comments?.length === 0 && (
            <p className="text-sm text-gray-500">No comments yet.</p>
          )}
          {bug.comments?.map((c) => (
            <li key={c.id} className="rounded-lg border bg-white p-3 text-sm">
              <p className="whitespace-pre-wrap">{c.text}</p>
              <p className="mt-1 text-xs text-gray-500">
                {c.user.name} · {new Date(c.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>

        <form onSubmit={handleComment} className="space-y-2">
          <textarea
            className={`${field} w-full`}
            rows={3}
            placeholder="Add a comment"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            disabled={posting}
            className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            Post comment
          </button>
        </form>
      </section>
    </div>
  );
}

export default function BugPage() {
  return (
    <RequireAuth adminOnly>
      <BugContent />
    </RequireAuth>
  );
}
