import '../src/index.css';
import type { Preview } from '@storybook/react-vite';

/**
 * The canon loads the exact same stylesheet as the application, so the two
 * surfaces can never disagree about tokens, fonts or the reset.
 *
 * ── WHY THE TOOLBAR SWITCHES ARE NOT OPTIONAL ────────────────────────────────
 * md §2.9.9 is titled "Two fixes found only by looking at a dark canvas". Both
 * step components were INVISIBLE in Dark — near-black labels on no surface —
 * and every PNG export had hidden it, because a transparent component set
 * exports on transparent and renders as white. Every screenshot looked fine.
 *
 * §2.20.9 is the same lesson on the other axis: the Red brand failed WCAG 1.4.3
 * where Blue passed, because the hue swap changed the colour without checking
 * luminance — and nothing in a four-mode cross-product invites you to compare
 * two hues at the same pane.
 *
 * So both axes are switchable here, independently, exactly as the token layer
 * models them. Review every component in all four combinations before admitting
 * it.
 */
const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Pane lightness',
      defaultValue: 'light',
      toolbar: {
        title: 'Pane',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
    brand: {
      description: 'Brand hue — an axis independent of the pane',
      defaultValue: 'blue',
      toolbar: {
        title: 'Brand',
        icon: 'paintbrush',
        items: [
          { value: 'blue', title: 'Blue' },
          { value: 'red', title: 'Red' },
        ],
        dynamicTitle: true,
      },
    },
  },

  decorators: [
    (Story, context) => {
      const { theme, brand } = context.globals;
      const root = document.documentElement;
      root.setAttribute('data-theme', String(theme ?? 'light'));
      root.setAttribute('data-brand', String(brand ?? 'blue'));
      return Story();
    },
  ],

  parameters: {
    layout: 'centered',
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    a11y: { test: 'todo' },
    options: {
      storySort: {
        order: ['Foundations', 'Primitives', 'Components', 'Patterns', 'Incoming'],
      },
    },
  },
};

export default preview;
