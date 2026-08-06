import { Phone, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { GOOGLE_MAPS_URL } from "@/constants/google";
import { trackCallClick } from "@/lib/analytics";
import kyroLogo from "@/assets/kyro-logo.webp";
import { PHONE_TEL, PHONE_DISPLAY, BUSINESS_EMAIL_HREF, BUSINESS_EMAIL, BUSINESS_ADDRESS } from "@/constants/business";

/** English-only footer for the /en/ tourist pages. Kept lighter than the PT
 * Footer (no full sitewide sitemap of PT service links, which would be
 * useless/confusing to an English reader) but carries the same trust and
 * contact information. */
const EnFooter = () => {
  return (
    <footer className="bg-kyro-green text-white pt-10 md:pt-12 pb-10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex flex-col items-center gap-2 mb-4">
            <img src={kyroLogo} alt="Kyro Clean Solutions" className="h-16 md:h-20 w-auto object-contain" loading="lazy" />
            <span className="text-lg md:text-xl font-bold text-gold tracking-wide">Kyro Clean Solutions</span>
          </div>
          <p className="text-sm text-white/55 leading-relaxed max-w-xl mx-auto">
            Professional upholstery cleaning for sofas, mattresses and rugs, at your holiday rental. Professional extraction equipment, certified products, English-speaking team.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 max-w-3xl mx-auto text-center sm:text-left">
          <div>
            <h3 className="text-sm font-bold mb-2 text-white/80 uppercase tracking-wide">Call</h3>
            <a href={`tel:${PHONE_TEL}`} onClick={() => trackCallClick("en_footer")} className="flex items-center justify-center sm:justify-start gap-2 text-sm text-white/60 hover:text-gold transition-colors">
              <Phone className="w-3.5 h-3.5 flex-shrink-0" />
              {PHONE_DISPLAY}
            </a>
          </div>
          <div>
            <h3 className="text-sm font-bold mb-2 text-white/80 uppercase tracking-wide">Email</h3>
            <a href={BUSINESS_EMAIL_HREF} className="flex items-center justify-center sm:justify-start gap-2 text-sm text-white/60 hover:text-gold transition-colors break-all">
              <Mail className="w-3.5 h-3.5 flex-shrink-0" />
              {BUSINESS_EMAIL}
            </a>
          </div>
          <div>
            <h3 className="text-sm font-bold mb-2 text-white/80 uppercase tracking-wide">Based in</h3>
            <a href={GOOGLE_MAPS_URL} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center sm:justify-start gap-2 text-sm text-white/60 hover:text-gold transition-colors">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              {BUSINESS_ADDRESS.addressLocality}, Portugal
            </a>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>© {new Date().getFullYear()} Kyro Clean Solutions. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/politica-de-privacidade" className="hover:text-white/70 transition-colors">Privacy Policy</Link>
            <Link to="/termos-e-condicoes" className="hover:text-white/70 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default EnFooter;
