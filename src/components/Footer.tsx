import { Phone, Mail, MapPin, ChevronRight } from "lucide-react";
import { GOOGLE_MAPS_URL } from "@/constants/google";
import { Link } from "react-router-dom";
import { trackCallClick } from "@/lib/analytics";
import kyroLogo from "@/assets/kyro-logo.webp";
import { PHONE_TEL, PHONE_DISPLAY, BUSINESS_EMAIL_HREF, BUSINESS_EMAIL, BUSINESS_ADDRESS } from "@/constants/business";

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
            />
            <span className="text-lg md:text-xl font-bold text-gold tracking-wide">Kyro Clean Solutions</span>
          </div>
          <p className="text-sm text-white/55 leading-relaxed max-w-xl mx-auto">
            Especialistas em higienização e impermeabilização profissional de sofás, colchões, tapetes e cadeiras, ao domicílio. Equipamento de extração profissional e produtos certificados, com cobertura em Portugal Continental inteiro.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 md:gap-6 mb-5">
          {/* Services */}
          <div>
            <h3 className="text-base md:text-lg font-bold mb-3 md:mb-4 text-white">Serviços Kyro Clean Solutions</h3>
            <ul className="space-y-2 md:space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <ChevronRight className="h-3.5 w-3.5 text-turquoise flex-shrink-0" />
                <Link to="/limpeza-sofas" className="hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">Higienização de Sofás</Link>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-3.5 w-3.5 text-turquoise flex-shrink-0" />
                <Link to="/impermeabilizacao" className="hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">Impermeabilização de Sofás</Link>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-3.5 w-3.5 text-turquoise flex-shrink-0" />
                <Link to="/limpeza-tapetes" className="hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">Higienização de Tapetes</Link>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-3.5 w-3.5 text-turquoise flex-shrink-0" />
                <Link to="/impermeabilizacao" className="hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">Impermeabilização de Tapetes</Link>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-3.5 w-3.5 text-turquoise flex-shrink-0" />
                <Link to="/limpeza-colchoes" className="hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">Higienização de Colchões</Link>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-3.5 w-3.5 text-turquoise flex-shrink-0" />
                <Link to="/limpeza-cadeiras" className="hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">Higienização de Cadeiras</Link>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-3.5 w-3.5 text-turquoise flex-shrink-0" />
                <Link to="/impermeabilizacao" className="hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">Impermeabilização de Cadeiras</Link>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-3.5 w-3.5 text-turquoise flex-shrink-0" />
                <Link to="/limpeza-alcatifas" className="hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">Higienização de Alcatifas</Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-base md:text-lg font-bold mb-3 md:mb-4 text-white">Recursos</h3>
            <ul className="space-y-2 text-sm mb-4">
              <li className="flex items-center gap-2">
                <ChevronRight className="h-3.5 w-3.5 text-turquoise flex-shrink-0" />
                <Link to="/blog" className="hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">Blog</Link>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-3.5 w-3.5 text-turquoise flex-shrink-0" />
                <Link to="/perguntas-frequentes-limpeza-estofos" className="hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">Perguntas Frequentes</Link>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-3.5 w-3.5 text-turquoise flex-shrink-0" />
                <Link to="/glossario-limpeza-estofos" className="hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">Glossário</Link>
              </li>
            </ul>
            <h3 className="text-base md:text-lg font-bold mb-3 text-white">Packs</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <ChevronRight className="h-3.5 w-3.5 text-turquoise flex-shrink-0" />
                <Link to="/pack-sofa-e-colchao-porto" className="hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">Pack Sofá + Colchão</Link>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-3.5 w-3.5 text-turquoise flex-shrink-0" />
                <Link to="/pack-sofa-impermeabilizacao-porto" className="hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">Pack Sofá + Impermeabilização</Link>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-3.5 w-3.5 text-turquoise flex-shrink-0" />
                <Link to="/pack-sala-completa-porto" className="hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">Pack Sala Completa</Link>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-3.5 w-3.5 text-turquoise flex-shrink-0" />
                <Link to="/pack-quarto-completo-porto" className="hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">Pack Quarto Completo</Link>
              </li>
            </ul>
          </div>

          {/* Problems & About */}
          <div>
            <h3 className="text-base md:text-lg font-bold mb-3 md:mb-4 text-white">Problemas Comuns</h3>
            <ul className="space-y-2 text-sm mb-4">
              <li className="flex items-center gap-2">
                <ChevronRight className="h-3.5 w-3.5 text-turquoise flex-shrink-0" />
                <Link to="/problemas/manchas-sofa" className="hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">Manchas no Sofá</Link>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-3.5 w-3.5 text-turquoise flex-shrink-0" />
                <Link to="/problemas/cheiro-sofa" className="hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">Cheiro no Sofá</Link>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-3.5 w-3.5 text-turquoise flex-shrink-0" />
                <Link to="/problemas/acaros-colchao" className="hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">Ácaros no Colchão</Link>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-3.5 w-3.5 text-turquoise flex-shrink-0" />
                <Link to="/problemas/urina-colchao" className="hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">Urina no Colchão</Link>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-3.5 w-3.5 text-turquoise flex-shrink-0" />
                <Link to="/problemas/pelos-animais-sofa" className="hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">Pelos de Animais</Link>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-3.5 w-3.5 text-turquoise flex-shrink-0" />
                <Link to="/problemas/impermeabilizar-sofa" className="hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">Impermeabilizar Sofá</Link>
              </li>
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h3 className="text-base md:text-lg font-bold mb-3 md:mb-4 text-white">Fale Connosco</h3>
            <div className="space-y-3 text-sm">
              <a href={`tel:${PHONE_TEL}`} onClick={() => trackCallClick('footer')} className="flex items-center gap-2 hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">
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
                  <p className="text-xs text-turquoise/70 mt-0.5">Ver no Google Maps ↗</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-4">
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs md:text-sm text-white/50 text-center">
              © 2025 Kyro Clean Solutions. Todos os direitos reservados.
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center">
              <Link
                to="/politica-de-privacidade"
                className="text-xs text-white/60 hover:text-turquoise active:text-turquoise transition-colors underline underline-offset-2"
              >
                Política de Privacidade
              </Link>
              <Link
                to="/termos-e-condicoes"
                className="text-xs text-white/60 hover:text-turquoise active:text-turquoise transition-colors underline underline-offset-2"
              >
                Termos e Condições
              </Link>
              <Link
                to="/politica-de-devolucoes"
                className="text-xs text-white/60 hover:text-turquoise active:text-turquoise transition-colors underline underline-offset-2"
              >
                Política de Devoluções
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
