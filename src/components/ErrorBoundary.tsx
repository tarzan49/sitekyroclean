import { WhatsAppCta } from '@/components/Cta';
import { logError } from '@/lib/errorTracking';
import { Component, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Home } from 'lucide-react';
import { WHATSAPP_BASE } from '@/constants/business';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    void logError({ message: error.message, source: 'ErrorBoundary', severity: 'error' });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden bg-checker-dark"
        >
          <div className="relative z-10 w-full max-w-md mx-auto text-center">

            {/* Página de erro (dono, 24 Nov: "está horrível"): um só título, sem ícone nem texto por cima,
                e o WhatsApp à frente, para quem chega aqui não se perder. */}
            <h1 className="type-section-title font-playfair text-white">
              A página não abriu, <em className="not-italic" style={{ color: '#D4AF37' }}>mas estamos aqui.</em>
            </h1>
            <p className="mx-auto mt-3 mb-8 max-w-sm text-base leading-relaxed text-white/75">
              Fale connosco pelo WhatsApp e dizemos-lhe o preço e a próxima hora livre em menos de 1 minuto.
            </p>

            <WhatsAppCta href={WHATSAPP_BASE} source="error_page" />

            <div className="mt-3 grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: undefined });
                  window.location.reload();
                }}
                className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/20 text-sm font-semibold text-white"
              >
                <RefreshCw className="h-4 w-4" />
                Tentar outra vez
              </button>
              <Link
                to="/"
                onClick={() => this.setState({ hasError: false, error: undefined })}
                className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/20 text-sm font-semibold text-white"
              >
                <Home className="h-4 w-4 text-[#D4AF37]" />
                Página inicial
              </Link>
            </div>

            <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.1em] text-[#D4AF37]/85">Todo Portugal <span className="mx-1.5 text-white/30">|</span> Resposta em menos de 1 minuto</p>

            {/* Dev error trace */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mt-8 p-4 bg-red-950/40 border border-red-500/20 text-red-400 text-sm text-left rounded-2xl overflow-auto max-h-40 font-mono">
                {this.state.error.toString()}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
