import BusinessConditions from './BusinessConditions';
import { Phone, Mail, MapPin, ChevronRight } from "lucide-react";
import { GOOGLE_MAPS_URL } from "@/constants/google";
import { Link } from "react-router-dom";
import { FOOTER_NAV, FOOTER_STRIP_LINKS, FOOTER_LEGAL_LINKS } from "@/data/siteFooterNav";
import kyroLogo from "@/assets/kyro-logo.webp";
import { PHONE_TEL, PHONE_DISPLAY, BUSINESS_EMAIL_HREF, BUSINESS_EMAIL, BUSINESS_ADDRESS, BUSINESS_TAX_ID } from "@/constants/business";

const Footer = () => {
  return (
    <footer className="bg-kyro-green text-white pt-6 md:pt-8 pb-24" style={{ paddingBottom: 'max(6rem, calc(6rem + env(safe-area-inset-bottom)))' }}>
      <div className="container mx-auto px-4">
        {/* Logo Section */}
        <div className="text-center mb-4 md:mb-5">
          <div className="inline-flex flex-col items-center gap-2 mb-4">
            <img
              src={kyroLogo}
              alt="Kyro Clean Solutions"
              className="h-16 md:h-20 w-auto object-contain"
              loading="lazy"
              width={1024}
              height={1024}
            />
            <span className="text-lg md:text-xl font-bold text-gold tracking-wide">Kyro Clean Solutions</span>
          </div>
          <p className="text-base text-white/80 leading-relaxed max-w-xl mx-auto">
            Especialistas em higienização de sofás, colchões, tapetes e cadeiras, e impermeabilização profissional de sofás e cadeiras, ao domicílio. Equipamento de extração profissional e produtos certificados, com cobertura no litoral entre Viana do Castelo e o Algarve; outras zonas mediante confirmação.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 md:gap-6 mb-5">
          {/* As três primeiras colunas e a coluna Empresas saem de
              FOOTER_NAV, que é a mesma lista que o prerender escreve no HTML
              estático. Escritas à mão dos dois lados, divergiam em silêncio. */}
          {FOOTER_NAV.map(group => (
            <div key={group.title}>
              <h3 className="type-card-title    mb-3 md:mb-4 text-white">{group.title}</h3>
              <ul className="space-y-2 text-base mb-4">
                {group.links.map(link => (
                  <li key={link.href + link.label} className="flex items-center gap-2">
                    <ChevronRight className="h-3.5 w-3.5 text-turquoise flex-shrink-0" />
                    <Link to={link.href} className="hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">{link.label}</Link>
                  </li>
                ))}
              </ul>
              {/* O bloco Packs fica de fora do FOOTER_NAV de propósito: as
                  quatro entradas apontam todas para /packs, que já é a página
                  mais ligada do site e está a ser retrabalhada. Ver o
                  comentário em siteFooterNav.ts. */}
              {group.title === 'Recursos' && (
                <>
                  <h3 className="type-card-title    mb-3 text-white">Packs</h3>
                  <ul className="space-y-2 text-base">
                    {['Pack Sofá + Colchão', 'Pack Sofá + Impermeabilização', 'Pack Sala Completa', 'Pack Quarto Completo'].map(label => (
                      <li key={label} className="flex items-center gap-2">
                        <ChevronRight className="h-3.5 w-3.5 text-turquoise flex-shrink-0" />
                        <Link to="/packs" className="hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">{label}</Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ))}

          {/* Contacts */}
          <div>
            <h3 className="type-card-title    mb-3 md:mb-4 text-white">Fale Connosco</h3>
            <div className="space-y-3 text-base">
              <a href={`tel:${PHONE_TEL}`} data-tracking-source="footer" className="flex items-center gap-2 hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">
                <Phone className="h-4 w-4 text-turquoise flex-shrink-0" />
                <span>{PHONE_DISPLAY}</span>
              </a>
              <a href={BUSINESS_EMAIL_HREF} className="flex items-center gap-2 hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">
                <Mail className="h-4 w-4 text-turquoise flex-shrink-0" />
                <span className="break-all">{BUSINESS_EMAIL}</span>
              </a>
              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 py-1 hover:text-turquoise active:text-turquoise transition-colors touch-manipulation"
              >
                <MapPin className="h-4 w-4 text-turquoise mt-0.5 flex-shrink-0" />
                <div>
                  <p>{BUSINESS_ADDRESS.streetAddress}</p>
                  <p>{BUSINESS_ADDRESS.postalCode} {BUSINESS_ADDRESS.addressLocality}</p>
                  <p className="text-sm text-turquoise/70 mt-0.5">Ver no Google Maps ↗</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-4">
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm md:text-base text-white/80 text-center">
              © 2025 Kyro Clean Solutions. Todos os direitos reservados.
              {BUSINESS_TAX_ID && <> NIF {BUSINESS_TAX_ID}.</>}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center">
              {FOOTER_LEGAL_LINKS.map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-sm text-white/80 hover:text-turquoise active:text-turquoise transition-colors underline underline-offset-2"
                >
                  {link.label}
                </Link>
              ))}
              {/* Exigência legal para quem vende a consumidores em Portugal e,
                  ao mesmo tempo, um sinal de confiança que o site não dava:
                  aponta para a plataforma oficial, não para uma página nossa. */}
              <a
                href="https://www.livroreclamacoes.pt/inicio"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/80 hover:text-turquoise active:text-turquoise transition-colors underline underline-offset-2"
              >
                Livro de Reclamações
              </a>
            </div>
          </div>
        </div>
      </div>
    <div className="max-w-7xl mx-auto px-5 py-8 text-base text-white/70"><p>Equipas em Braga, Porto, Lisboa e Algarve. Outras localidades mediante confirmação.</p><p className="mt-2">Resposta em menos de 10 minutos · Deslocação a partir de 10€</p><div className="flex flex-wrap gap-4 mt-4">{FOOTER_STRIP_LINKS.map(link => <Link key={link.href} to={link.href}>{link.label}</Link>)}</div></div>
    <BusinessConditions />
    </footer>
  );
};

export default Footer;
