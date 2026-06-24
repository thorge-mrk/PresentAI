"use client";

import Wrapper from "@/components/Wrapper";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { trackEvent, MixpanelEvent } from "@/utils/mixpanel";
import { ArrowLeft } from "lucide-react";

const PATHS_WITH_HEADER_BACK = [
  "/upload",
  "/outline",
  "/documents-preview",
  "/template-preview",
] as const;

function pathMatches(pathname: string | null, base: string) {
  return pathname === base || pathname?.startsWith(`${base}/`) === true;
}

const Header = () => {
  const pathname = usePathname();
  const showHeaderBack = PATHS_WITH_HEADER_BACK.some((p) => pathMatches(pathname, p));

  const backToUpload =
    pathMatches(pathname, "/outline") || pathMatches(pathname, "/documents-preview");
  const backToTemplates = pathMatches(pathname, "/template-preview");

  const backHref = backToUpload ? "/upload" : backToTemplates ? "/templates" : "/dashboard";
  const backLabel = backToUpload
    ? "BACK"
    : backToTemplates
      ? "BACK"
      : "BACK";

  return (
    <div
      className="w-full sticky top-0 z-50 py-4"
      style={{ backgroundColor: "var(--bg-surface)", borderBottom: "1px solid var(--bg-muted)" }}
    >
      <Wrapper className="px-5 sm:px-10 lg:px-20">
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" onClick={() => trackEvent(MixpanelEvent.Navigation, { from: pathname, to: "/dashboard" })}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, backgroundColor: "var(--mint-500)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="20" height="20" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g stroke="#08110F" strokeWidth="72" strokeLinecap="round">
                    <line x1="96" y1="220" x2="96" y2="292"/>
                    <line x1="192" y1="160" x2="192" y2="352"/>
                    <line x1="288" y1="112" x2="288" y2="400"/>
                    <line x1="384" y1="172" x2="384" y2="340"/>
                    <line x1="460" y1="222" x2="460" y2="290"/>
                  </g>
                </svg>
              </div>
            </Link>
          </div>
          <div className="flex items-center">
            {showHeaderBack ? (
              <Link
                href={backHref}
                style={{ color: "var(--text-secondary)", fontSize: "0.75rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}
                onClick={() =>
                  trackEvent(MixpanelEvent.Navigation, { from: pathname, to: backHref })
                }
              >
                <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden />
                <span>{backLabel}</span>
              </Link>
            ) : null}
          </div>
        </div>
      </Wrapper>
    </div>
  );
};

export default Header;
