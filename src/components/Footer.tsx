import { Phone, Mail, MapPin } from "lucide-react";
import { GOOGLE_MAPS_URL } from "@/constants/google";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { trackCallClick } from "@/lib/analytics";
import kyroLogo from "@/assets/kyro-logo.webp";

const Footer = () => {
  const { t } = useTranslation();

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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 md:gap-6 mb-5">
          {/* Services */}
          <div>
            <h3 className="text-base md:text-lg font-bold mb-3 md:mb-4 text-white">{t('footer.servicesTitle')}</h3>
            <ul className="space-y-2 md:space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-turquoise">≡</span>
                <Link to="/limpeza-sofas" className="hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">{t('services.items.sofas.title')}</Link>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-turquoise">≡</span>
                <Link to="/impermeabilizacao" className="hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">{t('services.items.waterproofingSofas.title')}</Link>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-turquoise">≡</span>
                <Link to="/limpeza-tapetes" className="hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">{t('services.items.carpets.title')}</Link>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-turquoise">≡</span>
                <Link to="/impermeabilizacao" className="hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">{t('services.items.waterproofingCarpets.title')}</Link>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-turquoise">≡</span>
                <Link to="/limpeza-colchoes" className="hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">{t('services.items.mattresses.title')}</Link>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-turquoise">≡</span>
                <Link to="/limpeza-cadeiras" className="hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">{t('services.items.chairs.title')}</Link>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-turquoise">≡</span>
                <Link to="/impermeabilizacao" className="hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">{t('services.items.waterproofingChairs.title')}</Link>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-turquoise">≡</span>
                <Link to="/limpeza-alcatifas" className="hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">{t('services.items.headboards.title')}</Link>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-turquoise">≡</span>
                <Link to="/impermeabilizacao" className="hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">{t('services.items.waterproofingHeadboards.title')}</Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-base md:text-lg font-bold mb-3 md:mb-4 text-white">Recursos</h3>
            <ul className="space-y-2 text-sm mb-4">
              <li className="flex items-center gap-2">
                <span className="text-turquoise">≡</span>
                <Link to="/blog" className="hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">Blog</Link>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-turquoise">≡</span>
                <Link to="/perguntas-frequentes-limpeza-estofos" className="hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">Perguntas Frequentes</Link>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-turquoise">≡</span>
                <Link to="/glossario-limpeza-estofos" className="hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">Glossário</Link>
              </li>
            </ul>
            <h3 className="text-base md:text-lg font-bold mb-3 text-white">Packs</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-turquoise">≡</span>
                <Link to="/pack-sofa-e-colchao-porto" className="hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">Pack Sofá + Colchão</Link>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-turquoise">≡</span>
                <Link to="/pack-sofa-impermeabilizacao-porto" className="hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">Pack Sofá + Impermeabilização</Link>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-turquoise">≡</span>
                <Link to="/pack-sala-completa-porto" className="hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">Pack Sala Completa</Link>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-turquoise">≡</span>
                <Link to="/pack-quarto-completo-porto" className="hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">Pack Quarto Completo</Link>
              </li>
            </ul>
          </div>

          {/* Problems & About */}
          <div>
            <h3 className="text-base md:text-lg font-bold mb-3 md:mb-4 text-white">Problemas Comuns</h3>
            <ul className="space-y-2 text-sm mb-4">
              <li className="flex items-center gap-2">
                <span className="text-turquoise">≡</span>
                <Link to="/problemas/manchas-sofa" className="hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">Manchas no Sofá</Link>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-turquoise">≡</span>
                <Link to="/problemas/cheiro-sofa" className="hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">Cheiro no Sofá</Link>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-turquoise">≡</span>
                <Link to="/problemas/acaros-colchao" className="hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">Ácaros no Colchão</Link>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-turquoise">≡</span>
                <Link to="/problemas/cheiro-urina-colchao" className="hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">Urina no Colchão</Link>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-turquoise">≡</span>
                <Link to="/problemas/pelos-animais-sofa" className="hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">Pelos de Animais</Link>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-turquoise">≡</span>
                <Link to="/problemas/impermeabilizar-sofa" className="hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">Impermeabilizar Sofá</Link>
              </li>
            </ul>
            <p className="text-sm text-[#1A1A2E]/25 leading-relaxed">
              {t('footer.aboutText')}
            </p>
          </div>

          {/* Contacts */}
          <div>
            <h3 className="text-base md:text-lg font-bold mb-3 md:mb-4 text-white">{t('footer.contactTitle')}</h3>
            <div className="space-y-3 text-sm">
              <a href="tel:925530647" onClick={() => trackCallClick('footer')} className="flex items-center gap-2 hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">
                <Phone className="h-4 w-4 text-turquoise flex-shrink-0" />
                <span>925 530 647</span>
              </a>
              <a href="mailto:cleansolutions.pt25@gmail.com" className="flex items-center gap-2 hover:text-turquoise active:text-turquoise transition-colors py-1 touch-manipulation">
                <Mail className="h-4 w-4 text-turquoise flex-shrink-0" />
                <span className="break-all">cleansolutions.pt25@gmail.com</span>
              </a>
              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 py-1 hover:text-turquoise active:text-turquoise transition-colors touch-manipulation"
              >
                <MapPin className="h-4 w-4 text-turquoise mt-0.5 flex-shrink-0" />
                <div>
                  <p>R. de António Cardoso 263</p>
                  <p>4150-081 Porto</p>
                  <p className="text-xs text-turquoise/70 mt-0.5">Ver no Google Maps ↗</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Social & Bottom */}
        <div className="border-t border-white/10 pt-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col items-center md:items-start gap-1">
              <p className="text-xs md:text-sm text-[#1A1A2E]/40 text-center md:text-left">
                {t('footer.copyright')}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center md:justify-start">
                <Link
                  to="/politica-de-privacidade"
                  className="text-xs text-[#1A1A2E]/55 hover:text-turquoise active:text-turquoise transition-colors underline underline-offset-2"
                >
                  Política de Privacidade
                </Link>
                <Link
                  to="/termos-e-condicoes"
                  className="text-xs text-[#1A1A2E]/55 hover:text-turquoise active:text-turquoise transition-colors underline underline-offset-2"
                >
                  Termos e Condições
                </Link>
                <Link
                  to="/politica-de-devolucoes"
                  className="text-xs text-[#1A1A2E]/55 hover:text-turquoise active:text-turquoise transition-colors underline underline-offset-2"
                >
                  Política de Devoluções
                </Link>
              </div>
            </div>
            <div>
              <h4 className="text-xs md:text-sm font-semibold mb-2 text-center md:text-right">{t('footer.followUs')}</h4>
              <div className="flex gap-3 justify-center md:justify-end">
                <a
                  href="https://cleansolutions.com.pt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 bg-turquoise hover:bg-turquoise-light active:bg-turquoise-light rounded-full flex items-center justify-center transition-colors touch-manipulation"
                  aria-label="Website"
                >
                  <MapPin className="h-5 w-5 text-white" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
