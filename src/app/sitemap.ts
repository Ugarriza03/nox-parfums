import type { MetadataRoute } from "next";
import { PRODUCTS } from "@/data/products";
import { siteConfig } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/catalogo",
    "/asesor",
    "/mayoristas",
    "/como-comprar",
    "/envios",
    "/preguntas-frecuentes",
    "/contacto"
  ].map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7
  }));

  const products = PRODUCTS.map((product) => ({
    url: `${siteConfig.url}/fragancia/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6
  }));

  return [...routes, ...products];
}
