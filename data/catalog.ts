/**
 * Catálogo real de Rastro Perfumería, extraído de la tienda actual el 18/08/2026.
 * Los precios están en centavos para evitar errores de coma flotante.
 */

export type Gender = "masculino" | "femenino" | "unisex";

export interface SeedVariant {
  size: "5ml" | "10ml";
  price: number; // centavos
  sku?: string;
  weightGr: number;
}

export interface SeedProduct {
  slug: string;
  name: string;
  categories: string[]; // slugs de categoría
  gender: Gender;
  description: string;
  occasions: string;
  images: string[]; // códigos de imagen (ver IMG_PREFIX)
  variants: SeedVariant[];
  featured?: boolean;
  published?: boolean;
}

/** Prefijos de los nombres de archivo del CDN, comprimidos para no repetirlos. */
const IMG_PREFIX: Record<string, string> = {
  A: "en-el-espacio-blanco-va-el-perfume",
  B: "perfume-entero",
  C: "en-el-espacio-va-el-perfume",
  D: "imagen-de-fragantica",
  E: "5ml",
  F: "10ml",
};

export function imageBase(code: string) {
  const prefix = IMG_PREFIX[code[0]];
  if (!prefix) throw new Error(`Código de imagen desconocido: ${code}`);
  return `${prefix}-${code.slice(1)}`;
}

/** Texto fijo que Rastro repite al final de cada descripción. */
export const MEDIDA_BOILERPLATE =
  "Decants de 5ml y 10ml. Trabajamos con perfumes originales y preparamos cada decant cuidadosamente en frascos atomizadores prácticos y seguros. Cuidando cada detalle de la presentación y la experiencia.";

export const CATEGORIES = [
  { slug: "arabes", name: "Decants Arabes", order: 1 },
  { slug: "disenador", name: "Decants de Diseñador", order: 2 },
  { slug: "combo", name: "Combos de Decants", order: 3 },
  { slug: "masculino", name: "Masculino", order: 4 },
  { slug: "femenino", name: "Femenino", order: 5 },
  { slug: "unisex", name: "Unisex", order: 6 },
];

const v = (p10: number, p5: number, w = 60): SeedVariant[] => [
  { size: "10ml", price: p10 * 100, weightGr: w },
  { size: "5ml", price: p5 * 100, weightGr: Math.round(w * 0.7) },
];

export const PRODUCTS: SeedProduct[] = [
  {
    slug: "decant-the-most-wanted-intense-edp",
    name: "Decant Azzaro The Most Wanted Intense EDP",
    categories: ["disenador", "masculino"],
    gender: "masculino",
    description:
      "Perfume masculino intenso, dulce y seductor. Combina especias, caramelo y ámbar para crear un aroma cálido, elegante y llamativo. Es una fragancia con mucha presencia, ideal para quienes buscan algo que se haga notar.",
    occasions:
      "Ideal para citas, salidas nocturnas, cenas, fiestas y eventos especiales. Se luce especialmente en otoño e invierno y durante noches frescas.",
    images: [
      "A681156577a8c6fdeb917868940781220",
      "Bca710a76a4c2a70e9917868940784606",
      "Ca3bdc77aaae7b9e89017868940780422",
      "Dcd460a677554a5911717868940781833",
      "E49036ae51fc1ab01f117868940804578",
      "F26e47c1307fa79af4f17868940797964",
    ],
    variants: v(38000, 20000),
    featured: true,
  },
  {
    slug: "decant-yara-candy",
    name: "Decant Yara Candy",
    categories: ["arabes", "femenino"],
    gender: "femenino",
    description:
      "Perfume femenino dulce, frutal y divertido, inspirado en el mundo de los dulces y las golosinas. Tiene un aroma alegre y juvenil, con frutas y vainilla que le dan un toque cremoso y adictivo. Es una excelente opción para quienes disfrutan de perfumes dulces y fáciles de reconocer.",
    occasions:
      "Ideal para salidas, citas, reuniones, fiestas, universidad y uso diario. Funciona especialmente bien durante primavera y verano, aunque también puede utilizarse durante todo el año.",
    images: [
      "A2b6b3a88d7fce7f3a417868964362788",
      "B3054fcf0415e44dbce17868964364007",
      "Cd637c12d516459e18f17868964359964",
      "D15039ad5c0ae3989a517868964365954",
      "E542fb0e5cf458d172c17868964416177",
      "F1875102ca8fdf9c4a317868964414630",
    ],
    variants: v(18000, 10000),
    featured: true,
  },
  {
    slug: "decant-yara",
    name: "Decant Yara",
    categories: ["arabes", "femenino"],
    gender: "femenino",
    description:
      "Perfume femenino dulce, suave y cremoso, con un aroma frutal y floral. Tiene una sensación delicada y agradable, con notas de vainilla y almizcle que le aportan un acabado cálido y reconfortante. Es una fragancia fácil de llevar y muy versátil.",
    occasions:
      "Perfecto para uso diario, universidad, trabajo, salidas, citas y reuniones. Es una excelente opción para primavera y otoño, aunque puede utilizarse durante todo el año.",
    images: [
      "Add1a01c1329fb4211d17868966554624",
      "B0c0433bca457d0e14117868966553536",
      "C4ce22fc0e785cbc79117868966552229",
      "D99335f1fcded28f83c17868966551985",
      "Eeac91a9c6d6e246de317868966565986",
      "Fd2eb5a40dbf0eb4dad17868966563940",
    ],
    variants: v(18000, 10000),
  },
  {
    slug: "decant-fakhar-rose",
    name: "Decant Fakhar Rose",
    categories: ["arabes", "femenino"],
    gender: "femenino",
    description:
      "Perfume femenino, floral y elegante, con un aroma fresco y ligeramente dulce. Las flores blancas se combinan con frutas y notas suaves para crear una fragancia femenina, delicada y moderna, pero con buena presencia.",
    occasions:
      "Perfecto para uso diario, trabajo, universidad, salidas, reuniones y citas. Es una fragancia versátil que puede utilizarse durante todo el año, especialmente durante primavera y verano.",
    images: [
      "Aeb690ac570dcaeeef117868962889489",
      "B4a65ecf36d39c1976117868962887153",
      "C8f2b0813063b17e0bf17868962890302",
      "Dc6d6fbb834f1da180b17868962889098",
      "E216810a6b279be62a417868962896285",
      "F6c784f3fc06cd0b4b317868962896203",
    ],
    variants: v(18000, 10000),
  },
  {
    slug: "decant-angham",
    name: "Decant Angham",
    categories: ["arabes", "femenino"],
    gender: "femenino",
    description:
      "Perfume femenino dulce, cremoso y elegante. Combina cítricos, frutas y flores con una base cálida de vainilla, praliné y almizcle. Tiene un aroma femenino y moderno, ideal para quienes buscan algo dulce pero sofisticado.",
    occasions:
      "Ideal para citas, salidas, cenas, reuniones y ocasiones especiales. También puede utilizarse en el día a día si te gustan los perfumes dulces. Se adapta muy bien a otoño, invierno y noches frescas.",
    images: [
      "Ab67ddc603e4be460b817868953827677",
      "Ba975b5f66dc0aba08c17868953834489",
      "Cd6ed0da1308618c6a517868953828150",
      "Dc138c8c8ed44801a2f17868953827507",
      "E627e27d2192d98ff4117868953837243",
      "F2fd5723738a4d2a98a17868953832432",
    ],
    variants: v(18000, 10000),
  },
  {
    slug: "decant-bad-boy-cobalt-elixir",
    name: "Decant Bad Boy Cobalt Elixir",
    categories: ["disenador", "masculino"],
    gender: "masculino",
    description:
      "Perfume masculino intenso, moderno y elegante, con un aroma dulce, amaderado y ligeramente especiado. Tiene mucha presencia y un perfil seductor, ideal para quienes buscan una fragancia que se haga notar.",
    occasions:
      "Ideal para salidas nocturnas, citas románticas, cenas, fiestas y eventos especiales. Se destaca especialmente en otoño e invierno y durante noches frescas.",
    images: [
      "A9cf5917f95dabebc9217868951765390",
      "Bfaa2258e33042d294017868951768344",
      "C499f216a80bbd355ef17868951764421",
      "D0e326d584a9f77735017868951763158",
      "E15ef2c67a1277c182917868951777064",
      "Fd75452e1bafb3a89c317868951776012",
    ],
    variants: v(38000, 20000),
    featured: true,
  },
  {
    slug: "decant-swy-intensely",
    name: "Decant Stronger With You Intensely",
    categories: ["disenador", "masculino"],
    gender: "masculino",
    description:
      "Perfume masculino dulce, cálido e intenso, con un aroma envolvente que combina vainilla, caramelo, canela y castaña. Tiene un estilo muy seductor y juvenil, ideal para quienes buscan una fragancia dulce que deje una buena impresión.",
    occasions:
      "Perfecto para citas, salidas nocturnas, cenas, fiestas y eventos especiales. Se destaca principalmente en otoño e invierno y durante noches frescas.",
    images: [
      "A3e89357e883e941af217868948998566",
      "B97eb35ccd3d08c46a117868949003550",
      "Cd3ebb5b2b795994ab717868948997999",
      "D92fc1de950b986929217868948998933",
      "E62c887942f59cb00d917868949013556",
      "F560d827000d6ec31de17868949007835",
    ],
    variants: v(38000, 20000),
    featured: true,
  },
  {
    slug: "decant-le-male-edt",
    name: "Decant Le Male EDT",
    categories: ["disenador", "masculino"],
    gender: "masculino",
    description:
      "Perfume masculino clásico, dulce y limpio, con una combinación muy característica de lavanda, menta y vainilla. Tiene un aroma cálido y seductor, pero al mismo tiempo transmite una sensación de limpieza. Es una fragancia reconocida y muy fácil de identificar.",
    occasions:
      "Ideal para citas, salidas, cenas, reuniones y ocasiones especiales. También puede utilizarse en el día a día. Funciona especialmente bien en otoño, invierno y noches frescas.",
    images: [
      "A4a6964feae19523b0c17868945704768",
      "B62c8199137181336f817868945707547",
      "C569fd1569aa80aeba617868945706434",
      "D3e3862addd0662fde717868945705010",
      "E3912ba918b2fcf592017868945715040",
      "F554b586a934c5ada6b17868945712895",
    ],
    variants: v(38000, 20000),
  },
  {
    slug: "decant-invictus-edt",
    name: "Decant Invictus EDT",
    categories: ["disenador", "masculino"],
    gender: "masculino",
    description:
      "Perfume masculino fresco, dulce y deportivo, con una combinación de cítricos, notas acuáticas y un fondo amaderado. Es una fragancia energética y juvenil, fácil de usar y con un aroma que suele resultar muy agradable.",
    occasions:
      "Excelente para uso diario, universidad, trabajo, salidas, reuniones y actividades informales. Funciona especialmente bien durante primavera y verano y en días de calor.",
    images: [
      "Ae4fbefa9938470a70b17868944042147",
      "B958bbc68953046c5f017868944045521",
      "Cce17bd7df72cce394a17868944039810",
      "Dd11d642419344d34c017868944039918",
      "E40dcfbc457763d84f617868944053626",
      "F019f2612c7552027aa17868944052518",
    ],
    variants: v(28000, 15000),
  },
  {
    slug: "decant-odyssey-aqua",
    name: "Decant Odyssey Aqua",
    categories: ["arabes", "masculino"],
    gender: "masculino",
    description:
      "Perfume fresco, acuático y cítrico, con un aroma limpio y revitalizante. Es una fragancia fácil de usar y muy versátil, ideal para quienes prefieren perfumes frescos que transmitan una sensación de limpieza y energía.",
    occasions:
      "Ideal para el día a día, trabajo, universidad, salidas informales, actividades al aire libre y días de calor. También es una muy buena opción para usar después de una ducha o durante el verano.",
    images: [
      "A11aacf686eae9cd78f17868937513339",
      "Ba36cd9009159c8771317868937517537",
      "Cc85417f617677540f817868937514387",
      "D4bbd71b88e99154c5317868937512190",
      "E3c9f7f1e1e1a43b7c917868937536494",
      "Fede0694f5deddafa0b17868937535288",
    ],
    variants: v(18000, 10000),
  },
  {
    slug: "decant-asad",
    name: "Decant Asad",
    categories: ["arabes", "masculino"],
    gender: "masculino",
    description:
      "Perfume intenso, cálido y especiado, con un aroma dulce y profundo. Combina especias, vainilla, tabaco y ámbar para crear una fragancia potente y masculina. Es una excelente opción para quienes buscan un perfume que tenga presencia y dure muchas horas.",
    occasions:
      "Perfecto para salidas nocturnas, citas, fiestas y reuniones. Se destaca especialmente durante otoño e invierno y en noches frescas.",
    images: [
      "A5bba3785731fc2d83e17868927836422",
      "B966f7db4858f0a353b17868927848277",
      "C6296ef6c5749aaedab17868927835857",
      "D5e8e9ca53fad2cc4a517868927839319",
      "Efb2287306a3df51f9f17868927868966",
      "Fba29e180457612442017868927868599",
    ],
    variants: v(15000, 8500),
  },
  {
    slug: "decant-asad-bourbon",
    name: "Decant Asad Bourbon",
    categories: ["arabes", "masculino"],
    gender: "masculino",
    description:
      "Perfume cálido, dulce y elegante, con un aroma envolvente que combina vainilla, cacao y especias. Tiene un perfil gourmand, es decir, recuerda a aromas dulces y deliciosos, pero manteniendo un estilo sofisticado y masculino.",
    occasions:
      "Ideal para citas, cenas, fiestas y climas fríos. Se luce especialmente en otoño e invierno o durante noches frescas. Si te gustan los perfumes dulces y llamativos, es una excelente opción.",
    images: [
      "A6cc430e2abb6cd8f4917868919903142",
      "B8ad8dbbd70d0ec1ab117868919907829",
      "C264fb79d648c6e4c1817868919903830",
      "Da4f274b4d4525d500417868919905336",
      "E300f6142d24833fa8317868919936932",
      "F035e081d516792524017868919935735",
    ],
    variants: v(15000, 8500),
  },
  {
    slug: "decant-khamra",
    name: "Decant Khamra",
    categories: ["arabes", "unisex", "masculino"],
    gender: "unisex",
    description:
      "Perfume dulce, cálido y especiado, con un aroma muy envolvente. Combina canela, dátiles, praliné y vainilla, creando una fragancia que recuerda a postres y bebidas dulces. Es intenso, duradero y con mucha presencia.",
    occasions:
      "Ideal para citas, cenas, fiestas, salidas nocturnas y ocasiones especiales. Es especialmente recomendable para otoño e invierno y para quienes disfrutan de perfumes dulces e intensos.",
    images: [
      "A66aeaa17f1529bda7e17868912712905",
      "B4ca4234f2759b8f2b517868912711441",
      "Cfde6abe6f5824af27e17868912713564",
      "Dc296a95c99cb7b1b9817868912719838",
      "E09bf315a935c2bcda617868912847064",
      "F4f4add48a53174c1fb17868912843704",
    ],
    variants: v(18000, 10000),
  },
  {
    slug: "decant-honor-glory",
    name: "Decant Honor & Glory",
    categories: ["arabes", "unisex", "masculino", "femenino"],
    gender: "unisex",
    description:
      "Perfume dulce, cremoso y tropical, con un aroma muy llamativo y diferente. Combina piña, canela, vainilla y coco, creando una sensación que recuerda a un postre tropical. Es una fragancia con mucha personalidad y excelente presencia.",
    occasions:
      "Ideal para citas, salidas, reuniones, fiestas y ocasiones especiales. Funciona muy bien durante otoño e invierno, aunque también puede disfrutarse en noches templadas. Recomendado para quienes buscan un perfume dulce y original.",
    images: [
      "Af38c21d9f4ce66db9e17868904791577",
      "B64544411172812c81f17868904796076",
      "Cd1d97069b1d894bff817868904787313",
      "D3b30bd2cbb3662974f17868904786515",
      "Eaf0828cc59f56082c317868904783331",
      "F924892acc5ecae3fb017868904783723",
    ],
    variants: v(18000, 10000),
  },
  {
    slug: "decant-9pm",
    name: "Decant 9pm",
    categories: ["arabes", "masculino"],
    gender: "masculino",
    description:
      "Perfume dulce, cálido y seductor, con un aroma que combina frutas, especias y vainilla. Es de esos perfumes que se sienten rápidamente y dejan una estela agradable y llamativa. Ideal si buscás un perfume para salir y querés que se note.",
    occasions:
      "Ideal para salidas nocturnas, citas, fiestas, reuniones y eventos especiales. Se disfruta especialmente en noches frescas o frías. No es la opción más recomendable para días muy calurosos.",
    images: [
      "A09a03ffb368c1f91c917868899932149",
      "B1e1103c327d147f0c417868899932013",
      "C144e4566822b50b76d17868899927944",
      "D359d79ee4887e0fe6117868899927474",
      "E55347fdd6de09af48317868899926012",
      "Fba91f3f9385e88f5d917868899924282",
    ],
    variants: v(18000, 10000),
  },
];

/**
 * Combos. Hoy están ocultos y sin contenido en Tiendanube; acá quedan
 * publicados con los precios reales que ya estaban cargados en el panel,
 * para que la categoría "Combos de Decants" deje de estar vacía.
 */
const combo = (
  slug: string,
  name: string,
  p5: number,
  p10: number,
  description: string,
): SeedProduct => ({
  slug,
  name,
  categories: ["combo"],
  gender: "unisex",
  description,
  occasions:
    "Al finalizar la compra indicanos los perfumes y la medida en orden de preferencia. Si faltan nombres, repetimos desde el primero. Ante cualquier duda te escribimos por WhatsApp.",
  images: [],
  variants: [
    { size: "5ml", price: p5 * 100, weightGr: 130 },
    { size: "10ml", price: p10 * 100, weightGr: 190 },
  ],
});

export const COMBOS: SeedProduct[] = [
  combo("trio-verano", "Trio Verano (3 Fragancias)", 28000, 60000, "Tres decants frescos y cítricos, elegidos para los días de calor."),
  combo("trio-invierno", "Trio Invierno (3 Fragancias)", 28000, 60000, "Tres decants cálidos, dulces y especiados para las noches frías."),
  combo("trio-otono", "Trio Otoño (3 Fragancias)", 28000, 60000, "Tres decants amaderados y envolventes para el entretiempo."),
  combo("trio-arabe-masculino", "Trio Arabe Masculino (3 Fragancias)", 22000, 40000, "Tres decants árabes masculinos de mucha presencia y duración."),
  combo("trio-arabe-femenino", "Trio Arabe Femenino (3 Fragancias)", 45000, 82000, "Tres decants árabes femeninos, dulces y florales."),
  combo("trio-disenador-masculino", "Trio Diseñador Masculino (3 Fragancias)", 45000, 82000, "Tres decants de diseñador masculinos, los más pedidos de la casa."),
  combo("duo-intense", "Dúo Intense (2 Fragancias)", 32000, 61000, "Dos decants intensos para quienes buscan estela y duración."),
  combo("duo-el-y-ella", "Dúo Él y Ella (2 Fragancias)", 16000, 29000, "Un decant masculino y uno femenino para compartir."),
  combo("duo-oficina", "Dúo Oficina (2 Fragancias)", 32000, 61000, "Dos decants suaves y prolijos para usar todos los días."),
  combo("duo-am-pm", "Dúo AM PM (2 Fragancias)", 16000, 29000, "Uno fresco para el día y uno intenso para la noche."),
  combo("duo-asad", "Dúo Asad (2 Fragancias)", 16000, 29000, "Asad y Asad Bourbon juntos, para comparar las dos versiones."),
  combo("duo-unisex", "Dúo Unisex (2 Fragancias)", 16000, 29000, "Dos decants unisex que funcionan en cualquier ocasión."),
  combo("duo-femenino", "Dúo Femenino (2 Fragancias)", 16000, 29000, "Dos decants femeninos dulces y florales."),
  combo("duo-yara", "Dúo Yara (2 Fragancias)", 16000, 29000, "Yara y Yara Candy juntos, los dos más pedidos de la línea."),
  combo("duo-noche", "Dúo Noche (2 Fragancias)", 24000, 45000, "Dos decants pensados para salir de noche."),
  combo("duo-dia-a-dia", "Dúo Día a Día (2 Fragancias)", 24000, 45000, "Dos decants versátiles para usar a diario."),
];

export const ALL_PRODUCTS: SeedProduct[] = [...PRODUCTS, ...COMBOS];
