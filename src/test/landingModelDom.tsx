// Em produção, o modelo da landing page chega ao React dentro do HTML que o
// prerender gerou (ver `scripts/prerender.ts` e `landingModelBootstrap.ts`).
// Os testes que montam `LandingServiceSections` têm de reproduzir isso, senão
// exercitam o caminho de navegação interna em vez do caminho por onde entram
// praticamente todos os visitantes.
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactElement } from 'react';
import { getLandingPageModel } from '../data/landingPageModel';
import { LANDING_MODEL_ELEMENT_ID } from '../data/landingModelBootstrap';

/** Escreve o modelo da rota no documento, tal como o build faz. */
export function installLandingModel(route: string) {
  const model = getLandingPageModel(route);
  let el = document.getElementById(LANDING_MODEL_ELEMENT_ID);
  if (!el) {
    el = document.createElement('script');
    el.id = LANDING_MODEL_ELEMENT_ID;
    el.setAttribute('type', 'application/json');
    document.body.appendChild(el);
  }
  // O modelo passa por JSON como passa em produção, para os testes verem
  // exatamente a mesma estrutura que o browser vê (sem undefined, sem Date).
  el.textContent = JSON.stringify(model);
  return model;
}

export function clearLandingModel() {
  document.getElementById(LANDING_MODEL_ELEMENT_ID)?.remove();
}

/** Instala o modelo da rota e renderiza o componente nessa rota. */
export function renderAtRoute(route: string, ui: ReactElement) {
  const model = installLandingModel(route);
  return { model, ...render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>) };
}
