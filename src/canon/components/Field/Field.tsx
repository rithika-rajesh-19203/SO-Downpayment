import { useId } from 'react';
import { InputField } from '../InputField/InputField';
import type { InputFieldProps } from '../InputField/InputField';
import { Stack, Text } from '../../primitives';
import { cn } from '../../utils/cn';

/**
 * FIELD — design-refs/zf-input-field.md, the `zf-field` half. **Use this one.**
 *
 * The whole field: label, required marker, input, help or error message. §1.1
 * explains why it exists — `Label` and `Help Text` were two loose instances of a
 * remote library sitting on the page, "not in the set, not composed with it. So
 * 'just a label and an input' was not something anyone could take from the
 * library; it was an assembly job, done from memory, with the gap guessed each
 * time."
 *
 * ── THE PART THAT CANNOT LIVE IN FIGMA ───────────────────────────────────────
 * §6: `aria-describedby` is what makes the error message reach a screen reader,
 * and `aria-invalid` is what makes the red border mean anything. Neither is
 * expressible in a component set — "which is the argument for `zf-field`
 * existing: the component's shape is what reminds a developer that a message and
 * a label belong to the input, not beside it."
 *
 * Here the shape does more than remind. `useId` generates the pair, and the
 * wiring is not optional because there is no way to render the message without
 * it.
 *
 * ── AN ERROR STATE CANNOT HIDE ITS MESSAGE ───────────────────────────────────
 * §2.1, and it is the sharpest decision in this md. On the five non-error
 * variants the message is driven by `Show Message`, default off. On the four
 * error variants the visibility reference is **deliberately absent** and the
 * node is permanently on, because a red border with no explanation fails
 * **WCAG 3.3.1 Error Identification**.
 *
 * Figma could only express that by deleting the reference. Here `showMessage` is
 * simply ignored when `error` is set — same guarantee, stated rather than
 * implied. A `message` is therefore required whenever `error` is.
 */
export interface FieldProps extends Omit<InputFieldProps, 'aria-describedby' | 'aria-required'> {
  label: string;
  /** Shows a `danger/default` asterisk, and sets `aria-required`. */
  required?: boolean;
  /** Help text, or the error text when `error` is set. */
  message?: string;
  /** Ignored when `error` is set — an error message is never optional (§2.1). */
  showMessage?: boolean;
  className?: string;
}

export function Field({
  label, required, message, showMessage, error, disabled, className, ...input
}: FieldProps) {
  const id = useId();
  const msgId = `${id}-msg`;

  //  §5: Disabled + error does not exist. Kept consistent with the box.
  const invalid = Boolean(error) && !disabled;
  //  §2.1: on error the message is not optional.
  const visible = Boolean(message) && (invalid || Boolean(showMessage));

  return (
    //  §2: the rows are space/2 (4px) apart.
    <Stack gap={2} className={cn('w-full', className)}>
      {/*
        §2's label row is space/1 (2px) — the asterisk sits tight to the word.
        It is `aria-hidden`: `aria-required` on the input is what announces the
        requirement, and a screen reader reading "asterisk" is noise.
      */}
      <label htmlFor={id} className="inline-flex items-baseline gap-1">
        {/*
          §2.2: the label is the same SIZE as the value and one weight heavier.
          "Same size keeps the vertical rhythm; the weight is what stops a label
          reading as content." The loose instance it replaces was 13 Regular —
          identical to value text, which is the confusion worth removing.
        */}
        <Text as="span" size="body" weight="medium" tone={disabled ? 'disabled' : 'default'}>
          {label}
        </Text>
        {required ? (
          <Text as="span" size="body" tone="danger" aria-hidden>*</Text>
        ) : null}
      </label>

      <InputField
        id={id}
        error={error}
        disabled={disabled}
        aria-required={required || undefined}
        aria-describedby={visible ? msgId : undefined}
        {...input}
      />

      {visible ? (
        //  §2.2: body-sm. `text/secondary` for help, `danger/text` for an error —
        //  7.04:1, and a different role from the border's `danger/default`
        //  because one is text and one is a boundary.
        <Text id={msgId} size="body-sm" tone={invalid ? 'danger' : 'secondary'}>
          {message}
        </Text>
      ) : null}
    </Stack>
  );
}
