import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Select } from './Select';
import { FormRow } from '../FormRow/FormRow';
import { InputField } from '../InputField/InputField';
import { Stack, Text } from '../../primitives';

/**
 * Choose one value from a list. **No md on disk** — built to the ARIA
 * `combobox`-with-`listbox` pattern and drawn as an `InputField`, so a select
 * and a text field on the same form row are the same 34px box with the same
 * border, radius and ring. Nothing here is measured twice.
 *
 * **Not a `Menu`**: a menu is a list of commands, a select is a list of values
 * and one of them is currently true — `role="listbox"` with `aria-selected`,
 * not `menuitem`. It reuses `MENU_SURFACE` so the panel is the same paper.
 *
 * **Not a native `<select>`**: the options are painted by the OS and cannot be
 * made to match the field beside them. The cost is writing out every keyboard
 * behaviour, which is what most of the component is.
 */
const meta = {
  title: 'Components/Select', component: Select,
  parameters: { layout: 'padded' },
  args: { options: [], value: '', onChange: () => {} },
} satisfies Meta<typeof Select>;
export default meta;
type Story = StoryObj<typeof meta>;

const VENDORS = [
  { value: 'kaveri', label: 'Kaveri Logistics' },
  { value: 'meridian', label: 'Meridian Textiles' },
  { value: 'anantha', label: 'Anantha Foods' },
  { value: 'bharat', label: 'Bharat Pharma' },
  { value: 'konark', label: 'Konark Ceramics', disabled: true },
  { value: 'nilgiri', label: 'Nilgiri Retail' },
];

function One(props: { value?: string; disabled?: boolean; error?: boolean }) {
  const [v, setV] = useState(props.value ?? '');
  return (
    <div className="max-w-xs">
      <Select
        options={VENDORS} value={v} onChange={setV} placeholder="Select a vendor"
        ariaLabel="Vendor" disabled={props.disabled} error={props.error}
      />
    </div>
  );
}

export const Empty: Story = { render: () => <One /> };
export const Chosen: Story = { render: () => <One value="meridian" /> };

/**
 * **Try the keyboard, which is the whole component.** Closed: ↓ ↑ change the
 * value in place the way a native select does; Enter, Space or Alt+↓ open it.
 * Open: ↓ ↑ Home End move, Enter or Space commits, and **Escape restores the
 * value it opened with** — a cancel that leaves the changed value behind is not
 * a cancel. Focus never leaves the trigger.
 */
export const Keyboard: Story = { render: () => <One value="kaveri" /> };

/** A disabled option is announced and skipped by the arrows, never focused. */
export const States: Story = {
  render: () => (
    <Stack gap={8}>
      <One />
      <One value="anantha" error />
      <One value="anantha" disabled />
    </Stack>
  ),
};

/**
 * The point of matching `InputField` to the class: on a form row, a select and a
 * text field are indistinguishable except for the caret.
 */
export const InAFormRow: Story = {
  render: function Render() {
    const [vendor, setVendor] = useState('');
    return (
      <div className="max-w-2xl">
        <Stack gap={12}>
          <FormRow label="Agreement Name" required>
            {({ id, required }) => (
              <InputField id={id} required={required} aria-required={required} placeholder="Name it" />
            )}
          </FormRow>
          <FormRow label="Vendor" required>
            {({ id, required }) => (
              <Select id={id} required={required} options={VENDORS} value={vendor}
                onChange={setVendor} placeholder="Select a vendor" />
            )}
          </FormRow>
        </Stack>
      </div>
    );
  },
};

export const Dark: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div data-theme="dark" className="bg-surface-default p-10">
      <Stack gap={6}>
        <Text size="overline" tone="secondary">dark</Text>
        <One value="meridian" />
      </Stack>
    </div>
  ),
};
