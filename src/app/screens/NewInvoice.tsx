import { Button, CreatePage, PageHeader } from '@canon';

/**
 * SALES → INVOICES → NEW.
 *
 * The page, with **no fields yet**. `ZF-CREATE-PAGE.md`'s grid is built and
 * lives in the canon — `CreatePage` holds the 12 columns and the 20px margin,
 * `FormSection` is two halves of six, `FormRow` is the `2 + 3 + 1` inside a
 * half. `Components/CreatePage` in the canon shows all three composed.
 *
 * Adding the real fields is this file only, and it is two decisions per row:
 * which half it belongs in, and where in that half's order. **That order is
 * load-bearing** — DOM order is the tab order (2.4.3), so it runs left half top
 * to bottom, then right, and never column-interleaved.
 *
 * ```tsx
 * <Stack gap={16}>
 *   <FormSection trailing={<FormRow label="Invoice#" required>{field('number', 'INV-')}</FormRow>}>
 *     <FormRow label="Customer Name" required>{field('customer', 'Select a customer')}</FormRow>
 *   </FormSection>
 * </Stack>
 * ```
 */
export interface NewInvoiceProps {
  onCancel: () => void;
  onSave: () => void;
}

export function NewInvoice({ onCancel, onSave }: NewInvoiceProps) {
  return (
    <>
      <PageHeader type="create" title="New Invoice" />

      <CreatePage
        footer={(
          <>
            {/* Save FIRST — §7.1. Reading order carries more weight here than
                the platform convention it contradicts. */}
            <Button onClick={onSave}>Save</Button>
            <Button emphasis="secondary" onClick={onCancel}>Cancel</Button>
          </>
        )}
      >
        {null}
      </CreatePage>
    </>
  );
}
