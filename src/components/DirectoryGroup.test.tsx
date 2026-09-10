import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter, Link } from "react-router-dom";
import { renderToStaticMarkup } from "react-dom/server";
import DirectoryGroup from "./DirectoryGroup";

afterEach(cleanup);
const links = ['Guimarães', 'Porto', 'Lisboa', 'Faro', 'Lagos', 'Sintra', 'Cascais', 'Maia'].map((name, i) => <Link key={name} to={`/cidade-${i}`}>{name}</Link>);
describe('DirectoryGroup', () => {
  it('keeps every destination in server HTML while collapsed', () => {
    const html = renderToStaticMarkup(<MemoryRouter><DirectoryGroup title="Localidades">{links}</DirectoryGroup></MemoryRouter>);
    expect(html).toContain('<details');
    expect(html).not.toContain('<details open');
    for (let i=0; i<links.length; i++) expect(html).toContain(`href="/cidade-${i}"`);
  });
  it('searches without accents, preserves destinations and clears the filter', () => {
    const {container} = render(<MemoryRouter><DirectoryGroup title="Localidades">{links}</DirectoryGroup></MemoryRouter>);
    container.querySelector('details')!.open = true;
    fireEvent.change(screen.getByRole('searchbox'), {target:{value:'guimaraes'}});
    expect(screen.getByRole('link', {name:'Guimarães'}).getAttribute('href')).toBe('/cidade-0');
    expect(container.querySelectorAll('a.hidden')).toHaveLength(7);
    expect(container.querySelectorAll('a')).toHaveLength(8);
    fireEvent.change(screen.getByRole('searchbox'), {target:{value:'zzzz'}});
    expect(screen.getByRole('status').textContent).toContain('Sem resultados');
    fireEvent.click(screen.getByRole('button', {name:'Limpar pesquisa'}));
    expect(container.querySelectorAll('a.hidden')).toHaveLength(0);
  });
});
