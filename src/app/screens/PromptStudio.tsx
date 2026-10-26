import { useState } from 'react';
import {
  AppShell,
  Button,
  Checkbox,
  InputField,
  Inline,
  Stack,
  Surface,
  Text,
  Textarea,
  Toggle,
  TopBar,
} from '@canon';
import { BAR_ACTIONS, HISTORY_MARK } from '../data/books';

const promptIdeas = ['Landing page', 'Case study', 'Product launch', 'Mobile flow', 'Dashboard'];
const uploadedDocs = ['brief.pdf', 'moodboard.png', 'brand-guide.docx'];

export function PromptStudio() {
  const [manualMode, setManualMode] = useState(true);
  const [prompt, setPrompt] = useState(
    'Design a clean product screen for a prompt-to-screen builder. Let the user drop prompts, files, docs, and image references, then generate a polished layout with a manual review step before finalizing.'
  );
  const [pageTitle, setPageTitle] = useState('Prompt studio');
  const [primaryCta, setPrimaryCta] = useState('Create screen');

  return (
    <AppShell
      nav={(
        <Surface tone="default" border="default" radius="none" className="w-80 shrink-0 border-r">
          <Stack gap={3}>
            <Inline gap={3} align="center" className="border-b px-4 py-3">
              <Surface tone="default" radius="lg" className="flex h-9 w-9 items-center justify-center bg-primary-default text-2xl font-black leading-none text-text-on-primary">
                S
              </Surface>
              <Text size="body-lg" weight="semibold">Storybook</Text>
            </Inline>

            <Surface tone="default" border="default" radius="lg" className="mx-4 mt-3 px-3 py-2">
              <Inline gap={2} align="center">
                <Text size="body-sm" tone="secondary">⌕</Text>
                <Text size="body-sm" tone="secondary">Press "/" to search...</Text>
              </Inline>
            </Surface>

            <Stack gap={2} className="px-2 pb-3">
              {['Prompt space', 'Prompt ideas', 'Files & docs', 'Image refs'].map((item, index) => (
                <Button
                  key={item}
                  type="button"
                  emphasis={index === 0 ? 'primary' : 'secondary'}
                  intent={index === 0 ? 'default' : 'default'}
                  size="sm"
                  onClick={() => {}}
                  className="w-full justify-between"
                >
                  {item}
                </Button>
              ))}
            </Stack>

            <Surface tone="default" border="default" radius="lg" className="mx-3 mb-3 mt-auto px-3 py-2">
              <Inline justify="between" align="center">
                <Text size="body-sm" weight="medium">Manual mode</Text>
                <Toggle checked={manualMode} onCheckedChange={setManualMode} label="Manual mode" />
              </Inline>
            </Surface>
          </Stack>
        </Surface>
      )}
      topBar={(
        <TopBar
          leading={[{ id: 'recent', label: 'Recent activity', icon: HISTORY_MARK, onSelect: () => {} }]}
          search={{
            scope: 'Canvas',
            value: '',
            onValueChange: () => {},
            onSubmit: () => {},
            onScopeOpen: () => {},
          }}
          org={{ name: 'Storybook', onOpen: () => {} }}
          actions={BAR_ACTIONS}
          account={{ name: 'Aisha', initials: 'AS', onOpen: () => {} }}
          apps={{ onOpen: () => {} }}
        />
      )}
    >
      <Stack className="h-full min-h-0">
        <Surface tone="default" border="default" radius="none" className="border-b">
          <Inline gap={3} align="center" className="px-4 py-3">
            <Button size="sm" emphasis="secondary" intent="default">Canvas</Button>
            <Button size="sm" emphasis="secondary" intent="default">Docs</Button>
            <Inline gap={2} className="ml-auto">
              <Button size="sm" emphasis="secondary" intent="default">Refresh</Button>
              <Button size="sm" emphasis="secondary" intent="default">Share</Button>
              <Button size="sm" emphasis="secondary" intent="default">Preview</Button>
            </Inline>
          </Inline>
        </Surface>

        <Inline className="h-full min-h-0 w-full" align="stretch">
          <Stack grow className="min-h-0 flex-1 p-6">
            <Inline gap={2} className="mb-4 flex-wrap">
              {promptIdeas.map((item) => (
                <Button key={item} size="sm" emphasis="secondary" intent="default" onClick={() => setPrompt(`${item}: ${prompt}`)}>
                  {item}
                </Button>
              ))}
            </Inline>

            <Surface tone="default" border="default" radius="card" pad={4} className="mb-4 min-h-44">
              <Textarea
                rows={7}
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
              />
            </Surface>

            <Inline gap={2} className="mb-4 flex-wrap">
              {uploadedDocs.map((file) => (
                <Surface key={file} tone="sunken" border="default" radius="lg" className="px-2.5 py-1.5">
                  <Text size="body-sm" tone="secondary">{file}</Text>
                </Surface>
              ))}
            </Inline>

            <Inline gap={4} align="stretch" className="w-full">
              <Surface tone="default" border="default" radius="card" pad={5} className="flex-1">
                <Stack gap={4}>
                  <Text size="body-sm" weight="medium" tone="secondary">Preview</Text>
                  <Surface tone="sunken" border="default" radius="xl" className="p-6">
                    <Inline justify="between" align="center" className="mb-6 w-full">
                      <Text size="body-lg" weight="semibold">{pageTitle}</Text>
                      <Inline gap={2} align="center">
                        <Surface tone="default" radius="full" className="h-2.5 w-2.5 bg-success-default" />
                        <Text size="body-sm" tone="secondary">Ready</Text>
                      </Inline>
                    </Inline>

                    <Inline gap={4} align="center" className="mb-5 w-full">
                      <Surface tone="default" radius="lg" className="h-12 w-12 bg-primary-default" />
                      <Stack gap={1} className="flex-1">
                        <Surface tone="default" border="default" radius="full" className="h-3 w-24" />
                        <Surface tone="default" border="default" radius="full" className="h-3 w-32" />
                      </Stack>
                    </Inline>

                    <Surface tone="default" border="default" radius="2xl" className="mb-5 h-52 p-4">
                      <Inline align="center" justify="center" className="h-full w-full rounded-xl border border-dashed border-border-default text-text-secondary">
                        <Text tone="secondary">Product mockup</Text>
                      </Inline>
                    </Surface>

                    <Inline justify="between" align="center" className="w-full gap-3">
                      <Stack gap={1} className="flex-1">
                        <Surface tone="default" border="default" radius="full" className="h-3 w-24" />
                        <Surface tone="default" border="default" radius="full" className="h-3 w-40" />
                      </Stack>
                      <Button emphasis="primary" intent="default">{primaryCta}</Button>
                    </Inline>
                  </Surface>
                </Stack>
              </Surface>

              <Surface tone="default" border="default" radius="card" pad={5} className="flex-1">
                <Stack gap={4}>
                  <Text size="body-sm" weight="medium" tone="secondary">Design brief</Text>
                  <Stack gap={3}>
                    {[
                      { label: 'Screens', value: '12' },
                      { label: 'Assets', value: '4' },
                      { label: 'Ideas', value: '26' },
                    ].map((stat) => (
                      <Inline key={stat.label} justify="between" align="center" className="rounded-xl border border-border-default bg-surface-sunken px-3 py-2">
                        <Text size="body-sm" tone="secondary">{stat.label}</Text>
                        <Text size="body-sm" weight="semibold">{stat.value}</Text>
                      </Inline>
                    ))}
                  </Stack>

                  <Stack gap={3}>
                    <Text size="body-sm" weight="medium">Theme</Text>
                    <Inline gap={2}>
                      {['bg-primary-default', 'bg-danger-default', 'bg-success-default', 'bg-warning-default'].map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`h-7 w-7 rounded-full border-2 border-transparent ${color}`}
                          aria-label="Choose accent color"
                        />
                      ))}
                    </Inline>
                  </Stack>

                  <Checkbox
                    selection={manualMode ? 'checked' : 'unchecked'}
                    onSelectionChange={(next) => setManualMode(next === 'checked')}
                    label="Manual review before finalizing"
                  />
                </Stack>
              </Surface>
            </Inline>
          </Stack>

          {manualMode && (
            <Surface tone="default" border="default" radius="none" className="w-96 border-l">
              <Stack gap={4} className="h-full p-5">
                <Inline justify="between" align="center">
                  <Text size="body-lg" weight="semibold">Manual tweaks</Text>
                  <Button size="sm" emphasis="secondary" intent="default">Close</Button>
                </Inline>

                <Stack gap={2}>
                  <Text size="body-sm" tone="secondary">Page title</Text>
                  <InputField value={pageTitle} onChange={(event) => setPageTitle(event.target.value)} />
                </Stack>

                <Stack gap={2}>
                  <Text size="body-sm" tone="secondary">Primary CTA</Text>
                  <InputField value={primaryCta} onChange={(event) => setPrimaryCta(event.target.value)} />
                </Stack>

                <Stack gap={2}>
                  <Text size="body-sm" tone="secondary">Screen objective</Text>
                  <Textarea rows={5} value={prompt} onChange={(event) => setPrompt(event.target.value)} />
                </Stack>

                <Inline gap={2} className="mt-auto">
                  <Button emphasis="secondary" intent="default" className="flex-1">Save draft</Button>
                  <Button emphasis="primary" intent="default" className="flex-1">Finalise</Button>
                </Inline>
              </Stack>
            </Surface>
          )}
        </Inline>
      </Stack>
    </AppShell>
  );
}
