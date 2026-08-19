import { CheckoutClient } from "./CheckoutClient";
import { store } from "@/lib/config";

export const metadata = { title: `Checkout - ${store.name}` };

export default function CheckoutPage() {
  return <CheckoutClient />;
}
