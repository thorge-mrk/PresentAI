'use client';

/**
 * Telemetry removed in the cloud version. The MixpanelEvent enum and trackEvent
 * stub are kept so existing call sites compile without a tracking dependency.
 */

// Permissive event map: any MixpanelEvent.X access resolves to the key name,
// so legacy call sites keep compiling without enumerating every event.
export const MixpanelEvent: Record<string, string> =
  typeof Proxy !== "undefined"
    ? new Proxy({} as Record<string, string>, { get: (_t, p) => String(p) })
    : {};

export function initMixpanel(): void {
  // no-op
}

export function trackEvent(_event: string, _properties?: Record<string, unknown>): void {
  // no-op
}

export function identifyUser(_id?: string): void {
  // no-op
}
