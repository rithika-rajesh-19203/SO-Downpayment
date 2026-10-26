import type { StorybookConfig } from '@storybook/react-vite';

/**
 * THE CANON — the browsable, reviewable form of the design system.
 *
 * Stories live beside their components, so a component without a story simply
 * does not appear here. That is deliberate: an unreviewable component is not a
 * canon component.
 *
 * `_incoming` is included on purpose — it is where proposed components get
 * reviewed in isolation before being admitted.
 */
const config: StorybookConfig = {
  stories: [
    '../docs/**/*.mdx',
    '../src/canon/**/*.stories.@(ts|tsx)',
  ],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: '@storybook/react-vite',

  /**
   * Explicit, rather than relying on Storybook's default. If `public/` were not
   * served here, every brand asset would render broken in the canon while
   * looking fine in the app — and that exact gap between the two surfaces is
   * what this repo exists to prevent.
   */
  staticDirs: ['../public'],
};

export default config;
