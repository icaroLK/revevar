/**
 * No-op for now — no analytics are wired up (privacy, spec §11). Call sites
 * can start tracking events through here later without touching callers.
 */
export function track(
  _event: string,
  _properties?: Record<string, unknown>,
): void {
  // Intentionally empty.
}
