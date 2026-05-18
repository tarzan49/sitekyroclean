import { Component, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Home, MessageCircle, AlertTriangle } from 'lucide-react';

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
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden bg-checker-dark"
        >
          {/* Ambient glows */}
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(ellipse, rgba(212,175,55,0.10) 0%, transparent 70%)" }}
          />
          <div
            className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(ellipse, rgba(26,78,48,0.25) 0%, transparent 70%)" }}
          />

          <div className="relative z-10 w-full max-w-lg mx-auto text-center">

            {/* Icon */}
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-gold/20"
              style={{ background: "rgba(212,175,55,0.08)" }}
            >
              <AlertTriangle className="w-9 h-9" style={{ color: "#D4AF37" }} strokeWidth={1.5} />
            </div>

            {/* Label */}
            <p className="text-[11px] font-bold tracking-[0.28em] uppercase mb-3" style={{ color: "#D4AF37" }}>
              Algo correu mal
            </p>

            {/* Heading */}
            <h1 className="font-playfair text-2xl sm:text-3xl font-bold text-white leading-snug mb-4">
              Não foi possível carregar esta página
            </h1>

            <p className="text-white/50 text-base max-w-sm mx-auto mb-10 leading-relaxed">
              Ocorreu um erro inesperado. Pedimos desculpa pelo incómodo — pode tentar recarregar ou voltar ao início.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: undefined });
                  window.location.reload();
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-[#A87C2A] to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#EDD96A] text-[#071a12] font-bold text-sm px-7 py-3.5 rounded-full shadow-[0_4px_20px_rgba(212,175,55,0.35)] hover:shadow-[0_4px_28px_rgba(212,175,55,0.5)] transition-all active:scale-[0.97] w-full sm:w-auto justify-center"
              >
                <RefreshCw className="w-4 h-4" strokeWidth={2.5} />
                Tentar novamente
              </button>

              <Link
                to="/"
                onClick={() => this.setState({ hasError: false, error: undefined })}
                className="flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.10] border border-white/15 text-white font-semibold text-sm px-7 py-3.5 rounded-full transition-all active:scale-[0.97] backdrop-blur-sm w-full sm:w-auto justify-center"
              >
                <Home className="w-4 h-4 text-gold" />
                Página inicial
              </Link>
            </div>

            {/* Support nudge */}
            <p className="text-white/30 text-xs">
              Continua a ter problemas?{' '}
              <a
                href="https://wa.me/351925530647"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#25D366] hover:underline font-medium"
              >
                <MessageCircle className="w-3 h-3" />
                Fale connosco
              </a>
            </p>

            {/* Dev error trace */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mt-8 p-4 bg-red-950/40 border border-red-500/20 text-red-400 text-xs text-left rounded-2xl overflow-auto max-h-40 font-mono">
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
