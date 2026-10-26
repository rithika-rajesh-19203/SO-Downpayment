import data from './registry.json';
import type { ComponentSpec } from './types';

/**
 * Typed view of registry.json — the canon's index.
 *
 * Read this FIRST when building a screen. It is the authoritative answer to
 * "what already exists?", and the thing that stops a second Badge being
 * invented when one is already admitted.
 */
export const registry = data.components as unknown as ComponentSpec[];

export const stableComponents = registry.filter((c) => c.status === 'stable');
export const incomingComponents = registry.filter((c) => c.status === 'incoming');

export function findComponent(name: string): ComponentSpec | undefined {
  return registry.find((c) => c.name === name);
}
