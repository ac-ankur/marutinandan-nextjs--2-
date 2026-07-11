export const variants = {
  black: {
    key: "black",
    name: "Black Mustard Oil",
    tagline: "Strong. Aromatic. Traditional Kachi Ghani.",
    shortDescription:
      "Cold Pressed Black Mustard Oil is single-pressed from premium black mustard seeds for a sharp, pungent flavour that defines authentic Indian cooking.",
    pungency: "0.36%",
    accent: "#D3A02E",
    features: [
      "100% Pure Cold Pressed (Kachi Ghani) — single-pressed at low temperature",
      "Strong, traditional aroma & sharp pungency (Allyl Isothiocyanate 0.36%)",
      "Rich in natural Omega-3 & MUFA healthy fats",
      "Cholesterol free & free from trans fat",
      "No Argemone, no mineral oil, no synthetic colours — lab verified",
      "Chemical-free, hexane-free, no solvent processing",
      "FSSAI compliant & quality tested by NABL-accredited laboratory",
    ],
    lab: {
      type: { result: "Cold Pressed (Kachi Ghani)", std: "—" },
      moisture: { result: "0.15 % by weight", std: "0.25 % Max." },
      rancidity: { result: "Free From Rancidity", std: "Free From Rancidity" },
      saponification: { result: "173.10", std: "168 – 177" },
      unsaponifiable: { result: "0.84 % by weight", std: "NMT 1.2" },
      iodine: { result: "107.40", std: "96 – 112" },
      acid: { result: "1.32", std: "NMT 6.0" },
      mineralOil: { result: "Free From Mineral Oil", std: "Free From Mineral Oil" },
      argemone: { result: "Negative", std: "Negative" },
      refractiveIndex: { result: "1.4658", std: "1.4646 – 1.4662" },
      peroxide: { result: "BLQ (0.2) meq/kg", std: "NMT 10" },
      hcn: { result: "Passes the Test", std: "Passes the Test" },
      syntheticColours: { result: "Absent", std: "Absent" },
      allylIsothiocyanate: { result: "0.36 %", std: "NLT 0.20" },
      eColi: { result: "Absent", std: "Not Specified" },
      salmonella: { result: "Absent", std: "Not Specified" },
      aerobicCount: { result: "< 1 cfu/ml", std: "Not Specified" },
    },
  },
  yellow: {
    key: "yellow",
    name: "Yellow Mustard Oil",
    tagline: "Smooth. Golden. A milder mustard.",
    shortDescription:
      "Cold Pressed Yellow Mustard Oil is single-pressed from premium yellow mustard seeds for a smoother, milder taste with all the goodness of cold pressed mustard oil.",
    pungency: "0.30%",
    accent: "#E7C25C",
    features: [
      "100% Pure Cold Pressed (Kachi Ghani) — single-pressed at low temperature",
      "Smooth, mild aroma with a gentler bite (Allyl Isothiocyanate 0.30%)",
      "Rich in natural Omega-3 & MUFA healthy fats",
      "Cholesterol free & free from trans fat",
      "No Argemone, no mineral oil, no synthetic colours — lab verified",
      "Chemical-free, hexane-free, no solvent processing",
      "FSSAI compliant & quality tested by NABL-accredited laboratory",
    ],
    lab: {
      type: { result: "Cold Pressed (Kachi Ghani)", std: "—" },
      moisture: { result: "0.18 % by weight", std: "0.25 % Max." },
      rancidity: { result: "Free From Rancidity", std: "Free From Rancidity" },
      saponification: { result: "172.20", std: "168 – 177" },
      unsaponifiable: { result: "0.81 % by weight", std: "NMT 1.2" },
      iodine: { result: "105.42", std: "96 – 112" },
      acid: { result: "1.17", std: "NMT 6.0" },
      mineralOil: { result: "Free From Mineral Oil", std: "Free From Mineral Oil" },
      argemone: { result: "Negative", std: "Negative" },
      refractiveIndex: { result: "1.4652", std: "1.4646 – 1.4662" },
      peroxide: { result: "BLQ (0.2) meq/kg", std: "NMT 10" },
      hcn: { result: "Passes the Test", std: "Passes the Test" },
      syntheticColours: { result: "Absent", std: "Absent" },
      allylIsothiocyanate: { result: "0.30 %", std: "NLT 0.20" },
      eColi: { result: "Absent", std: "Not Specified" },
      salmonella: { result: "Absent", std: "Not Specified" },
      aerobicCount: { result: "< 1 cfu/ml", std: "Not Specified" },
    },
  },
};

// Shared spec table footnote
export const labFootnote =
  "BLQ = Below Limit of Quantification · NMT = Not More Than · NLT = Not Less Than. Test reference: FSSR-2011 / IS:548. Report ref. FAST LABS FL/04/026.";

export const labLab = "FAST LABS (Food Analysis & Sample Testing Laboratories) — NABL & ISO/IEC 17025 accredited";

const PACK_META = {
  "1l": {
    label: "1 Litre",
    unit: "PET Bottle",
    skuSize: "1L",
    suitability: "Best for: nuclear families, first-time buyers, daily cooking.",
  },
  "2l": {
    label: "2 Litre",
    unit: "Can",
    skuSize: "2L",
    suitability: "Best for: regular households, monthly stock-up, better value per litre.",
  },
  "5l": {
    label: "5 Litre",
    unit: "Can",
    skuSize: "5L",
    suitability: "Best for: joint families, festive & bulk cooking, maximum savings.",
  },
  "15l": {
    label: "15 Litre",
    unit: "Tin",
    skuSize: "15L",
    suitability: "Best for: restaurants, caterers, food service, distributors & bulk supply.",
  },
};

const DESCRIPTIONS = {
  black: {
    "1l": "Our everyday kitchen companion — single-pressed black mustard oil in a convenient, food-grade 1 litre PET bottle. Sharp, aromatic, and ideal for daily Indian cooking, tadka, and pickling. The bottle is sized for the modern household that cooks fresh every day: lightweight and easy to pour, it keeps the oil sealed and protected from light so every drop stays as pungent and fragrant as the day it was pressed. Perfect for sabzi, dal tadka, fish and meat curries, paranthas, and achaar — a practical entry pack that lets new customers experience true Kachi Ghani character before moving up to larger value packs.",
    "2l": "A sturdy 2 litre tin can with a leak-proof cap and easy-grip handle — the smart value pack for regular cooks who don't want to refill too often. It delivers the same uncompromised cold pressed black mustard oil in a tin that shields the oil from light and air far better than clear plastic, helping preserve aroma and freshness for longer. Its handle and resealable cap make handling and storage effortless — an ideal mid-size pack for active family kitchens, weekend cooks, and households that go through mustard oil steadily through the month.",
    "5l": "The family value can. Five litres of pure cold pressed black mustard oil in a robust, light-proof tin built for joint families, festive cooking, and bulk home use. Designed for kitchens that cook in volume, it offers the strongest economy for home buyers while keeping the oil fresh inside a durable metal container. The wide pouring mouth and carry handle make it easy to decant into smaller bottles for daily use — a favourite for large families, festive and wedding-season cooking, tiffin and home-catering needs, and anyone who refuses to compromise on purity even when buying in bulk.",
    "15l": "Our institutional and HoReCa pack. A heavy-duty 15 litre tin of cold pressed black mustard oil for restaurants, caterers, cloud kitchens, and bulk buyers. It's built for professional and commercial kitchens that need consistent, high-quality mustard oil at scale — the same lab-tested cold pressed oil supplied in a tamper-evident, light-proof tin engineered for safe handling, stacking, and storage. Ideal for restaurants, dhabas, caterers, food processors, and distributors who want a dependable purity standard across every batch they serve.",
  },
  yellow: {
    "1l": "Mild, golden, and smooth — cold pressed yellow mustard oil in a handy 1 litre PET bottle. A lighter, gentler mustard flavour for everyday cooking, salads, and tempering. Pressed from premium yellow mustard seeds, this oil carries a softer aroma and a slightly milder bite than black mustard, making it a versatile choice for cooks who love mustard oil's health benefits with a gentler taste. Light, resealable, and easy to pour for daily use — great for sautéing, light frying, marinades, salad dressings, and tempering. A perfect introductory pack to discover the smoother side of mustard oil.",
    "2l": "A practical 2 litre tin can of smooth cold pressed yellow mustard oil — better value, longer freshness, and a leak-proof, easy-carry design. It offers the same golden, mildly pungent yellow mustard oil in a light-proof tin that protects flavour and nutrition for longer than clear packaging. With its handle and secure cap, it's the convenient mid-size choice for regular kitchens that prefer a gentler mustard profile — excellent for everyday cooking, light frying, achaar, and dressings, with a noticeably better price per litre than the single bottle.",
    "5l": "The family-size value can — five litres of smooth, cold pressed yellow mustard oil in a durable, light-proof tin for high-volume home kitchens. Built for joint families and frequent cooks, it delivers strong value while keeping the milder yellow mustard oil fresh inside a robust metal container. The wide mouth and carry handle make it easy to refill smaller bottles for daily use — ideal for large households, festive cooking, tiffin services, and anyone who prefers a gentler mustard taste in bulk without sacrificing cold pressed purity.",
    "15l": "The bulk and HoReCa pack — 15 litres of cold pressed yellow mustard oil for restaurants, caterers, and commercial kitchens that prefer a milder profile. It supplies professional kitchens with consistent, lab-tested cold pressed yellow mustard oil at scale, in a tamper-evident, light-proof tin engineered for safe handling, stacking, and storage in busy commercial settings. A reliable choice for restaurants, caterers, cloud kitchens, food processors, and distributors who want a smoother mustard flavour with full purity assurance on every batch.",
  },
};

const SHORT_LISTING = {
  black: {
    "1l": "Our everyday kitchen companion — single-pressed black mustard oil in a convenient 1 litre PET bottle. Sharp, aromatic, ideal for daily Indian cooking, tadka, and pickling.",
    "2l": "A sturdy 2 litre tin can with a leak-proof cap and easy-grip handle — the smart value pack for regular cooks who don't want to refill too often.",
    "5l": "The family value can. Five litres of pure cold pressed black mustard oil in a robust, light-proof tin built for joint families, festive cooking, and bulk home use.",
    "15l": "Our institutional and HoReCa pack. A heavy-duty 15 litre tin of cold pressed black mustard oil for restaurants, caterers, cloud kitchens, and bulk buyers.",
  },
  yellow: {
    "1l": "Mild, golden, and smooth — cold pressed yellow mustard oil in a handy 1 litre PET bottle. A lighter, gentler mustard flavour for everyday cooking, salads, and tempering.",
    "2l": "A practical 2 litre tin can of smooth cold pressed yellow mustard oil — better value, longer freshness, and a leak-proof, easy-carry design.",
    "5l": "The family-size value can — five litres of smooth, cold pressed yellow mustard oil in a durable, light-proof tin for high-volume home kitchens.",
    "15l": "The bulk and HoReCa pack — 15 litres of cold pressed yellow mustard oil for restaurants, caterers, and commercial kitchens that prefer a milder profile.",
  },
};

const MRP = {
  black: { "1l": 285, "2l": 545, "5l": 1299, "15l": 3599 },
  yellow: { "1l": 265, "2l": 505, "5l": 1199, "15l": 3349 },
};

const SIZES = ["1l", "2l", "5l", "15l"];
const VARIANT_CODE = { black: "BMO", yellow: "YMO" };

export const products = SIZES.flatMap((sizeKey) =>
  ["black", "yellow"].map((variant) => {
    const meta = PACK_META[sizeKey];
    return {
      slug: `${variant}-mustard-oil-${sizeKey}`,
      variant,
      sizeKey,
      size: meta.label,
      stockUnit: meta.unit,
      skuBase: `${VARIANT_CODE[variant]}-${meta.skuSize}-CP`,
      suitability: meta.suitability,
      mrp: MRP[variant][sizeKey],
      description: SHORT_LISTING[variant][sizeKey],
      fullDescription: DESCRIPTIONS[variant][sizeKey],
    };
  })
);

export function getProductBySlug(slug) {
  const product = products.find((p) => p.slug === slug);
  if (!product) return null;
  return { ...product, variantData: variants[product.variant] };
}

export function getAllProducts() {
  return products.map((p) => ({ ...p, variantData: variants[p.variant] }));
}

export function getSku(product, brand) {
  return `${brand.skuPrefix}-${product.skuBase}`;
}
