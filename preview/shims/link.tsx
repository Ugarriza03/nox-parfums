/** Shim de next/link para el preview estático. */
import type { AnchorHTMLAttributes, ReactNode } from "react";

interface Props extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  children: ReactNode;
  prefetch?: boolean;
}

export default function Link({ href, children, prefetch, ...rest }: Props) {
  const external = /^https?:|^mailto:|^tel:/.test(href);
  return (
    <a href={external ? href : `#${href}`} {...rest}>
      {children}
    </a>
  );
}
