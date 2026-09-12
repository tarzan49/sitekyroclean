import { useCallback, useEffect, useRef, useState } from "react";
import { QrCode, Wifi, WifiOff, RefreshCw } from "lucide-react";

const KYRO_URL = (import.meta.env.VITE_KYRO_LOCAL_URL as string | undefined) || "http://localhost:3010";

type Status = { instance: string; state: string } | null;

/**
 * Liga diretamente ao servidor local do kyro-clean-solutions (bun run serve,
 * localhost:3010) — só funciona quando esse servidor está a correr na mesma
 * máquina, nunca em produção (Cloudflare Pages não alcança localhost).
 */
const KyroConnectionStatus = () => {
  const [status, setStatus] = useState<Status>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [reachable, setReachable] = useState(true);
  const [loadingQr, setLoadingQr] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${KYRO_URL}/api/status`);
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      setStatus({ instance: data.instance, state: data.state });
      setReachable(true);
      if (data.state !== "open") setQr(null);
    } catch {
      setReachable(false);
      setStatus(null);
    }
  }, []);

  const fetchQr = useCallback(async () => {
    setLoadingQr(true);
    try {
      const res = await fetch(`${KYRO_URL}/api/qr`);
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      setQr(data.base64 ?? null);
      setReachable(true);
    } catch {
      setReachable(false);
    } finally {
      setLoadingQr(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    pollRef.current = setInterval(fetchStatus, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchStatus]);

  const isOpen = status?.state === "open";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          {!reachable ? (
            <WifiOff className="w-4 h-4 text-gray-300" />
          ) : isOpen ? (
            <Wifi className="w-4 h-4 text-emerald-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-400" />
          )}
          <div>
            <p className="text-sm font-semibold text-navy">
              {!reachable
                ? "Servidor local do Kyro não está a responder"
                : isOpen
                ? "WhatsApp ligado"
                : "WhatsApp desligado"}
            </p>
            <p className="text-xs text-gray-400">
              {!reachable
                ? `Confirma que "bun run serve" está a correr em ${KYRO_URL} (só funciona nesta máquina)`
                : `Instância "${status?.instance}" · ${KYRO_URL}`}
            </p>
          </div>
        </div>
        {reachable && !isOpen && (
          <button
            onClick={fetchQr}
            disabled={loadingQr}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 text-navy hover:border-navy/30 transition-colors disabled:opacity-50"
          >
            {loadingQr ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <QrCode className="w-3.5 h-3.5" />}
            {qr ? "Atualizar QR" : "Mostrar QR"}
          </button>
        )}
      </div>

      {reachable && !isOpen && qr && (
        <div className="mt-4 flex flex-col items-center gap-2 border-t border-gray-100 pt-4">
          <img src={qr} alt="QR code WhatsApp" className="w-48 h-48 rounded-lg border border-gray-100" />
          <p className="text-xs text-gray-400">Lê com o WhatsApp → Dispositivos ligados. O código expira — usa "Atualizar QR" se deixar de funcionar.</p>
        </div>
      )}
    </div>
  );
};

export default KyroConnectionStatus;
