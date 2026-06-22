"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { notify } from "@/components/ui/sonner";
import { supabase } from "@/lib/supabase";

type Mode = "signin" | "signup";

export default function AuthGate() {
  const [mode, setMode] = useState<Mode>("signin");
  const [isLoading, setIsLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Redirect into the app once a session exists.
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      if (session) {
        setIsRedirecting(true);
        window.location.replace("/upload");
      } else {
        setIsLoading(false);
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (active && session) {
        setIsRedirecting(true);
        window.location.replace("/upload");
      }
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Surface the "unauthorized" redirect reason as a toast.
  useEffect(() => {
    if (typeof window === "undefined" || isLoading) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("reason") === "unauthorized") {
      notify.error("Anmeldung erforderlich", "Bitte melde dich an, um fortzufahren.", {
        id: "auth-unauthorized-redirect",
        duration: 5000,
      });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [isLoading]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) {
      notify.warning("Ungültige E-Mail", "Bitte gib eine gültige E-Mail-Adresse ein.");
      return;
    }
    if (password.length < 6) {
      notify.warning("Passwort zu kurz", "Das Passwort muss mindestens 6 Zeichen haben.");
      return;
    }
    if (mode === "signup" && password !== confirmPassword) {
      notify.warning("Passwörter stimmen nicht überein", "Bitte beide Passwortfelder gleich ausfüllen.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
        });
        if (error) {
          notify.error("Registrierung fehlgeschlagen", error.message);
          return;
        }
        if (data.session) {
          notify.success("Konto erstellt", "Willkommen! Dein Arbeitsbereich wird geladen.");
          // onAuthStateChange handles the redirect.
        } else {
          notify.success(
            "Bestätige deine E-Mail",
            "Wir haben dir einen Bestätigungslink geschickt. Danach kannst du dich anmelden.",
            { duration: 8000 }
          );
          setMode("signin");
        }
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      if (error) {
        notify.error("Anmeldung fehlgeschlagen", error.message);
        return;
      }
      notify.success("Angemeldet", "Willkommen zurück. Dein Arbeitsbereich wird geladen.");
    } catch (err: any) {
      notify.error("Dienst nicht erreichbar", err?.message || "Bitte versuche es gleich erneut.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || isRedirecting) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white p-6">
        <div className="relative z-10 w-full max-w-md">
          <div className="rounded-2xl border border-[#EDEEEF] bg-white p-8 text-center shadow-xl">
            <Image src="/Logo.png" alt="Present AI" width={160} height={48} className="mx-auto mb-5 h-12 w-auto opacity-95" priority />
            <div className="mx-auto mb-4 h-1 w-16 rounded-full bg-[#7C51F8]" />
            <h1 className="font-syne text-lg font-semibold text-black">Present AI</h1>
            <p className="mt-3 font-syne text-sm text-[#000000CC]">Arbeitsbereich wird vorbereitet…</p>
          </div>
        </div>
      </main>
    );
  }

  const isSetup = mode === "signup";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white p-6">
      <section className="relative z-10 w-full max-w-xl rounded-2xl border border-[#E1E1E5] bg-white p-7 shadow-xl sm:p-10">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-[74px] w-[74px] shrink-0 items-center justify-center rounded-[4px] bg-[#F4F3FF] p-3">
            <Image src="/logo-with-bg.png" alt="" width={40} height={40} className="h-10 w-10 object-contain" />
          </div>
          <div>
            <p className="font-syne text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7A5AF8]">
              Geschützter Zugang
            </p>
            <h1 className="mt-1 font-syne text-2xl font-semibold leading-tight text-black sm:text-[26px]">
              {isSetup ? "Konto erstellen" : "Anmelden"}
            </h1>
          </div>
        </div>

        <p className="font-syne text-base text-[#000000CC]">
          Die Anmeldung per E-Mail schützt die API-Limits. Präsentationen erstellen können nur
          freigeschaltete E-Mail-Adressen.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="block font-syne text-sm font-medium text-black">E-Mail</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="du@beispiel.de"
              className="w-full rounded-[11px] border border-[#EDEEEF] bg-white px-4 py-3 font-syne text-sm text-black outline-none transition placeholder:text-[#999999] focus:border-[#a49cfc] focus:ring-2 focus:ring-[#5146E5]/20"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block font-syne text-sm font-medium text-black">Passwort</label>
            <input
              id="password"
              type="password"
              autoComplete={isSetup ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mindestens 6 Zeichen"
              className="w-full rounded-[11px] border border-[#EDEEEF] bg-white px-4 py-3 font-syne text-sm text-black outline-none transition placeholder:text-[#999999] focus:border-[#a49cfc] focus:ring-2 focus:ring-[#5146E5]/20"
              disabled={isSubmitting}
            />
          </div>

          {isSetup ? (
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block font-syne text-sm font-medium text-black">Passwort bestätigen</label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Passwort erneut eingeben"
                className="w-full rounded-[11px] border border-[#EDEEEF] bg-white px-4 py-3 font-syne text-sm text-black outline-none transition placeholder:text-[#999999] focus:border-[#a49cfc] focus:ring-2 focus:ring-[#5146E5]/20"
                disabled={isSubmitting}
              />
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-[58px] border border-[#EDEEEF] bg-[#7C51F8] px-5 py-3 font-syne text-xs font-semibold text-white transition hover:bg-[#6d46e6] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? isSetup ? "Konto wird erstellt…" : "Anmeldung…"
              : isSetup ? "Konto erstellen" : "Anmelden"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMode(isSetup ? "signin" : "signup")}
          className="mt-6 w-full text-center font-syne text-sm text-[#7A5AF8] hover:underline"
          disabled={isSubmitting}
        >
          {isSetup ? "Schon ein Konto? Jetzt anmelden" : "Noch kein Konto? Jetzt registrieren"}
        </button>
      </section>
    </main>
  );
}
