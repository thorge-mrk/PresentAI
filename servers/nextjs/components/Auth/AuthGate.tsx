"use client";

import { FormEvent, useEffect, useState } from "react";
import { notify } from "@/components/ui/sonner";
import { supabase } from "@/lib/supabase";
import { Loader2, Mail, Lock } from "lucide-react";

type Mode = "signin" | "signup";

const OGlyph = () => (
  <svg width="24" height="24" viewBox="0 0 200 200" fill="none">
    <g stroke="#08110F" strokeWidth="28" strokeLinecap="round">
      <line x1="48"  y1="86"  x2="48"  y2="114" />
      <line x1="76"  y1="68"  x2="76"  y2="132" />
      <line x1="104" y1="54"  x2="104" y2="146" />
      <line x1="132" y1="74"  x2="132" y2="126" />
      <line x1="158" y1="90"  x2="158" y2="110" />
    </g>
  </svg>
);

export default function AuthGate() {
  const [mode, setMode] = useState<Mode>("signin");
  const [isLoading, setIsLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      if (session) {
        setIsRedirecting(true);
        window.location.replace("/dashboard");
      } else {
        setIsLoading(false);
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (active && session) {
        setIsRedirecting(true);
        window.location.replace("/dashboard");
      }
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

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
      notify.warning("Passwörter stimmen nicht überein", "Bitte beide Felder gleich ausfüllen.");
      return;
    }
    setIsSubmitting(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email: cleanEmail, password });
        if (error) { notify.error("Registrierung fehlgeschlagen", error.message); return; }
        if (data.session) {
          notify.success("Konto erstellt", "Willkommen! Dein Arbeitsbereich wird geladen.");
        } else {
          notify.success("Bestätige deine E-Mail", "Wir haben dir einen Link geschickt.", { duration: 8000 });
          setMode("signin");
        }
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      if (error) { notify.error("Anmeldung fehlgeschlagen", error.message); return; }
      notify.success("Angemeldet", "Willkommen zurück!");
    } catch (err: any) {
      notify.error("Dienst nicht erreichbar", err?.message || "Bitte versuche es gleich erneut.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "var(--bg-base)",
    padding: 24,
    transition: "background-color var(--dur-base) var(--ease-out)",
  };

  if (isLoading || isRedirecting) {
    return (
      <main style={pageStyle}>
        <div style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--bg-muted)",
          borderRadius: "var(--radius-2xl)",
          boxShadow: "var(--shadow-lg)",
          padding: 40,
          textAlign: "center",
          width: "100%",
          maxWidth: 380,
        }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            backgroundColor: "var(--mint-500)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}>
            <OGlyph />
          </div>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Present</h2>
          <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>by Orately AI</div>
          <div style={{ marginTop: 24, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
            Arbeitsbereich wird geladen…
          </div>
        </div>
      </main>
    );
  }

  const isSetup = mode === "signup";

  const inputStyle: React.CSSProperties = {
    width: "100%",
    backgroundColor: "var(--bg-base)",
    border: "1px solid var(--bg-muted)",
    borderRadius: 12,
    padding: "11px 16px 11px 40px",
    fontFamily: "var(--font-family)",
    fontSize: "0.875rem",
    color: "var(--text-primary)",
    outline: "none",
    transition: "border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.8125rem",
    fontWeight: 600,
    color: "var(--text-primary)",
    marginBottom: 8,
  };

  return (
    <main style={pageStyle}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 60,
            height: 60,
            borderRadius: 18,
            backgroundColor: "var(--mint-500)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 8px 24px -8px rgba(20,184,166,0.5)",
          }}>
            <OGlyph />
          </div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.025em", color: "var(--text-primary)", marginBottom: 4, lineHeight: 1.1 }}>
            Present
          </h1>
          <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>by Orately AI</div>
        </div>

        {/* Card */}
        <div style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--bg-muted)",
          borderRadius: "var(--radius-2xl)",
          boxShadow: "var(--shadow-premium)",
          padding: 32,
        }}>
          <div style={{ marginBottom: 24 }}>
            <div className="o-label" style={{ marginBottom: 6 }}>Anmeldung</div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
              {isSetup ? "Konto erstellen" : "Willkommen zurück"}
            </h2>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginTop: 6, lineHeight: 1.5 }}>
              {isSetup
                ? "Erstelle dein Konto, um KI-Präsentationen zu generieren."
                : "Melde dich an, um deine Präsentationen zu öffnen."}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Email */}
            <div>
              <label htmlFor="email" style={labelStyle}>E-Mail</label>
              <div style={{ position: "relative" }}>
                <Mail size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)", pointerEvents: "none" }} />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="du@beispiel.de"
                  style={inputStyle}
                  disabled={isSubmitting}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--mint-500)";
                    e.target.style.boxShadow = "var(--shadow-focus)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--bg-muted)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" style={labelStyle}>Passwort</label>
              <div style={{ position: "relative" }}>
                <Lock size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)", pointerEvents: "none" }} />
                <input
                  id="password"
                  type="password"
                  autoComplete={isSetup ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mindestens 6 Zeichen"
                  style={inputStyle}
                  disabled={isSubmitting}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--mint-500)";
                    e.target.style.boxShadow = "var(--shadow-focus)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--bg-muted)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* Confirm password (signup only) */}
            {isSetup && (
              <div>
                <label htmlFor="confirmPassword" style={labelStyle}>Passwort bestätigen</label>
                <div style={{ position: "relative" }}>
                  <Lock size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)", pointerEvents: "none" }} />
                  <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Passwort erneut eingeben"
                    style={inputStyle}
                    disabled={isSubmitting}
                    onFocus={(e) => {
                      e.target.style.borderColor = "var(--mint-500)";
                      e.target.style.boxShadow = "var(--shadow-focus)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "var(--bg-muted)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: "100%",
                padding: "13px 20px",
                backgroundColor: "var(--mint-500)",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                fontFamily: "var(--font-family)",
                fontSize: "0.9375rem",
                fontWeight: 700,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.7 : 1,
                boxShadow: "0 8px 18px -10px rgba(20,184,166,0.65)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginTop: 4,
                transition: "filter var(--dur-fast) var(--ease-out)",
              }}
              onMouseEnter={(e) => { if (!isSubmitting) (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.08)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.filter = "none"; }}
            >
              {isSubmitting && <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />}
              {isSubmitting
                ? isSetup ? "Konto wird erstellt…" : "Anmeldung läuft…"
                : isSetup ? "Konto erstellen" : "Anmelden"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setMode(isSetup ? "signin" : "signup")}
            disabled={isSubmitting}
            style={{
              width: "100%",
              textAlign: "center",
              marginTop: 20,
              fontSize: "0.875rem",
              color: "var(--mint-500)",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-family)",
              fontWeight: 500,
              textDecoration: "underline",
            }}
          >
            {isSetup ? "Schon ein Konto? Anmelden" : "Noch kein Konto? Registrieren"}
          </button>
        </div>
      </div>
    </main>
  );
}
