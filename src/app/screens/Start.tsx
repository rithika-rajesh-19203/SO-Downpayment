import { Icon, Inline, Stack, Surface, Text, registry } from '@canon';

/**
 * Placeholder screen — it exists so the application surface is runnable from
 * day one, and it doubles as proof of the rule: every element below comes from
 * '@canon'. There is no CSS, no hex value and no bare styled markup here.
 *
 * Delete it once the first real screen exists.
 */
export function Start() {
  const steps: Array<[string, string, string]> = [
    ['1', 'Export the icon geometry', '31 of the 51 roster glyphs render a dashed placeholder. Drop the SVGs into design-refs/icons/ and run npm run icons:sync — no registry entry, no new export, no component change.'],
    ['2', 'Settle the blocking decisions', 'docs/BACKLOG.md — the neutral ramp is the big one: it jumps from 2.85:1 to 4.52:1, so no border-only state in the system can reach 1.4.11’s 3:1.'],
    ['3', 'Write the six missing contract files', 'design-refs/ holds the md for every component built except six. A component whose contract is not on disk cannot be re-derived when Figma changes.'],
    ['4', 'Build the rest, one at a time', 'src/canon/_incoming/<Name>/, review at localhost:6006, then promote. 22 admitted; Table, Banner, Popover, PopupModal and the two pickers are queued.'],
  ];

  return (
    <Stack gap={16} className="mx-auto max-w-3xl p-10">
      <Stack gap={2}>
        <Text size="overline" tone="tertiary">ZF DESIGN CANNON</Text>
        <Text size="title">The application surface is live.</Text>
        <Text size="body" tone="secondary">
          This screen is built from canon components only — no styling decisions live here.
        </Text>
      </Stack>

      <Surface pad={10} radius="lg" border="divider" elevation="raised">
        <Stack gap={8}>
          <Inline justify="between" align="baseline">
            <Text size="subheading">In the canon</Text>
            <Text size="caption" tone="tertiary">{registry.length} admitted</Text>
          </Inline>
          <Stack gap={4}>
            {registry.map((c) => (
              <Inline key={c.name} gap={6} justify="between" align="baseline">
                <Text size="body" weight="medium">{c.name}</Text>
                <Text size="body-sm" tone="secondary" truncate>{c.use}</Text>
              </Inline>
            ))}
          </Stack>
          <Text size="body-sm" tone="tertiary">
            Foundations only. The 24 components specified in the design cannon arrive one at
            a time, each reviewed in isolation before it is admitted.
          </Text>
        </Stack>
      </Surface>

      <Stack gap={6}>
        <Text size="label" tone="secondary">Next steps</Text>
        {steps.map(([n, title, detail]) => (
          <Surface key={n} tone="sunken" pad={6} radius="md">
            <Inline gap={6} align="start">
              <Text size="caption" tone="tertiary">{n}</Text>
              <Stack gap={1}>
                <Text size="body" weight="medium">{title}</Text>
                <Text size="body-sm" tone="secondary">{detail}</Text>
              </Stack>
            </Inline>
          </Surface>
        ))}
      </Stack>

      <Inline gap={2} align="center">
        <Icon name="chevron-right" size="sm" tone="subtle" />
        <Text size="caption" tone="tertiary">
          docs/WORKFLOW.md — the two loops. docs/BACKLOG.md — the build queue.
        </Text>
      </Inline>
    </Stack>
  );
}
