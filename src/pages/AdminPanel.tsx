import { useState, lazy, Suspense } from "react";
import { SITE_URL } from "@/constants/business";
import { AlertTriangle, BarChart3, Home, Settings2, Lock, LogOut, Users, Globe, MessageCircle, Mail, Megaphone } from "lucide-react";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import { useAdminSession } from "@/hooks/use-admin-session";

const CrmPanel = lazy(() => import("./admin/CrmPanel"));
const SitemapMonitor = lazy(() => import("./admin/SitemapMonitor"));
const ErrorLogPanel = lazy(() => import("./admin/ErrorLogPanel"));
const QuizMetricsPanel = lazy(() => import("./admin/QuizMetricsPanel"));
const WhatsAppPanel = lazy(() => import("./admin/WhatsAppPanel"));
const QuizLeadsPanel = lazy(() => import("./admin/QuizLeadsPanel"));
const MarketingPanel = lazy(() => import("./admin/MarketingPanel"));

type Tab = "sitemap" | "errors" | "metrics" | "crm" | "whatsapp" | "quiz-leads" | "marketing" | "meta-marketing";

const TabFallback = () => (
  <div className="flex items-center justify-center py-16">
    <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
  </div>
);

// ── Component ─────────────────────────────────────────────────────────────────
const AdminPanel = () => {
  const { isAuthed, loading: authLoading, isAdmin, checkingAdmin } = useAdminSession();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("sitemap");

  const handleLogin = async () => {
    setSigningIn(true);
    setLoginError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pwd });
    setSigningIn(false);
    if (error) setLoginError("Email ou password incorretos");
  };

  // ── Auth gate ─────────────────────────────────────────────────────────────
  // Sessão real do Supabase Auth (2026-09-08) — antes era só uma string
  // comparada em JS no browser, visível em texto simples no bundle público
  // do site (achado CRITICAL no audit de código). Cria o utilizador admin
  // em Supabase Dashboard → Authentication → Users → Add user.
  if (authLoading || (isAuthed && checkingAdmin)) {
    return (
      <div className="min-h-screen bg-[#12121e] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Sessão válida mas sem entrada em `admin_users` (ver migration
  // 20260918010000_admin_authorization.sql) — não é a mesma coisa que não
  // estar autenticado. A fronteira real é o RLS: mesmo que este ecrã fosse
  // contornado, is_admin() continua a bloquear select/insert/update/delete
  // nas tabelas do painel.
  if (isAuthed && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#12121e] flex items-center justify-center p-4">
        <div className="bg-[#13132B] border border-red-500/30 rounded-2xl p-8 w-full max-w-sm shadow-2xl text-center">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-5 h-5 text-red-400" />
          </div>
          <h1 className="font-playfair text-white font-bold mb-2">Sem autorização</h1>
          <p className="text-sm text-white/50 mb-6">
            Esta conta está autenticada mas não tem acesso ao painel administrativo.
          </p>
          <button
            onClick={() => supabase.auth.signOut()}
            className="w-full bg-white/5 border border-white/10 text-white/70 font-medium py-3 rounded-xl hover:bg-white/10 transition-colors text-sm"
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthed) {
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
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleLogin(); }}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-gold/50 mb-3 text-sm"
          />
          <input
            type="password"
            placeholder="Password"
            value={pwd}
            onChange={e => setPwd(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleLogin(); }}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-gold/50 mb-4 text-sm"
          />
          {loginError && <p className="text-red-400 text-xs mb-3">{loginError}</p>}
          <button
            onClick={handleLogin}
            disabled={signingIn}
            className="w-full bg-gradient-to-r from-gold to-[#d4c57b] text-[#12121e] font-bold py-3 rounded-xl hover:opacity-90 transition-opacity text-sm disabled:opacity-50"
          >
            {signingIn ? "A entrar..." : "Entrar"}
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
          <div className="flex items-center gap-2">
            <a href={SITE_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-white/50 hover:text-gold transition-colors px-3 py-1.5 rounded-lg border border-white/10 hover:border-gold/30">
              <Home className="w-3.5 h-3.5" /> Ver Site
            </a>
            <button
              onClick={() => supabase.auth.signOut()}
              className="flex items-center gap-1.5 text-xs text-white/50 hover:text-gold transition-colors px-3 py-1.5 rounded-lg border border-white/10 hover:border-gold/30"
            >
              <LogOut className="w-3.5 h-3.5" /> Sair
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 pb-0 overflow-x-auto scrollbar-none">
          {([
            { id: "crm",       label: "CRM",          icon: Users },
            { id: "quiz-leads", label: "Quiz Leads",  icon: Mail },
            { id: "marketing", label: "Google Ads",  icon: Megaphone },
            { id: "meta-marketing", label: "Meta Ads", icon: Megaphone },
            { id: "whatsapp",  label: "WhatsApp",      icon: MessageCircle },
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
                (Settings → Environment variables) e faz um novo deploy, o <code className="bg-red-100 px-1 rounded">.env</code> local não chega ao build.
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
          <Suspense fallback={<TabFallback />}>
            <CrmPanel />
          </Suspense>
        )}

        {activeTab === "quiz-leads" && (
          <Suspense fallback={<TabFallback />}>
            <QuizLeadsPanel />
          </Suspense>
        )}

        {activeTab === "marketing" && (
          <Suspense fallback={<TabFallback />}>
            <MarketingPanel key="google" platform="google" />
          </Suspense>
        )}

        {activeTab === "meta-marketing" && (
          <Suspense fallback={<TabFallback />}><MarketingPanel key="meta" platform="meta" /></Suspense>
        )}

        {activeTab === "whatsapp" && (
          <Suspense fallback={<TabFallback />}>
            <WhatsAppPanel />
          </Suspense>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;
