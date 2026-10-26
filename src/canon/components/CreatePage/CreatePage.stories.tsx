import type { Meta, StoryObj } from '@storybook/react-vite';
import { CreatePage } from './CreatePage';
import { FormSection } from '../FormSection/FormSection';
import { FormRow } from '../FormRow/FormRow';
import { InputField } from '../InputField/InputField';
import { Button } from '../Button/Button';
import { PageHeader } from '../PageHeader/PageHeader';
import { Stack } from '../../primitives';

/**
 * §2 — the scrolling body and the action footer.
 *
 * **The body is the only scroller**, which is the whole reason this is a
 * component: the header stays, the footer stays, and the form moves between
 * them. A page that scrolls as a whole puts Save below the fold on every long
 * form — the one control the user is trying to reach.
 *
 * The grid lives here: `px-10` and **no gutter**, because the 30px input inset
 * and the slack column do all the separating. A column is a pure twelfth of the
 * content box, so the arithmetic is `(W − 40) / 12` and adding a gutter would
 * change every number in §2's table.
 */
const meta = {
  title: 'Components/CreatePage', component: CreatePage,
  parameters: { layout: 'fullscreen' },
  args: { children: null, footer: null },
} satisfies Meta<typeof CreatePage>;
export default meta;
type Story = StoryObj<typeof meta>;

const input = (ph: string) => ({ id, required }: { id: string; required: boolean }) => (
  <InputField id={id} required={required} aria-required={required || undefined} placeholder={ph} />
);

export const Default: Story = {
  render: () => (
    <div className="flex flex-col h-dvh bg-surface-default">
      <PageHeader type="create" title="New Purchase Agreement" />
      <CreatePage
        footer={(
          <>
            <Button onClick={() => {}}>Save</Button>
            <Button emphasis="secondary" onClick={() => {}}>Cancel</Button>
          </>
        )}
      >
        <Stack gap={16}>
          <FormSection
            trailing={(
              <>
                <FormRow label="Agreement Type" required>{input('Select a type')}</FormRow>
                <FormRow label="Reference#">{input('Optional')}</FormRow>
              </>
            )}
          >
            <FormRow label="Vendor" required>{input('Select a vendor')}</FormRow>
            <FormRow label="Agreement Name" required>{input('Name this agreement')}</FormRow>
          </FormSection>

          <FormSection
            last
            trailing={<FormRow label="End Date">{input('DD/MM/YYYY')}</FormRow>}
          >
            <FormRow label="Start Date" required>{input('DD/MM/YYYY')}</FormRow>
            {/* enough rows to prove the body scrolls and the footer does not */}
            {Array.from({ length: 8 }, (_, n) => (
              <FormRow key={n} label={`Extra field ${n + 1}`}>{input('…')}</FormRow>
            ))}
          </FormSection>
        </Stack>
      </CreatePage>
    </div>
  ),
};

export const Dark: Story = {
  render: () => (
    <div data-theme="dark" className="flex flex-col h-dvh bg-surface-default">
      <PageHeader type="create" title="New Purchase Agreement" />
      <CreatePage
        footer={(
          <>
            <Button onClick={() => {}}>Save</Button>
            <Button emphasis="secondary" onClick={() => {}}>Cancel</Button>
          </>
        )}
      >
        <FormSection last trailing={<FormRow label="Agreement Type">{input('Select')}</FormRow>}>
          <FormRow label="Vendor" required>{input('Select a vendor')}</FormRow>
        </FormSection>
      </CreatePage>
    </div>
  ),
};
