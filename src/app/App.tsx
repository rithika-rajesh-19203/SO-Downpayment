import { Books } from './screens/Books';

/**
 * Application root. The current design target is SALES → SALES ORDERS with
 * advance payments: the creation page opens first, and saving lands on the
 * order's details page.
 */
export function App() {
  return <Books />;
}
