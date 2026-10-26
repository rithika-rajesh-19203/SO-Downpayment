import { useState } from 'react';
import {
  AppShell,
  Button,
  Checkbox,
  DescriptionList,
  Inline,
  Nav,
  SidePanel,
  Stack,
  StatusBadge,
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

const items = [
  { name: 'A-line dress', variants: 5 },
  { name: 'ghjh', variants: 2 },
  { name: 'Bird frame', variants: 3 },
  { name: 'csk jersey', variants: 5 },
  { name: 'TSHIRT', variants: 3 },
  { name: 'Tea cup', variants: 5 },
  { name: 'Red dress', variants: 4 },
  { name: 'Cheese', variants: 3 },
  { name: 'test grp', variants: 12 },
  { name: 'Abstract Art Group', variants: 3 },
];

const tabs = [
  { id: 'details', label: 'Item Details' },
  { id: 'price-lists', label: 'Price Lists' },
  { id: 'transactions', label: 'Transactions' },
  { id: 'history', label: 'History' },
] as const;

export function ItemDetailsPage() {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [applyToVariants, setApplyToVariants] = useState(false);
  const [selectedItem, setSelectedItem] = useState('A-line dress');
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['id']>('details');

  const details = [
    { label: 'Item Name', value: 'A-line dress' },
    { label: 'Color', value: 'black' },
    { label: 'Unit', value: 'pcs' },
    { label: 'Intra State Tax...', value: 'GST 12 %' },
    { label: 'Gifting option', value: 'false' },
    { label: 'Profit margin', value: '50%' },
  ];

  const detailsRight = [
    { label: 'Item Type', value: 'Sales and Purchase Items' },
    { label: 'SKU', value: 'A-LINEDRESS-BLACK' },
    { label: 'Tax Preference', value: 'Taxable' },
    { label: 'Inter State Tax...', value: 'IGST 28 %' },
    { label: 'Inactive Batch...', value: 'false' },
  ];

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
      <Inline align="stretch" className="h-full min-h-0 w-full">
        <Surface tone="default" border="default" radius="none" className="w-80 shrink-0 border-r border-border-divider">
          <Stack gap={2}>
            <Inline gap={2} justify="between" className="px-4 py-3">
              <Text size="body-sm" weight="medium">Multi Variant...</Text>
              <Inline gap={2}>
                <Button size="sm" emphasis="secondary" intent="default" icon="plus" label="Add item" />
                <Button size="sm" emphasis="secondary" intent="default" icon="close" label="Close list" />
              </Inline>
            </Inline>

            <Stack gap={2} className="p-3">
              {items.map((item) => {
                const active = item.name === selectedItem;
                return (
                  <Button
                    key={item.name}
                    type="button"
                    size="sm"
                    emphasis="secondary"
                    intent={active ? 'default' : 'default'}
                    onClick={() => setSelectedItem(item.name)}
                    className={[
                      'w-full justify-between border',
                      active ? 'border-border-focus bg-primary-subtle' : 'border-border-default bg-surface-default',
                    ].join(' ')}
                  >
                    <Inline justify="between" align="center" className="w-full gap-3 text-left">
                      <Text size="body" weight={active ? 'semibold' : 'regular'}>{item.name}</Text>
                      <Surface tone="default" border="default" radius="full" className="shrink-0 border-border-focus bg-surface-default px-2 py-0.5">
                        <Text size="body-sm" tone="link">Variants: {item.variants}</Text>
                      </Surface>
                    </Inline>
                  </Button>
                );
              })}
            </Stack>
          </Stack>
        </Surface>

        <Stack grow className="min-h-0 flex-1 bg-surface-sunken">
          <Surface tone="default" border="default" radius="none" className="border-b border-border-divider">
            <Inline gap={3} justify="between" className="px-5 py-3">
              <Inline gap={3} align="center">
                <Button size="sm" emphasis="secondary" intent="default" icon="chevron-left" label="Back" />
                <Stack gap={0}>
                  <Text size="subheading" weight="semibold">A-line dress-black</Text>
                  <Text size="body-sm" tone="secondary">Returnable Item</Text>
                </Stack>
              </Inline>

              <Inline gap={2}>
                <Button size="sm" emphasis="secondary" intent="default" icon="edit">Edit</Button>
                <Button size="sm" emphasis="secondary" intent="default" icon="plus" label="More actions" />
              </Inline>
            </Inline>
          </Surface>

          <Stack gap={6} className="flex-1 min-h-0 overflow-y-auto px-6 py-6">
            <Surface tone="default" border="default" radius="card" pad={6}>
              <Inline gap={6} align="center" className="px-5 py-4">
                <Button
                  type="button"
                  emphasis="secondary"
                  intent="default"
                  size="lg"
                  icon="upload"
                  label="Open image gallery"
                  onClick={() => setGalleryOpen(true)}
                  className="h-20 w-20 rounded-md border-2 border-dashed border-border-default bg-surface-sunken"
                />

                <Stack grow className="min-w-0 flex-1">
                  <Inline gap={3} align="center">
                    <Text size="heading" weight="semibold">A-line dress-black</Text>
                    <StatusBadge status="success" emphasis="solid">Active</StatusBadge>
                  </Inline>
                  <Text size="body-sm" tone="secondary" className="mt-2">SKU: A-LINEDRESS-BLACK</Text>
                </Stack>

                <Stack gap={1} className="min-w-0 text-right">
                  <Text size="body-sm" tone="secondary">Total Sales This Month</Text>
                  <Text size="body" weight="medium">Rs.0.00</Text>
                </Stack>
              </Inline>
            </Surface>

            <Surface tone="default" border="default" radius="none" className="border-b border-border-divider">
              <Inline gap={6} className="px-3">
                {tabs.map((tab) => {
                  const active = tab.id === activeTab;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={[
                        'border-b-2 pb-3 pt-2 text-body font-medium',
                        active ? 'border-border-focus text-text-default' : 'border-transparent text-text-secondary',
                      ].join(' ')}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </Inline>
            </Surface>

            {activeTab === 'details' ? (
              <>
                <Surface tone="default" border="default" radius="card" pad={6}>
                  <Stack gap={4} className="px-3 py-4">
                    <Text size="subheading" weight="semibold">Item Details</Text>
                    <Inline gap={8} className="w-full">
                      <DescriptionList items={details} className="flex-1" />
                      <DescriptionList items={detailsRight} className="flex-1" />
                    </Inline>
                  </Stack>
                </Surface>

                <Surface tone="default" border="default" radius="card" pad={6}>
                  <Stack gap={4} className="px-3 py-4">
                    <Text size="subheading" weight="semibold">Purchase Information</Text>
                    <Inline gap={8} className="w-full">
                      <DescriptionList
                        items={[
                          { label: 'Cost Price', value: 'Rs.499.00' },
                          { label: 'Purchase Acco...', value: 'Cost of Goods Sold' },
                        ]}
                        className="flex-1"
                      />
                      <DescriptionList
                        items={[
                          { label: 'Purchase Acco...', value: 'Cost of Goods Sold' },
                          { label: 'Cost Price', value: 'Rs.499.00' },
                        ]}
                        className="flex-1"
                      />
                    </Inline>
                  </Stack>
                </Surface>
              </>
            ) : (
              <Surface tone="default" border="default" radius="card" pad={8}>
                <Stack gap={4}>
                  <Text size="subheading" weight="semibold">{tabs.find((tab) => tab.id === activeTab)?.label}</Text>
                  <Text tone="secondary">This section is reserved for the selected item tab.</Text>
                </Stack>
              </Surface>
            )}
          </Stack>
        </Stack>
      </Inline>

      <SidePanel open={galleryOpen} onClose={() => setGalleryOpen(false)} title="Image Gallery">
        <Stack gap={6} className="p-6">
          <Surface tone="sunken" border="default" radius="xl" className="flex h-56 items-center justify-center border-dashed">
            <Button
              type="button"
              emphasis="secondary"
              intent="default"
              label="Upload an image"
              onClick={() => setGalleryOpen(true)}
              className="h-20 w-20 rounded-full"
              icon="upload"
            />
          </Surface>

          <Checkbox
            selection={applyToVariants ? 'checked' : 'unchecked'}
            onSelectionChange={(next) => setApplyToVariants(next === 'checked')}
            label="Add the uploaded image to subsequent variants"
          />
        </Stack>
      </SidePanel>
    </AppShell>
  );
}
