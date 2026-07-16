// Yugika Foods Private Limited is the parent company.
// The same products are sold under two brand names depending on market:
//   - "marutinandan" — domestic (India) labelling
//   - "yugika"       — export / international labelling
// Everything else (formulation, packaging sizes, lab data) is identical.

export const company = {
  legalName: "Yugika Foods Private Limited",
  shortName: "Yugika Foods",
  headerTagline: "Marutinandan (India) · Yugika (Export)",
  description:
    "Yugika Foods Private Limited is the parent company behind Marutinandan and Yugika — cold pressed, lab-tested edible oils made the traditional way, for kitchens in India and around the world.",
};

export const brands = {
  marutinandan: {
    key: "marutinandan",
    market: "Domestic (India)",
    name: "Marutinandan",
    fullName: "MARUTINANDAN",
    tagline: "Cold Pressed Mustard Oil",
    skuPrefix: "MNN",
    logo: { type: "mark", initials: "Mn" },
    accent: {
      cream: "#FBF3DF",
      creamDeep: "#F3E7C6",
      creamPaper: "#FFFDF7",
      ink: "#241B10",
      pine: "#153826",
      pineDeep: "#0F2B1E",
      gold: "#D3A02E",
      goldLight: "#F0CB6E",
      goldDeep: "#A97C1C",
    },
  },
  yugika: {
    key: "yugika",
    market: "Export / International",
    name: "Yugika",
    fullName: "YUGIKA",
    tagline: "Cold Pressed Mustard Oil",
    skuPrefix: "YGK",
    logo: { type: "image", src: "/images/yugika-logo.jpg" },
    accent: {
      cream: "#FBF3DF",
      creamDeep: "#F3E7C6",
      creamPaper: "#FFFDF7",
      ink: "#241B10",
      pine: "#1E5C33",
      pineDeep: "#123C21",
      gold: "#E3922B",
      goldLight: "#F2B65C",
      goldDeep: "#B8701C",
    },
  },
};

export const futureProducts = [
  {
    key: "groundnut-oil",
    name: "Groundnut Oil",
    status: "Coming Soon",
    description: "Premium cold-pressed groundnut oil, naturally processed for a rich and wholesome flavour.",
    image: null,
  },
  {
    key: "sesame-oil",
    name: "Sesame Oil",
    status: "Coming Soon",
    description: "Cold pressed sesame oil, rich, nutty, and pressed with the same purity standards.",
    image: null,
  },
  {
    key: "sunflower-oil",
    name: "Sunflower Oil",
    status: "Coming Soon",
    description: "Naturally processed cold-pressed sunflower oil, perfect for healthy everyday cooking.",
    image: null,
  },
];