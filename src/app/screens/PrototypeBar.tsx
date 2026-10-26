import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Banner, Button, Inline, Menu, Text } from '@canon';
import { CURRENT_VERSION, openVersion, useVersions } from '../data/versions';

/**
 * THE PROTOTYPE'S OWN CHROME — a slim strip above whichever product is showing,
 * holding the version dropdown and anything the screen adds (the portal's "who
 * you are" and its way back to Books).
 *
 * Info-toned and full-bleed so it never reads as part of the product under it.
 * It sits in `AppShell`'s top-bar slot, above Books' own bar.
 */
export function PrototypeBar({ children, trailing }: { children?: ReactNode; trailing?: ReactNode }) {
  const versions = useVersions();
  const ref = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  const current = versions.find((v) => v.id === CURRENT_VERSION);
  const label = CURRENT_VERSION === 'local' ? 'Local preview' : current?.label ?? CURRENT_VERSION;

  return (
    <Banner tone="info" className="flex-none rounded-none border-x-0 border-t-0">
      <Inline gap={6} align="center" justify="between" className="flex-1 min-w-0" wrap>
        <Inline gap={4} align="center" className="min-w-0">
          {children ?? <Text as="span" tone="inherit">SO Advance Payment · prototype</Text>}
        </Inline>
        <Inline gap={4} align="center">
          <Text as="span" size="body-sm" tone="inherit">Version</Text>
          <Button
            ref={ref}
            emphasis="secondary"
            size="sm"
            iconRight="caret-down"
            disabled={!versions.length}
            onClick={() => setOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={open}
          >
            {label}
          </Button>
          <Menu
            anchor={ref.current}
            open={open}
            onClose={() => setOpen(false)}
            label="Prototype versions"
            emphasis="strong"
            entries={versions.map((v) => ({
              id: v.id,
              label: [v.label, v.note, v.date].filter(Boolean).join(' · '),
              checked: v.id === CURRENT_VERSION,
              onSelect: () => { setOpen(false); if (v.id !== CURRENT_VERSION) openVersion(v.id); },
            }))}
          />
          {trailing}
        </Inline>
      </Inline>
    </Banner>
  );
}
