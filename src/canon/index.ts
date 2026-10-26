/* ============================================================================
   THE PUBLIC API OF THE ZF DESIGN CANNON.
   ----------------------------------------------------------------------------
   src/app/** may import from '@canon' and from nothing else. Deep imports such
   as '@canon/components/Button/Button' are rejected by
   scripts/check-boundaries.mjs.

   Consequence: every component's internals — file layout, class names, even
   which library it wraps — can be refactored without touching a single screen.

   RULES FOR THIS FILE
   1. Only `stable` components appear here. Anything in _incoming/ must NOT be
      exported, or screens could consume an unapproved component.
   2. Every export here needs a matching entry in registry.json. The boundary
      check fails on any mismatch in either direction.
   ========================================================================= */

/* ── Primitives ───────────────────────────────────────────────────────────── */
export { Stack, Inline, Text, Surface } from './primitives';
export type {
  StackProps, InlineProps, TextProps, SurfaceProps,
  TextSize, TextWeight, TextTone, Gap,
} from './primitives';

/* ── Icons ────────────────────────────────────────────────────────────────── */
export { Icon } from './icons';
export type { IconProps, IconName } from './icons';

/* ── Components ───────────────────────────────────────────────────────────── */
//  Only the component is public. STATUS_FAMILIES and STATUS_BADGE_STATUSES stay
//  internal: rule 5 requires a registry entry per '@canon' export, and neither is
//  a component. Stories import them directly from the folder. If a screen ever
//  needs a status legend, that is the moment to decide how the list is surfaced —
//  not now, on a guess.
export { DescriptionList } from './components/DescriptionList/DescriptionList';
export type { DescriptionListProps, DescriptionListItem } from './components/DescriptionList/DescriptionList';
export { Banner } from './components/Banner/Banner';
export type { BannerProps } from './components/Banner/Banner';
export { StatusBadge } from './components/StatusBadge/StatusBadge';
export type { StatusBadgeProps, StatusBadgeStatus, StatusBadgeEmphasis } from './components/StatusBadge/StatusBadge';

/* ── Action ───────────────────────────────────────────────────────────────── */
export { Button } from './components/Button/Button';
export type { ButtonProps, ButtonIntent, ButtonEmphasis, ButtonSize } from './components/Button/Button';
export { Pill } from './components/Pill/Pill';
export type { PillProps } from './components/Pill/Pill';

/* ── Form ─────────────────────────────────────────────────────────────────── */
export { Field } from './components/Field/Field';
export type { FieldProps } from './components/Field/Field';
//  `filterByFormat` is deliberately NOT re-exported here. The boundary check
//  requires every `@canon` export to be a registry entry, and it is a helper,
//  not a component — the registry would be describing a function as something
//  reviewable in Storybook. `ProductTable` imports it by path, which is what a
//  sibling component should do anyway.
export { InputField } from './components/InputField/InputField';
export { Textarea } from './components/Textarea/Textarea';
export type { TextareaProps } from './components/Textarea/Textarea';
export type { InputFieldProps, InputFormat } from './components/InputField/InputField';
export { Radio } from './components/Radio/Radio';
export type { RadioProps } from './components/Radio/Radio';
export { Checkbox } from './components/Checkbox/Checkbox';
export type { CheckboxProps, CheckboxSelection } from './components/Checkbox/Checkbox';
export { Toggle } from './components/Toggle/Toggle';
export type { ToggleProps, ToggleSize } from './components/Toggle/Toggle';
export { Tabs } from './components/Tabs/Tabs';
export type { TabsProps, TabItem } from './components/Tabs/Tabs';
export { CreatePage } from './components/CreatePage/CreatePage';
export type { CreatePageProps } from './components/CreatePage/CreatePage';
export { FormSection } from './components/FormSection/FormSection';
export type { FormSectionProps } from './components/FormSection/FormSection';
export { FormRow } from './components/FormRow/FormRow';
export type { FormRowProps } from './components/FormRow/FormRow';
export { Select } from './components/Select/Select';
export type { SelectProps, SelectOption } from './components/Select/Select';
export { Divider } from './components/Divider/Divider';
export type { DividerProps } from './components/Divider/Divider';
export { Segmented } from './components/Segmented/Segmented';
export type { SegmentedProps, SegmentOption } from './components/Segmented/Segmented';
export { Stepper } from './components/Stepper/Stepper';
export type { StepperProps, StepperTone } from './components/Stepper/Stepper';

/* ── Data display ─────────────────────────────────────────────────────────── */
//  `AccordionItem` is public because `Accordion` takes children rather than an
//  items array — a screen cannot use one without the other. `AccordionNote`,
//  `SidePanelBody` and `WizardPanel` are not: they are body-slot placeholders
//  for the stories, and shipping a placeholder as API is how a design system
//  ends up owning someone else's empty state. Backlog decision 4. `StepperField`
//  and `NavFlyout` stay internal for the same shape of reason — `Field` already
//  labels a control, and a flyout is Nav's own overlay, not a component.
//  `avatarTint` is NOT exported. It is the hash `Avatar` derives its own colour
//  with, so a screen never needs it — and rule 5 wants a registry entry per
//  '@canon' export, which a hash function has no business having. Same call as
//  STATUS_FAMILIES above; the stories import it straight from the folder.
export { Avatar } from './components/Avatar/Avatar';
export type { AvatarProps, AvatarSize, AvatarTint } from './components/Avatar/Avatar';
export { ProductTable } from './components/ProductTable/ProductTable';
export type { ProductTableProps } from './components/ProductTable/ProductTable';
export type { ProductColumn, ProductRow, TotalRow, ProductCellKind } from './components/ProductTable/types';
export { ProductTotals } from './components/ProductTable/ProductTotals';
export type { ProductTotalsProps } from './components/ProductTable/ProductTotals';
export { SplitButton } from './components/SplitButton/SplitButton';
export type { SplitButtonProps } from './components/SplitButton/SplitButton';
export { Table } from './components/Table/Table';
export type { TableProps, TableColumn, TableSort } from './components/Table/Table';
export { Accordion, AccordionItem } from './components/Accordion/Accordion';
export type { AccordionProps, AccordionItemProps } from './components/Accordion/Accordion';

/* ── Navigation ───────────────────────────────────────────────────────────── */
export { ActionBar } from './components/ActionBar/ActionBar';
export type { ActionBarProps, ActionBarAction, ActionBarIconAction } from './components/ActionBar/ActionBar';
export { AppShell } from './components/AppShell/AppShell';
export type { AppShellProps } from './components/AppShell/AppShell';
export { Wizard } from './components/Wizard/Wizard';
export type { WizardProps, WizardOrientation, Step, StepState } from './components/Wizard/Wizard';
export { MiniList } from './components/MiniList/MiniList';
export type { MiniListProps, MiniListItem } from './components/MiniList/MiniList';
export { SplitView } from './components/SplitView/SplitView';
export type { SplitViewProps } from './components/SplitView/SplitView';
export { Nav } from './components/Nav/Nav';
export type { NavProps, NavNode } from './components/Nav/Nav';
export { TopBar } from './components/TopBar/TopBar';
export type { TopBarProps, TopBarAction } from './components/TopBar/TopBar';
export { PageChrome } from './components/PageChrome/PageChrome';
export type { PageChromeProps } from './components/PageChrome/PageChrome';
export { DetailsToolbar } from './components/DetailsToolbar/DetailsToolbar';
export type { DetailsToolbarProps, DetailsToolbarGroup, DetailsToolbarItem } from './components/DetailsToolbar/DetailsToolbar';
export { PageHeader } from './components/PageHeader/PageHeader';
export type { PageHeaderProps, HeaderAction, HeaderCta } from './components/PageHeader/PageHeader';

/* ── Overlay ──────────────────────────────────────────────────────────────── */
export { Modal } from './components/Modal/Modal';
export type { ModalProps, ModalWidth, ModalAction } from './components/Modal/Modal';
export { ColumnConfig } from './components/ColumnConfig/ColumnConfig';
export type { ColumnConfigProps, ColumnConfigItem } from './components/ColumnConfig/ColumnConfig';
export { Menu } from './components/Menu/Menu';
export type { MenuProps, MenuEntry, MenuItem } from './components/Menu/Menu';
export { SidePanel } from './components/SidePanel/SidePanel';
export type { SidePanelProps } from './components/SidePanel/SidePanel';

/* ── Registry (for tooling and docs, not for rendering) ───────────────────── */
export { registry, stableComponents, incomingComponents, findComponent } from './registry';
export type { ComponentSpec, ComponentStatus, ComponentCategory } from './types';
