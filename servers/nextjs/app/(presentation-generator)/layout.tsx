import React from "react";

import RequireAuth from "@/components/Auth/RequireAuth";
import { ConfigurationInitializer } from "../ConfigurationInitializer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div>
        <ConfigurationInitializer>{children}</ConfigurationInitializer>
      </div>
    </RequireAuth>
  );
}
