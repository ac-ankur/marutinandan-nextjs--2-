import { products } from "@/data/products";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.marutinandan.in";

export default function sitemap() {
  const staticRoutes = [
    "",
    "/story",
    "/products",
    "/lab-report",
    "/about",
    "/contact",
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));

  const productRoutes = products.map((p) => ({
    url: `${BASE_URL}/products/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes];
}
