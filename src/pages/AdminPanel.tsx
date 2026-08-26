import { useState, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, BarChart3, Home, Settings2, Lock, Users, Globe } from "lucide-react";
import { isSupabaseConfigured } from "@/integrations/supabase/client";

const AdminDashboard = lazy(() => import("./AdminDashboard"));
const SitemapMonitor = lazy(() => import("./admin/SitemapMonitor"));
const ErrorLogPanel = lazy(() => import("./admin/ErrorLogPanel"));
const QuizMetricsPanel = lazy(() => import("./admin/QuizMetricsPanel"));

const ADMIN_PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD as string) || 'kyro2025';

type Tab = "sitemap" | "errors" | "metrics" | "crm";

const TabFallback = () => (
  <div className="flex items-center justify-center py-16">
    <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
  </div>
);

// ── Component ─────────────────────────────────────────────────────────────────
const AdminPanel = () => {
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("sitemap");

  // ── Auth gate ─────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-[#12121e] flex items-center justify-center p-4">
        <div className="bg-[#13132B] border border-gold/20 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
              <Lock className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h1 className="font-playfair text-white font-bold">Admin Panel</h1>
              <p className="text-xs text-white/40">Kyro Clean Solutions</p>
            </div>
          </div>
          <input
            type="password"
            placeholder="Password de acesso"
            value={pwd}
            onChange={e => setPwd(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && pwd === ADMIN_PASSWORD) { sessionStorage.setItem('kyro_admin', '1'); setAuthed(true); } }}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-gold/50 mb-4 text-sm"
          />
          <button
            onClick={() => {
              if (pwd === ADMIN_PASSWORD) {
                sessionStorage.setItem('kyro_admin', '1');
                setAuthed(true);
              } else {
                alert("Password incorreta");
              }
            }}
            className="w-full bg-gradient-to-r from-gold to-[#d4c57b] text-[#12121e] font-bold py-3 rounded-xl hover:opacity-90 transition-opacity text-sm"
          >
            Entrar
          </button>
        </div>
      </div>
    );
  }

  // ── Main panel ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f4f5f7] font-sans">
      {/* Top Bar */}
      <header className="bg-[#0B2F2A] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gold/20 border border-gold/30 flex items-center justify-center">
              <Settings2 className="w-4 h-4 text-gold" />
            </div>
            <div>
              <h1 className="font-playfair text-lg font-bold text-white leading-tight">Admin Panel</h1>
              <p className="text-xs text-white/40">Kyro Clean Solutions</p>
            </div>
          </div>
          <Link to="/" className="flex items-center gap-1.5 text-xs text-white/50 hover:text-gold transition-colors px-3 py-1.5 rounded-lg border border-white/10 hover:border-gold/30">
            <Home className="w-3.5 h-3.5" /> Ver Site
          </Link>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 pb-0 overflow-x-auto scrollbar-none">
          {([
            { id: "crm",       label: "CRM",          icon: Users },
            { id: "sitemap",   label: "Sitemaps",      icon: Globe },
            { id: "errors",    label: "Error Log",     icon: AlertTriangle },
            { id: "metrics",   label: "Métricas Quiz", icon: BarChart3 },
          ] as { id: Tab; label: string; icon: React.ElementType }[]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all border-t border-x -mb-px ${
                activeTab === tab.id
                  ? "bg-[#f4f5f7] text-navy border-white/20 border-b-[#f4f5f7]"
                  : "text-white/50 hover:text-white border-transparent"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {!isSupabaseConfigured && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-300 bg-red-50 p-4 text-red-800">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
            <div className="text-sm">
              <p className="font-bold">Supabase não está configurado neste ambiente</p>
              <p className="mt-1">
                CRM, Métricas Quiz e Error Log não estão a gravar nem a ler dados agora.
                Se isto acontece em produção: configura <code className="bg-red-100 px-1 rounded">VITE_SUPABASE_URL</code> e{" "}
                <code className="bg-red-100 px-1 rounded">VITE_SUPABASE_PUBLISHABLE_KEY</code> no Cloudflare Pages
                (Settings → Environment variables) e faz um novo deploy — o <code className="bg-red-100 px-1 rounded">.env</code> local não chega ao build.
              </p>
            </div>
          </div>
        )}
        {activeTab === "sitemap" && (
          <Suspense fallback={<TabFallback />}>
            <SitemapMonitor />
          </Suspense>
        )}

        {activeTab === "errors" && (
          <Suspense fallback={<TabFallback />}>
            <ErrorLogPanel />
          </Suspense>
        )}

        {activeTab === "metrics" && (
          <Suspense fallback={<TabFallback />}>
            <QuizMetricsPanel />
          </Suspense>
        )}

        {activeTab === "crm" && (
          <div className="bg-[#071a12] rounded-2xl p-4 -mx-2">
            <Suspense fallback={<TabFallback />}>
              <AdminDashboard embedded />
            </Suspense>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;
