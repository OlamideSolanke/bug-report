"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMe } from "@/lib/useMe";

export default function RequireAuth({
  children,
  adminOnly = false,
}: {
  children: ReactNode;
  adminOnly?: boolean;
}) {
  const router = useRouter();
  const { me, loading } = useMe();

  useEffect(() => {
    if (!loading && !me) router.replace("/login");
  }, [loading, me, router]);

  if (loading || !me) return <p>Loading…</p>;

  if (adminOnly && me.role !== "ADMIN") {
    return (
      <div className="rounded-lg border bg-white p-4 text-sm">
        <p className="font-medium">Admins only</p>
        <p className="mt-1 text-gray-600">
          Your account doesn’t have access to this page.
        </p>
        <Link href="/" className="mt-3 inline-block underline">
          Back to bugs
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
