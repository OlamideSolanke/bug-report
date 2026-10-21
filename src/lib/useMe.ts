"use client";

import { useQuery } from "@apollo/client";
import { ME } from "@/lib/queries";
import type { User } from "@/lib/types";

export function useMe() {
  const { data, loading } = useQuery<{ me: User | null }>(ME);
  return { me: data?.me ?? null, loading: loading && !data };
}
