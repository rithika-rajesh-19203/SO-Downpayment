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
 * it is unset: the bar says "Local preview", the list is read from the LIVE
 * site (GitHub Pages sends `access-control-allow-origin: *`), and picking a
 * recorded version opens it there in a new tab — so a local change can be put
 * side by side with what is recorded.
 */
export interface PrototypeVersion {
  /** The folder and the tag: `v1`, or `latest` for main. */
  id: string;
  label: string;
  note?: string;
  date?: string;
}

export const CURRENT_VERSION: string = import.meta.env.VITE_PROTOTYPE_VERSION ?? 'local';

/** Where the recorded versions live, for the local preview to reach them. */
const LIVE_SITE = 'https://rithika-rajesh-19203.github.io/SO-Downpayment/';

const LOCAL: PrototypeVersion = { id: 'local', label: 'Local preview', note: 'your working copy, not pushed' };

export function useVersions(): PrototypeVersion[] {
  const [versions, setVersions] = useState<PrototypeVersion[]>([]);
  useEffect(() => {
    const local = CURRENT_VERSION === 'local';
    //  Live: one level up from this version's folder, the site root. Local:
    //  the live site itself.
    fetch(local ? new URL('versions.json', LIVE_SITE) : new URL('../versions.json', window.location.href))
      .then((r) => (r.ok ? r.json() : []))
      .then((v: PrototypeVersion[]) => {
        const list = Array.isArray(v) ? v : [];
        setVersions(local ? [LOCAL, ...list] : list);
      })
      //  Offline, or the site is down: the local preview still names itself.
      .catch(() => setVersions(local ? [LOCAL] : []));
  }, []);
  return versions;
}

/**
 * Open another version — its folder beside this one. From the local preview
 * it opens on the live site in a NEW TAB, so the working copy, and any state
 * built up in it, stays where it is.
 */
export function openVersion(id: string) {
  if (CURRENT_VERSION === 'local') {
    window.open(new URL(`${id}/`, LIVE_SITE).toString(), '_blank', 'noopener');
    return;
  }
  window.location.href = new URL(`../${id}/`, window.location.href).toString();
}
