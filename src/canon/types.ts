/**
 * The shape of a registry entry.
 *
 * Note: registry.json is JSON so plain node tooling can read it without a build
 * step, and TypeScript widens JSON string literals — so it cannot verify
 * `category` / `status` here. That verification lives in
 * scripts/check-boundaries.mjs (`invalid-registry-entry`), which runs as part of
 * `npm run check`. A typo like "stabel" still fails, just one layer out.
 */

export type ComponentStatus =
  /** Admitted to the canon. Exported from '@canon', safe for screens. */
  | 'stable'
  /** Proposed. Lives in _incoming/, reviewable in the canon, NOT importable by screens. */
  | 'incoming'
  /** Being retired. Still exported, but no new usage. */
  | 'deprecated';

export type ComponentCategory =
  | 'primitive'      // layout & typography: Stack, Inline, Text, Surface
  | 'form'           // anything that takes input
  | 'action'         // buttons, menus, links
  | 'data-display'   // badges, avatars, tables, tags
  | 'navigation'     // rails, tabs, breadcrumbs
  | 'feedback'       // toasts, banners, empty states, skeletons
  | 'overlay'        // modals, drawers, popovers, tooltips
  | 'pattern';       // composed blocks: PageHeader, TableToolbar

export interface ComponentSpec {
  /** Exported symbol name. Must match the export from '@canon' exactly. */
  name: string;
  category: ComponentCategory;
  status: ComponentStatus;
  /** One line: when a screen should reach for this. Written for someone who has never seen it. */
  use: string;
  /** Prop name -> allowed variants, or a prose description of the type. */
  props?: Record<string, string[] | string>;
  /** Where the design came from — a Figma node, a file in design-refs/, etc. */
  source?: string;
  /** Point at what to use instead. Required when status is 'deprecated'. */
  replacedBy?: string;
}
