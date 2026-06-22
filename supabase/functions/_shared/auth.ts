// Authentication + allowlist gate.
// Every function requires a logged-in user (verify_jwt = true at the gateway).
// Expensive functions additionally require the user's email to be allowlisted,
// which protects the owner's Gemini / Pexels usage limits.
import { serviceClient, userClient } from "./clients.ts";

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export interface AuthedUser {
  id: string;
  email: string;
}

export async function getUser(req: Request): Promise<AuthedUser> {
  const supa = userClient(req);
  const { data, error } = await supa.auth.getUser();
  if (error || !data.user) {
    throw new HttpError(401, "Bitte zuerst anmelden.");
  }
  return { id: data.user.id, email: (data.user.email ?? "").toLowerCase() };
}

export async function requireAllowed(user: AuthedUser): Promise<void> {
  const svc = serviceClient();
  const { data, error } = await svc
    .from("allowed_emails")
    .select("email")
    .eq("email", user.email)
    .maybeSingle();

  if (error) {
    throw new HttpError(500, "Allowlist-Prüfung fehlgeschlagen.");
  }
  if (!data) {
    throw new HttpError(
      403,
      "Deine E-Mail ist nicht freigeschaltet. Bitte den Administrator, dich zur Allowlist (Tabelle allowed_emails) hinzuzufügen.",
    );
  }
}
