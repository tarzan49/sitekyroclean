import { Children, cloneElement, isValidElement, useId, useState, useEffect, type ReactElement, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { ChevronDown, Search, X } from "lucide-react";

interface LinkProps { children?: ReactNode; className?: string; to?: string; href?: string }
interface Props {
  title: ReactNode;
  children: ReactNode;
  dark?: boolean;
  language?: "pt" | "en";
  open?: boolean;
}

function nodeText(node: ReactNode): string {
  return Children.toArray(node).map(child => typeof child === "string" || typeof child === "number"
    ? String(child) : isValidElement<LinkProps>(child) ? nodeText(child.props.children) : "").join(" ");
}
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-PT").trim();

/** Accepts the existing Link elements, preserving their destinations and handlers. */
export default function DirectoryGroup({ title, children, dark = false, language = "pt", open }: Props) {
  const id = useId();
  const { pathname } = useLocation();
  const [query, setQuery] = useState("");
  useEffect(() => setQuery(""), [pathname]);
  const links = Children.toArray(children).filter((child): child is ReactElement<LinkProps> => isValidElement<LinkProps>(child));
  const search = normalize(query);
  const matches = links.filter(link => normalize(nodeText(link.props.children)).includes(search));
  const en = language === "en";
  if (!links.length) return null;

  return (
    <details key={pathname} open={open} className={`group/directory border-b ${dark ? "border-white/15 text-white" : "border-[#E8E4DE] text-[#111111]"}`}>
      <summary className="flex min-h-16 cursor-pointer list-none items-center gap-4 py-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D4AF37] [&::-webkit-details-marker]:hidden">
        <span className="flex-1 text-base font-semibold leading-relaxed">{title}</span>
        <span className={`text-xs tabular-nums ${dark ? "text-white/60" : "text-[#666]"}`}>{links.length}</span>
        <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 text-[#B8912A] transition-transform group-open/directory:rotate-180" />
      </summary>
      <div className="pb-5">
        {links.length >= 8 && <div className="relative mb-3 max-w-lg">
          <label htmlFor={id} className="sr-only">{en ? "Search" : "Pesquisar"}: {title}</label>
          <Search aria-hidden="true" className="absolute left-3 top-4 h-4 w-4 text-[#857443]" />
          <input id={id} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={en ? "Search this list…" : "Pesquisar nesta lista…"}
            className={`min-h-12 w-full rounded-md border py-3 pl-10 pr-12 text-base focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/60 [&::-webkit-search-cancel-button]:appearance-none ${dark ? "border-white/20 bg-white/5 text-white placeholder:text-white/50" : "border-[#E8E4DE] bg-white text-[#111111] placeholder:text-[#777]"}`} />
          {query && <button type="button" aria-label={en ? "Clear search" : "Limpar pesquisa"} onClick={() => setQuery("")} className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D4AF37]"><X aria-hidden="true" className="h-4 w-4" /></button>}
        </div>}
        {search && <p role="status" className={`mb-2 text-sm ${dark ? "text-white/65" : "text-[#666]"}`}>{matches.length ? `${matches.length} ${en ? "results" : "resultados"}` : en ? "No results. Try another name." : "Sem resultados. Experimente outro nome."}</p>}
        <div className="grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
          {links.map(link => cloneElement(link, {
            // Keep every destination in the HTML, including while filtering.
            className: `${matches.includes(link) ? "flex" : "hidden"} min-h-11 items-center gap-2 py-2 pr-2 text-sm leading-relaxed hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D4AF37] [&_svg]:hidden ${dark ? "text-white/75 hover:text-white" : "text-[#444] hover:text-[#96731D]"} ${link.props.className?.includes("capitalize") ? "capitalize" : ""}`,
          }))}
        </div>
      </div>
    </details>
  );
}
