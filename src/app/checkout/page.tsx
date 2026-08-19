import { CheckoutClient } from "./CheckoutClient";
import { store } from "@/lib/config";
import { getSetting, CHECKOUT_NOTE_KEY } from "@/lib/repo/settings";

export const metadata = { title: `Checkout - ${store.name}` };
export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  const checkoutNote = getSetting(CHECKOUT_NOTE_KEY, store.checkoutNote);
  return <CheckoutClient checkoutNote={checkoutNote} />;
}
