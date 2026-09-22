import { useEffect, useState } from "react";
import QuoteConfirmation, { type ConfirmationReceipt } from "@/components/QuoteConfirmation";
import { WHATSAPP_BASE } from "@/constants/business";

const Obrigado = () => {
  const [receipt, setReceipt] = useState<ConfirmationReceipt | null>(null);
  const [waUrl, setWaUrl] = useState(WHATSAPP_BASE);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("kyro_receipt");
      if (raw) setReceipt(JSON.parse(raw));
      const wa = sessionStorage.getItem("kyro_wa_url");
      if (wa) setWaUrl(wa);
    } catch { /* ignore parse errors */ }
  }, []);

  const previewReceipt: ConfirmationReceipt | null = import.meta.env.DEV && new URLSearchParams(window.location.search).get('exemplo') === 'pedido' ? {
    lines: [
      { label: 'Limpeza de sofá de 3 lugares', qty: 1, unitPrice: 79, total: 79 },
      { label: 'Limpeza de colchão de casal', qty: 1, unitPrice: 69, total: 69 },
      { label: 'Deslocação oferecida', qty: 1, unitPrice: 0, total: 0 },
    ],
    subtotal: 148, discountLabel: null, discountAmount: 0, total: 148,
    sobOrcamento: false, location: 'Lisboa', slot: 'A combinar com a equipa', bookingId: 'EXEMPLO', name: '',
  } : null;

  return <>{previewReceipt && <div className="bg-[#D4AF37] px-4 py-2 text-center text-xs font-semibold text-[#071a12]">Pré-visualização local · pedido ilustrativo, sem envio</div>}<QuoteConfirmation receipt={previewReceipt ?? receipt} waUrl={waUrl} /></>;
};

export default Obrigado;
