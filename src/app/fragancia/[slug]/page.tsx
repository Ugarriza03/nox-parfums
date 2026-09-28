import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product/ProductDetail";
import { PRODUCTS, getProduct } from "@/data/products";
import { siteConfig } from "@/config/site";

interface Params {
  params: { slug: string };
}

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ slug: product.slug }));
}

export function generateMetadata({ params }: Params): Metadata {
  const product = getProduct(params.slug);
  if (!product) return { title: "Fragancia no encontrada" };

  const description = product.olfactory
    ? `${product.olfactory.feel} Extrait de Parfum NOX en ${siteConfig.volumeMl} ml.`
    : `Extrait de Parfum NOX en ${siteConfig.volumeMl} ml, ${product.inspiredLabel.toLowerCase()}.`;

  return {
    title: `${product.inspiredLabel}`,
    description,
    alternates: { canonical: `/fragancia/${product.slug}` },
    openGraph: {
      title: `NOX — ${product.inspiredLabel}`,
      description
    }
  };
}

export default function FragrancePage({ params }: Params) {
  const product = getProduct(params.slug);
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
