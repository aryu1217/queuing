"use client";

import { useQuery } from "@tanstack/react-query";

export function useMyProfile() {
  return useQuery({
    queryKey: ["profile", "me"],
    queryFn: async () => {
      const res = await fetch("/api/profile/me", { cache: "no-store" });
      if (res.status === 401) return null;
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      return json.profile; // { nickname, avatar_url, status_message }
    },
    staleTime: 30_000,
  });
}
