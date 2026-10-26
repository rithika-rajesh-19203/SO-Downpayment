import { useEffect, useState } from 'react';

/**
 * PROTOTYPE VERSIONS — which recorded version this build is, and the others.
 *
 * Each version is a git tag (`v1`, `v2`, …). The deploy builds every tag into
 * its own folder on the live site and writes `versions.json` beside them, so
 * the list is read at RUNTIME: v1, built before v2 existed, still lists v2.
 *
 *   site/
 *     index.html        → redirects to the newest version
 *     versions.json     → [{ id, label, note, date }]
 *     v1/  v2/  …       → one build per tag
 *     latest/           → main, unrecorded changes
 *
 * `VITE_PROTOTYPE_VERSION` is set by the deploy for each build. In `npm run dev`
 * it is unset, and the bar says "Local preview".
 */
export interface PrototypeVersion {
  /** The folder and the tag: `v1`, or `latest` for main. */
  id: string;
  label: string;
  note?: string;
  date?: string;
}

export const CURRENT_VERSION: string = import.meta.env.VITE_PROTOTYPE_VERSION ?? 'local';

export function useVersions(): PrototypeVersion[] {
  const [versions, setVersions] = useState<PrototypeVersion[]>([]);
  useEffect(() => {
    if (CURRENT_VERSION === 'local') return;
    //  One level up from this version's folder — the site root.
    fetch(new URL('../versions.json', window.location.href))
      .then((r) => (r.ok ? r.json() : []))
      .then((v: PrototypeVersion[]) => setVersions(Array.isArray(v) ? v : []))
      .catch(() => setVersions([]));
  }, []);
  return versions;
}

/** Open another version — its folder, beside this one. */
export function openVersion(id: string) {
  window.location.href = new URL(`../${id}/`, window.location.href).toString();
}
