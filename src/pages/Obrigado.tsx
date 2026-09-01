import { useEffect, useState } from "react";
import { MessageCircle, ArrowLeft, Star, Check, Clock, MapPin, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { WHATSAPP_BASE, REVIEW_COUNT } from "@/constants/business";

interface ReceiptLine {
  label: string;
  qty: number;
  unitPrice: number | null;
  total: number | null;
}

interface ReceiptData {
  lines: ReceiptLine[];
  subtotal: number;
  discountLabel: string | null;
  discountAmount: number;
  total: number;
  sobOrcamento: boolean;
  location: string;
  slot: string;
  bookingId: string;
  name: string;
}

const GOOGLE_REVIEWS_URL = "https://www.google.com/search?q=Kyro%20Clean%20Solutions%20Reviews";

const fmt = (n: number | null) =>
  n === null ? "Sob orç." : `${(Math.round(n * 100) / 100).toFixed(2).replace(".", ",")}€`;

// Horário: Segunda a Sábado, 08:00 - 00:00 (fechado Domingo e 00:00-08:00)
function isWithinBusinessHours(date: Date): boolean {
  const day = date.getDay();
  if (day === 0) return false;
  return date.getHours() >= 8;
}

const Obrigado = () => {
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [waUrl, setWaUrl] = useState(WHATSAPP_BASE);
  const [isOpenNow] = useState(() => isWithinBusinessHours(new Date()));

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("kyro_receipt");
      if (raw) setReceipt(JSON.parse(raw));
      const wa = sessionStorage.getItem("kyro_wa_url");
      if (wa) setWaUrl(wa);
    } catch { /* ignore parse errors */ }
  }, []);

  const isSobOrcamento = receipt?.sobOrcamento ?? false;

  return (
    <div className="min-h-screen flex flex-col overflow-hidden bg-checker-dark">
      <Header />

      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-gold/[0.06] rounded-full blur-[80px]" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-900/20 rounded-full blur-[100px]" />
      </div>

      <main className="flex-1 flex flex-col items-center justify-start px-4 pt-24 pb-16 relative z-10">
        <div className="w-full max-w-md flex flex-col items-center">

          {/* ── HEADER ── */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative inline-flex items-center justify-center mb-4">
              <div className="absolute inset-0 rounded-full bg-gold/10 animate-ping" style={{ animationDuration: "2.8s" }} />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/30 flex items-center justify-center shadow-[0_0_40px_rgba(212,175,55,0.18)]">
                <Check className="w-9 h-9 text-gold" strokeWidth={2.5} />
              </div>
            </div>

            <p className="text-gold text-[10px] font-bold tracking-[0.28em] uppercase mb-1">KYRO CLEAN SOLUTIONS</p>
            <h1 className="font-playfair text-2xl sm:text-3xl font-bold text-white text-center leading-tight mb-2">
              Pedido de Orçamento Registado
            </h1>
            <div className="flex items-center gap-1.5 text-[11px] text-white/35">
              <Clock className="w-3.5 h-3.5" />
              {isOpenNow
                ? "Especialista contacta em menos de 30 minutos"
                : "Fora de horário, contactamos assim que reabrirmos (seg-sáb, 08:00-00:00)"}
            </div>
          </div>

          {/* ── RECEIPT CARD ── */}
          <div className="w-full backdrop-blur-xl border border-white/[0.10] rounded-2xl overflow-hidden mb-5 shadow-[0_8px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)]" style={{ background: "linear-gradient(180deg, #0a2922 0%, #071a12 100%)" }}>

            {/* Receipt header */}
            <div className="px-5 py-3 border-b border-white/[0.07] flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
                <span className="text-green-400 text-[10px] font-bold uppercase tracking-wider">Registado no sistema</span>
              </div>
              {receipt?.bookingId && (
                <span className="text-[10px] font-mono font-bold text-gold/70 bg-gold/10 border border-gold/20 px-2 py-0.5 rounded-full tracking-widest">
                  #{receipt.bookingId}
                </span>
              )}
            </div>

            {/* Meta: location + slot */}
            {receipt && (receipt.location || receipt.slot) && (
              <div className="px-5 py-3 border-b border-white/[0.07] flex flex-col gap-1.5">
                {receipt.location && (
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <MapPin className="w-3.5 h-3.5 text-gold/50 flex-shrink-0" />
                    <span>{receipt.location}</span>
                  </div>
                )}
                {receipt.slot && receipt.slot !== 'Não especificado' && (
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <CalendarDays className="w-3.5 h-3.5 text-gold/50 flex-shrink-0" />
                    <span>{receipt.slot}</span>
                  </div>
                )}
              </div>
            )}

            {/* ── LINE ITEMS TABLE ── */}
            {receipt && receipt.lines.length > 0 && (
              <>
                {/* Table header */}
                <div className="grid grid-cols-[1fr_auto_auto] gap-2 px-5 py-2 bg-white/[0.02] border-b border-white/[0.07]">
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Item</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/30 text-right">Qtd.</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/30 text-right">Preço</span>
                </div>

                {/* Lines */}
                {receipt.lines.map((line, i) => (
                  <div key={i} className="grid grid-cols-[1fr_auto_auto] gap-2 items-center px-5 py-2.5 border-b border-white/[0.05] last:border-0">
                    <span className="text-sm text-white/80 leading-snug pr-2">{line.label}</span>
                    <span className="text-xs text-white/40 text-right tabular-nums w-8">{line.qty}×</span>
                    <span className="text-sm font-bold text-white text-right tabular-nums whitespace-nowrap">
                      {fmt(line.total)}
                    </span>
                  </div>
                ))}
              </>
            )}

            {/* ── TOTALS ── */}
            {receipt && (
              <div className="border-t border-white/[0.10] bg-white/[0.02]">
                {/* Subtotal (only if there's a discount) */}
                {receipt.discountLabel && receipt.discountAmount > 0 && (
                  <div className="flex justify-between items-center px-5 py-2.5 border-b border-white/[0.05]">
                    <span className="text-xs text-white/40">Subtotal</span>
                    <span className="text-sm text-white/50 tabular-nums">{fmt(receipt.subtotal)}</span>
                  </div>
                )}

                {/* Discount line */}
                {receipt.discountLabel && receipt.discountAmount > 0 && (
                  <div className="flex justify-between items-center px-5 py-2.5 border-b border-white/[0.05] bg-gold/[0.05]">
                    <span className="text-xs font-bold text-gold">{receipt.discountLabel}</span>
                    <span className="text-sm font-bold text-gold tabular-nums">−{fmt(receipt.discountAmount)}</span>
                  </div>
                )}

                {/* Total */}
                <div className="flex justify-between items-center px-5 py-4">
                  <div>
                    <span className="text-sm font-black text-white uppercase tracking-wide">Total Estimado</span>
                    <p className="text-[9px] text-white/25 uppercase tracking-wide mt-0.5">Sujeito a confirmação</p>
                  </div>
                  <span className="font-playfair text-2xl font-bold text-gold tabular-nums">
                    {isSobOrcamento ? 'Sob orçamento' : fmt(receipt.total)}
                  </span>
                </div>
              </div>
            )}

            {/* No receipt data fallback */}
            {!receipt && (
              <div className="px-5 py-6 text-center">
                <p className="text-white/40 text-sm">Os dados do seu pedido foram enviados com sucesso.</p>
              </div>
            )}
          </div>

          {/* ── NOTICE ── */}
          <div className="w-full flex items-start gap-3 bg-gold/[0.05] border border-gold/20 rounded-2xl px-4 py-3.5 mb-6">
            <Check className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
            <p className="text-white/60 text-xs leading-relaxed">
              Um especialista Kyro entrará em contacto para confirmar os detalhes finais e agendar a visita.
            </p>
          </div>

          {/* ── CTA ── */}
          <div className="w-full flex flex-col items-center gap-3">
            <p className="text-[11px] text-white/35 text-center -mb-1">
              A forma mais rápida de confirmar o seu agendamento
            </p>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-14 flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] active:bg-[#1da853] text-white text-base font-bold rounded-2xl transition-all active:scale-[0.98] touch-manipulation shadow-[0_4px_28px_rgba(37,211,102,0.40)]"
            >
              <MessageCircle className="w-5 h-5 flex-shrink-0" />
              Confirmar via WhatsApp →
            </a>
            <button
              onClick={() => navigate("/")}
              className="flex items-center justify-center gap-1.5 text-xs text-white/20 hover:text-white/45 py-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Voltar à página inicial
            </button>
          </div>

          {/* ── TRUST SEAL ── */}
          <div className="flex flex-col items-center gap-2 mt-10">
            <div className="flex items-center justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-gold fill-gold" />
              ))}
            </div>
            <p className="text-white/30 text-xs text-center leading-snug">
              Classificação 5.0 com base em mais de {REVIEW_COUNT} avaliações verificadas no{' '}
              <a
                href={GOOGLE_REVIEWS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 font-semibold underline underline-offset-2 hover:text-white/75 transition-colors"
              >
                Google
              </a>
            </p>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Obrigado;
