import type { ReactNode } from "react";

import RequireAuth from "@/components/Auth/RequireAuth";

/**
 * /schema is outside the (presentation-generator) group; same session gate as the main app.
 */
export default function SchemaLayout({ children }: { children: ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}
