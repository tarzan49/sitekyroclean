import { Fragment } from "react";
import { Link } from "react-router-dom";

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

/**
 * Hero breadcrumb nav, shared by every SEO page family (Localização,
 * Freguesia, Problema, Material, Preço, Marca, Comercial, EN). The last
 * item is the current page — pass it without `to` to render it as plain
 * text instead of a link.
 */
const PageBreadcrumb = ({ items }: { items: BreadcrumbItem[] }) => (
  <nav className="flex items-center gap-1.5 text-xs text-white/50 mb-6 flex-wrap" aria-label="Breadcrumb">
    {items.map((item, i) => (
      <Fragment key={i}>
        {i > 0 && <span>/</span>}
        {item.to ? (
          <Link to={item.to} className="hover:text-white/80 transition-colors">{item.label}</Link>
        ) : (
          <span className="text-white/70">{item.label}</span>
        )}
      </Fragment>
    ))}
  </nav>
);

export default PageBreadcrumb;
