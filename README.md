# Rastro Perfumería — tienda propia

Réplica funcional de la tienda pública de Rastro Perfumería, con backend propio
y las integraciones reales enchufadas: **Mercado Pago**, **transferencia con
comprobante por WhatsApp**, **cotización de envíos**, **emails transaccionales**
y un **panel de administración**.

El diseño reproduce 1:1 el sistema visual del tema Morelia que usa la tienda hoy
(colores, tipografías, grilla de 1020 px, breakpoint en 768 px, carrito lateral
de 450 px, checkout de 3 pasos).

---

## Arrancar en 3 pasos

```bash
npm install
cp .env.example .env.local     # completá lo que necesites
npm run seed                   # crea rastro.db con los 31 productos reales
npm run dev                    # http://localhost:3000
```

El panel está en `/admin` (la contraseña es la de `ADMIN_PASSWORD`).

---

## Stack

| Capa | Elección | Por qué |
|---|---|---|
| Framework | Next.js 15 (App Router) + TypeScript | SSR para SEO, rutas API en el mismo proyecto |
| Estilos | Tailwind 4 con los tokens del tema Morelia | El sistema de diseño queda en `globals.css` |
| Base de datos | SQLite vía `node:sqlite` | Cero dependencias nativas, cero servicios extra |
| Pagos | Mercado Pago Checkout Pro + transferencia | Tarjetas y cuotas + el flujo que ya usan por WhatsApp |
| Envíos | Andreani API con tarifario propio de respaldo | Funciona desde el día uno aunque no haya contrato |
| Email | Resend | Sin API key, los mails se loguean por consola |
| WhatsApp | Links `wa.me` + Cloud API opcional | Funciona sin credenciales |

### ¿Y si mañana quieren Postgres?

Toda la lectura y escritura pasa por `src/lib/repo/*`. Reimplementando esos dos
archivos contra Postgres (o cualquier otra base) el resto del proyecto no cambia.

---

## Estructura

```
data/catalog.ts              Catálogo real extraído de la tienda actual
scripts/seed.ts              Siembra la base
src/lib/
  config.ts                  Datos del negocio, formato de moneda, CDN
  db/                        Conexión + schema.sql
  repo/products.ts           Consultas de catálogo y filtros
  repo/orders.ts             Órdenes, cupones, stock
  shipping/                  index (fachada) · andreani · table (respaldo)
  payments/mercadopago.ts    Preferencias y consulta de pagos
  mail/index.ts              Emails transaccionales
  whatsapp.ts                Links y mensajes
  cart-context.tsx           Estado del carrito (localStorage)
  auth.ts                    Sesión del admin (cookie firmada con HMAC)
src/components/
  layout/                    Header, Footer, WhatsApp, cookies
  home/                      Categorías, banners, carrusel de módulos
  product/                   Card, grilla, filtros, galería, buy box
  cart/CartDrawer.tsx        El carrito lateral
src/app/
  (tienda)/                  Home, /productos, /[categoria], ficha, contacto, cuenta
  checkout/                  3 pasos + comprobante
  admin/                     Pedidos y ABM de productos
  api/                       shipping · checkout · coupon · contacto · newsletter · webhook
```

---

## Integraciones: qué hay que hacer en cada una

### 1. Mercado Pago (tarjetas y cuotas)

1. Entrá a https://www.mercadopago.com.ar/developers/panel/app y creá una aplicación.
2. Copiá el **Access Token de producción** a `MP_ACCESS_TOKEN`.
3. En *Webhooks*, agregá `https://TU-DOMINIO/api/webhooks/mercadopago` y suscribite
   al evento **Pagos**.
4. Listo. El checkout crea una preferencia y redirige a Mercado Pago; cuando el
   pago se aprueba, el webhook marca la orden como pagada, descuenta stock y
   dispara el mail de confirmación.

> Mientras `MP_ACCESS_TOKEN` esté vacío, la opción de tarjeta devuelve un mensaje
> claro al cliente y la de transferencia sigue funcionando.

**Comisiones a tener en cuenta:** Checkout Pro cobra un porcentaje por venta que
varía según el plazo de acreditación. Conviene mirarlo antes de definir precios;
son datos que cambian seguido, así que revisalos en el panel de MP.

### 2. Transferencia con comprobante por WhatsApp

Completá `TRANSFER_ALIAS`, `TRANSFER_CBU`, `TRANSFER_HOLDER` y `TRANSFER_BANK`.

Flujo: el cliente confirma → se crea la orden en estado `awaiting_transfer` →
ve el alias en pantalla y le llega por mail → aprieta **"Enviar comprobante por
WhatsApp"**, que abre el chat con un mensaje ya escrito (número de pedido,
items, total y nombre) → ustedes marcan la orden como *Pagada* en `/admin`.

Si querés incentivar la transferencia, poné `TRANSFER_DISCOUNT_PCT=10`.

### 3. Envíos

Sin credenciales, `src/lib/shipping/table.ts` cotiza con un tarifario propio por
zona de CP y peso. Está calibrado con los valores reales de hoy (CP 1884:
$9.914,80 a domicilio, $6.178,20 a sucursal) y se edita en un solo archivo.

Con contrato de Andreani, completá `ANDREANI_*` y el sistema pasa a cotizar
contra su API automáticamente. Si la API falla, cae al tarifario sin romper la
compra.

**Importante:** el peso de cada variante se usa para cotizar. En Tiendanube hoy
está todo en 0 kg; en este proyecto los decants vienen con 60 g (10 ml) y 42 g
(5 ml), editables desde el admin.

### 4. Email

Creá una cuenta en https://resend.com, verificá el dominio y poné la key en
`RESEND_API_KEY`. Se mandan tres mails: confirmación al cliente, instrucciones
de transferencia, y aviso al vendedor.

### 5. WhatsApp automático (opcional)

Los links `wa.me` funcionan sin configurar nada. Si además querés que el sistema
avise solo cuando entra un pedido, cargá `WHATSAPP_TOKEN` y `WHATSAPP_PHONE_ID`
de la Cloud API de Meta.

---

## Seguridad: lo que ya está resuelto

- **Los precios nunca vienen del cliente.** `/api/checkout` relee precio, stock y
  peso desde la base antes de cobrar. Un carrito manipulado en el navegador no
  cambia el total.
- **El envío se recotiza en el servidor** con el mismo código que usa el frente.
- **El webhook de Mercado Pago no confía en su propio body:** con el id del pago
  vuelve a consultar la API de MP para saber el estado real.
- **La sesión del admin** es una cookie `httpOnly` firmada con HMAC y vencimiento
  de 7 días.
- **Todos los endpoints validan con Zod** antes de tocar la base.

---

## Diferencias intencionales con la tienda actual

| Tema | Tienda actual | Acá |
|---|---|---|
| Medios de pago | ninguno disponible | Mercado Pago + transferencia |
| Combos | 20 productos ocultos y vacíos | 16 combos publicados con precio |
| Home | no muestra ni un precio | sección "Más vendidos" |
| Banners | imágenes de 218×102 px | texto real sobre foto de 1024 px |
| Peso de productos | 0 kg | 60 g / 42 g por variante |
| Página de carrito | `/carrito/` da 404 | el drawer es la única vista, igual que hoy |

---

## Pendientes conocidos

- **Cuentas de cliente**: hoy `/cuenta` sólo permite buscar un pedido por número.
  Falta login, historial y direcciones guardadas.
- **Fotos**: el seed apunta al CDN de Tiendanube. Antes de salir a producción
  conviene bajarlas y servirlas desde el propio dominio (o desde un bucket).
- **Etiquetas de envío**: se cotiza contra Andreani pero todavía no se generan
  las etiquetas ni el seguimiento.
- **Tests**: hay un recorrido end-to-end manual documentado; falta automatizarlo
  en CI.

---

## Deploy

Funciona en cualquier host con Node 22+. En Vercel hay que tener en cuenta que el
filesystem es efímero: para producción real, mover la base a Postgres (Neon,
Supabase) reimplementando `src/lib/repo/*`, o desplegar en un VPS/Fly.io con
volumen persistente para `rastro.db`.
