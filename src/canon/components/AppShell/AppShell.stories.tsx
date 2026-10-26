import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { AppShell } from './AppShell';
import { Nav } from '../Nav/Nav';
import type { NavNode } from '../Nav/Nav';
import { TopBar } from '../TopBar/TopBar';
import { PageHeader } from '../PageHeader/PageHeader';
import { Stack, Surface, Text } from '../../primitives';

/**
 * The shell is three slots and four decisions. It composes nothing itself —
 * pass it a `<Nav>`, a `<TopBar>` and a page — which is what keeps it from
 * growing a copy of either component's API.
 *
 * **The rail is the bar's sibling.** `zf-top-bar.md` §3.1 notes that the bar's
 * `20 + 200` brand column is exactly the rail's 220, and §11 decision 4 asks for
 * that to be *recorded*, because "it is two numbers in two files that agree by
 * intent and nothing enforces it". Beside rather than over enforces it: there is
 * no 220 to keep in sync. `nav/brand-surface` and `chrome/surface` are the same
 * `blue/2000` so the seam does not show, and the bar has no bottom stroke so
 * both dark regions end on one line.
 *
 * **The `<main>` is the shell's, not the screen's.** A bare `<header>` maps to
 * `role="banner"`; `zf-page-header.md` §9.1 measured three page headers shipped
 * without a scoping ancestor producing **three banner landmarks**, against a
 * document that already has one. Owning `<main>` here means getting it right
 * once instead of on every screen forever.
 *
 * **One scroll container, and it is the body.** The rail scrolls its own list,
 * the bar is sticky in the content column, the page scrolls under both.
 *
 * **A skip link** — WCAG 2.4.1. The rail is ~20 rows on every page, so without
 * one a keyboard user tabs the whole navigation before reaching content, every
 * time. Nothing in Figma can express it.
 */
const meta = {
  title: 'Components/AppShell', component: AppShell,
  parameters: { layout: 'fullscreen' },
  args: { nav: null, topBar: null, children: null },
} satisfies Meta<typeof AppShell>;
export default meta;
type Story = StoryObj<typeof meta>;

const MARK = (
  <svg viewBox="0 0 24 24" aria-hidden focusable="false" fill="currentColor" className="size-12">
    <path d="M4 3h13a4 4 0 0 1 4 4v14H8a4 4 0 0 1-4-4V3Zm2 2v12a2 2 0 0 0 2 2h11V7a2 2 0 0 0-2-2H6Z" />
  </svg>
);

const ITEMS: NavNode[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  {
    id: 'sales', label: 'Sales', icon: 'sales',
    children: [
      { id: 'customers', label: 'Customers' },
      { id: 'invoices', label: 'Invoices' },
    ],
  },
  {
    id: 'purchases', label: 'Purchases', icon: 'purchases',
    children: [{ id: 'bills', label: 'Bills' }],
  },
  { id: 'reports', label: 'Reports', icon: 'reports' },
];

/**
 * **THE SHELL, assembled.**
 *
 * Four things to try, in this order:
 *
 * 1. **Press Tab once.** The skip link appears at the top-left and jumps past
 *    the rail. It is the first tab stop in the document and the only reason
 *    2.4.1 passes.
 * 2. **Look at the seam** where the rail's dark brand band meets the bar. One
 *    strip, one colour, both ending on the same line — that is open item 31,
 *    closed, plus the bar's stroke removed.
 * 3. **Scroll the body.** The page header goes with it (§7: it is about the
 *    current page). The bar and the rail do not.
 * 4. **Collapse the rail.** The bar's left edge follows it, because the bar
 *    starts where the rail ends rather than at a hardcoded 220.
 */
export const Default: Story = {
  render: function ShellStory() {
    const [collapsed, setCollapsed] = useState(false);
    const [current, setCurrent] = useState('invoices');
    const [q, setQ] = useState('');
    const [menu, setMenu] = useState(false);
    return (
      <AppShell
        nav={(
          <Nav items={ITEMS} currentId={current} onNavigate={setCurrent}
            collapsed={collapsed} onCollapsedChange={setCollapsed}
            product={{ name: 'Books', mark: MARK }} />
        )}
        topBar={(
          <TopBar
            search={{ scope: 'Invoices', value: q, onValueChange: setQ,
              onSubmit: () => {}, onScopeOpen: () => {} }}
            org={{ name: 'Meedium', onOpen: () => {} }}
            actions={[
              { id: 'new', label: 'Create new', icon: 'plus', filled: true, onSelect: () => {} },
              { id: 'bell', label: 'Notifications', icon: 'bell', count: 3, onSelect: () => {} },
            ]}
            account={{ name: 'Jenner Dopeson', initials: 'JD', onOpen: () => {} }}
            apps={{ onOpen: () => {} }}
          />
        )}
      >
        <PageHeader
          type="list" title="All Invoices"
          views={[{ id: 'all', label: 'All Invoices' }, { id: 'due', label: 'Overdue' }]}
          onViewChange={() => {}} viewMenuOpen={menu}
          onViewMenuToggle={() => setMenu((o) => !o)}
          cta={{ label: 'New', icon: 'plus', onSelect: () => {} }}
        />
        <Stack gap={8} className="p-10">
          {Array.from({ length: 8 }, (_, i) => (
            <Surface key={i} pad={10} border="default">
              <Text tone="secondary">Row {i + 1} — the body scrolls, the chrome does not.</Text>
            </Surface>
          ))}
        </Stack>
      </AppShell>
    );
  },
};

/**
 * **EMPTY SLOTS.**
 *
 * No rail and no bar. The body still fills the viewport, still scrolls, and
 * still has its `<main>` and its skip link — which is the test that the shell
 * is geometry rather than an assembly of two specific components. A print view
 * or an onboarding flow uses exactly this.
 */
export const BodyOnly: Story = {
  render: () => (
    <AppShell nav={null} topBar={null}>
      <Stack gap={8} className="p-10">
        <Text size="title">No rail, no bar</Text>
        <Text tone="secondary">The shell is slots, so both are optional.</Text>
      </Stack>
    </AppShell>
  ),
};
