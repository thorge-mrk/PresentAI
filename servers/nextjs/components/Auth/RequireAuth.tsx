"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

/**
 * Client-side guard for all authenticated pages. Redirects to the login page
 * (`/`) when there is no Supabase session. The real protection for API usage
 * lives in the edge functions (verify_jwt + allowlist); this is the UX gate.
 */
export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      if (session) {
        setAuthed(true);
        setChecked(true);
      } else {
        router.replace("/?reason=unauthorized");
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (!session) {
        setAuthed(false);
        router.replace("/?reason=unauthorized");
      } else {
        setAuthed(true);
        setChecked(true);
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  if (!checked || !authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
      </div>
    );
  }

  return <>{children}</>;
}
