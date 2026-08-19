export type Gender = "masculino" | "femenino" | "unisex";

export interface Variant {
  id: number;
  size: string;
  price: number;       // centavos
  compareAt: number | null;
  stock: number | null; // null = infinito
  sku: string;
  weightGr: number;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  description: string;
  occasions: string;
  gender: Gender;
  brand: string;
  images: string[];
  featured: boolean;
  published: boolean;
  categories: string[];
  variants: Variant[];
}

export interface Category {
  slug: string;
  name: string;
  description: string;
  image: string;
  position: number;
  homeVisible: boolean;
}

export interface Section {
  id: number;
  title: string;
  kicker: string;
  text: string;
  ctaLabel: string;
  ctaHref: string;
  image: string;
  position: number;
}

export interface Banner {
  id: number;
  href: string;
  title: string;
  kicker: string;
  image: string;
  tone: "dark" | "light";
  position: number;
}

export type ShippingKind = "domicilio" | "retiro";

export interface ShippingOption {
  id: string;
  kind: ShippingKind;
  label: string;
  cost: number;      // centavos
  eta: string;       // "Llega entre el jueves 20/08 y el lunes 24/08"
  carrier: string;
}

export interface CartLine {
  productSlug: string;
  variantId: number;
  name: string;
  size: string;
  image: string;
  unitPrice: number;
  quantity: number;
  stock: number | null;
}

export type OrderStatus =
  | "pending"
  | "awaiting_transfer"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Order {
  id: string;
  status: OrderStatus;
  paymentMethod: "mercadopago" | "transfer";
  paymentRef: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerDoc: string;
  shippingMethod: ShippingKind;
  shippingLabel: string;
  shippingCost: number;
  shippingEta: string;
  address: {
    street: string;
    number: string;
    extra: string;
    city: string;
    state: string;
    zip: string;
  };
  note: string;
  subtotal: number;
  discount: number;
  couponCode: string;
  total: number;
  createdAt: string;
  paidAt: string | null;
  items: {
    productSlug: string;
    name: string;
    size: string;
    image: string;
    unitPrice: number;
    quantity: number;
  }[];
}
