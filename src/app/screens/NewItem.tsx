import { useState } from 'react';
import {
  AppShell,
  Button,
  Checkbox,
  CreatePage,
  FormRow,
  FormSection,
  Icon,
  Inline,
  InputField,
  Nav,
  PageHeader,
  Radio,
  Segmented,
  Select,
  Stack,
  Surface,
  Text,
  TopBar,
} from '@canon';
import {
  BAR_ACTIONS,
  BOOKS_MARK,
  HISTORY_MARK,
  NAV_ITEMS,
  NAV_SECTIONS,
} from '../data/books';

function UploadCard({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <Surface tone="default" pad={10} radius="card" border="default" grow>
      <Stack gap={6} align="center" className="h-full justify-center text-center">
        <Text size="body" weight="medium" tone="secondary">{title}</Text>
        <Surface tone="sunken" pad={3} radius="full" border="default" className="grid place-items-center text-icon-default">
          <Icon name="upload" size="lg" tone="inherit" />
        </Surface>
        <Text size="body-sm" tone="tertiary" className="leading-relaxed">
          {subtitle}
        </Text>
      </Stack>
    </Surface>
  );
}

export function NewItem() {
  const [name, setName] = useState('');
  const [type, setType] = useState('goods');
  const [subType, setSubType] = useState('');
  const [brand, setBrand] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [taxPreference, setTaxPreference] = useState('');
  const [itemMode, setItemMode] = useState('single');
  const [applyToVariants, setApplyToVariants] = useState(true);

  return (
    <AppShell
      nav={(
        <Nav
          items={NAV_ITEMS}
          sections={NAV_SECTIONS}
          currentId="items"
          onNavigate={() => {}}
          collapsed={false}
          onCollapsedChange={() => {}}
          product={{ name: 'Inventory', mark: BOOKS_MARK }}
        />
      )}
      topBar={(
        <TopBar
          leading={[{ id: 'recent', label: 'Recent activity', icon: HISTORY_MARK, onSelect: () => {} }]}
          search={{
            scope: 'Inventory',
            value: '',
            onValueChange: () => {},
            onSubmit: () => {},
            onScopeOpen: () => {},
          }}
          org={{ name: 'Meedium', onOpen: () => {} }}
          actions={BAR_ACTIONS}
          account={{ name: 'Jenner Dopeson', initials: 'JD', onOpen: () => {} }}
          apps={{ onOpen: () => {} }}
        />
      )}
    >
      <PageHeader type="create" title="New Item" />

      <CreatePage
        footer={(
          <>
            <Button onClick={() => {}}>Save</Button>
            <Button emphasis="secondary" onClick={() => {}}>Cancel</Button>
          </>
        )}
      >
        <Stack gap={16} className="min-w-0">
          <FormSection
            children={(
              <>
                <FormRow label="Name" required>
                  {({ id, required, describedBy }) => (
                    <InputField
                      id={id}
                      required={required}
                      aria-describedby={describedBy}
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                    />
                  )}
                </FormRow>

                <FormRow label="Type">
                  {({ id, describedBy }) => (
                    <Inline gap={10} className="min-w-0">
                      <label className="inline-flex items-center gap-3 text-body-sm text-text-default">
                        <Radio
                          id={id}
                          name="item-type"
                          checked={type === 'goods'}
                          onChange={() => setType('goods')}
                          aria-describedby={describedBy}
                        />
                        Goods
                      </label>
                      <label className="inline-flex items-center gap-3 text-body-sm text-text-default">
                        <Radio
                          name="item-type"
                          checked={type === 'service'}
                          onChange={() => setType('service')}
                          aria-describedby={describedBy}
                        />
                        Service
                      </label>
                    </Inline>
                  )}
                </FormRow>

                <FormRow label="Sub Type">
                  {({ id, required, describedBy }) => (
                    <Select
                      id={id}
                      required={required}
                      ariaDescribedBy={describedBy}
                      value={subType}
                      onChange={setSubType}
                      placeholder="Select a Sub Type"
                      options={[
                        { value: 'assembly', label: 'Assembly' },
                        { value: 'inventory', label: 'Inventory' },
                        { value: 'service', label: 'Service' },
                      ]}
                    />
                  )}
                </FormRow>

                <FormRow label="Brand">
                  {({ id, describedBy }) => (
                    <Select
                      id={id}
                      ariaDescribedBy={describedBy}
                      value={brand}
                      onChange={setBrand}
                      placeholder="Select or Add Brand"
                      options={[
                        { value: 'acme', label: 'Acme' },
                        { value: 'north', label: 'North' },
                        { value: 'zen', label: 'Zen' },
                      ]}
                    />
                  )}
                </FormRow>

                <FormRow label="Manufacturer">
                  {({ id, describedBy }) => (
                    <Select
                      id={id}
                      ariaDescribedBy={describedBy}
                      value={manufacturer}
                      onChange={setManufacturer}
                      placeholder="Select or Add Manufacturer"
                      options={[
                        { value: 'factory-one', label: 'Factory One' },
                        { value: 'global-mfg', label: 'Global Mfg' },
                        { value: 'studio', label: 'Studio' },
                      ]}
                    />
                  )}
                </FormRow>

                <FormRow label="Tax Preference" required>
                  {({ id, required, describedBy }) => (
                    <Select
                      id={id}
                      required={required}
                      ariaDescribedBy={describedBy}
                      value={taxPreference}
                      onChange={setTaxPreference}
                      placeholder="Taxable"
                      options={[
                        { value: 'taxable', label: 'Taxable' },
                        { value: 'nontaxable', label: 'Non-taxable' },
                        { value: 'exempt', label: 'Exempt' },
                      ]}
                    />
                  )}
                </FormRow>
              </>
            )}
            trailing={(
              <Stack gap={8} className="min-w-0 pt-2">
                <Text size="body-lg" weight="semibold">Image upload</Text>
                <Inline gap={10} className="w-full min-w-0">
                  <UploadCard title="Front View" subtitle="Upload front image" />
                  <UploadCard title="Other Images" subtitle="Upload other images" />
                </Inline>
                <Checkbox
                  selection={applyToVariants ? 'checked' : 'unchecked'}
                  onSelectionChange={(next) => setApplyToVariants(next === 'checked')}
                  label="Add the uploaded images to subsequent variants"
                />
              </Stack>
            )}
          />

          <FormSection
            last
            children={null}
            full={(
              <Stack gap={12} className="min-w-0">
                <Text size="subheading" weight="semibold">Item Details</Text>

                <Stack gap={6} className="min-w-0">
                  <Text size="body-sm" tone="secondary">Item Type</Text>
                  <Segmented
                    label="Item Type"
                    options={[
                      { value: 'single', label: 'Single Item' },
                      { value: 'variant', label: 'Contains Variants' },
                    ]}
                    value={itemMode}
                    onChange={setItemMode}
                  />
                </Stack>
              </Stack>
            )}
          />
        </Stack>
      </CreatePage>
    </AppShell>
  );
}
