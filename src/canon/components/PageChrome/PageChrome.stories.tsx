import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { PageChrome } from './PageChrome';
import { ActionBar } from '../ActionBar/ActionBar';
import { PageHeader } from '../PageHeader/PageHeader';
import { Checkbox } from '../Checkbox/Checkbox';
import { Stack, Surface, Text } from '../../primitives';

/**
 * `zf-action-bar.md` §12 — *"the first component that cannot be specified
 * without saying something about the page around it. Everything before it — a
 * button, a menu, a table — is a thing you place. This is a thing that
 * **replaces** another thing, and the replacement has a size."*
 */
const meta = {
  title: 'Components/PageChrome', component: PageChrome,
  parameters: { layout: 'fullscreen' },
  args: { children: null },
} satisfies Meta<typeof PageChrome>;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * **TICK THE BOX.** Three things to watch, and each is one of §12's rules.
 *
 * **Nothing below moves.** The header is 64 and the bar is 48, in one cell with
 * a fixed block-size equal to the taller. Without it the content jumps 16px on
 * the first click and back on the last — under the pointer that just clicked.
 *
 * **The header keeps its state.** Open the view switcher, then tick the box,
 * then untick it: the header is `hidden`, never unmounted, so the switcher, a
 * half-typed search and a scroll position all survive. Unmounting throws them
 * away after every bulk action.
 *
 * **Focus does not move.** Tick the box and press Tab — the next stop is what
 * follows the checkbox, not the bar. Moving focus on a value change is a
 * **3.2.2** failure: the user changed a value, they did not request a context
 * change. §7 calls it the most common bug in this pattern, and it fires on every
 * checkbox click.
 *
 * That last one is enforced by omission — there is no `autoFocus` in the
 * component and there must never be one. It is the easiest thing in the file to
 * "improve".
 */
export const Swap: Story = {
  render: function SwapStory() {
    const [picked, setPicked] = useState(0);
    const [menu, setMenu] = useState(false);
    return (
      <div className="bg-surface-canvas min-h-dvh">
        <PageChrome
          bar={picked > 0 ? (
            <ActionBar
              count={picked} total={3}
              primary={{ id: 'bulk', label: 'Bulk Update', onSelect: () => {} }}
              iconActions={[
                { id: 'mail', label: 'Email selected', icon: 'mail', onSelect: () => {} },
                { id: 'print', label: 'Print selected', icon: 'print', onSelect: () => {} },
              ]}
              actions={[
                { id: 'bill', label: 'Convert to bill', onSelect: () => {} },
                { id: 'issued', label: 'Mark as Issued', onSelect: () => {} },
              ]}
              onClear={() => setPicked(0)}
            />
          ) : undefined}
        >
          <PageHeader
            type="list" title="All Purchase Orders"
            views={[{ id: 'all', label: 'All Purchase Orders' }, { id: 'due', label: 'Overdue' }]}
            onViewChange={() => {}} viewMenuOpen={menu}
            onViewMenuToggle={() => setMenu((o) => !o)}
            cta={{ label: 'New', icon: 'plus', onSelect: () => {} }}
          />
        </PageChrome>

        <Surface pad={10} className="m-10" border="default">
          <Stack gap={6}>
            <Text tone="secondary">Nothing here moves when the bar appears.</Text>
            {[0, 1, 2].map((i) => (
              <Checkbox
                key={i}
                selection={i < picked ? 'checked' : 'unchecked'}
                label={`Row ${i + 1}`}
                onSelectionChange={(s) => setPicked(s === 'checked' ? i + 1 : i)}
              />
            ))}
          </Stack>
        </Surface>
      </div>
    );
  },
};
