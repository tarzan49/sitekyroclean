declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    fbq?: ((...args: unknown[]) => void) & {
      callMethod?: (...args: unknown[]) => void;
      queue: unknown[][];
      push: (...args: unknown[]) => void;
      loaded: boolean;
      version: string;
    };
    _fbq?: Window['fbq'];
  }
}

// O React 18 não mapeia a prop camelCase `fetchPriority` para o atributo
// `fetchpriority` do HTML (isso só chegou no React 19): avisa na consola e
// descarta o atributo, por isso a dica de prioridade perdia-se justamente nas
// imagens LCP dos heroes. Enquanto o projeto estiver no React 18 escreve-se o
// atributo em minúsculas, e é esta declaração que lhe dá tipo — os tipos do
// `@types/react` 18 só conhecem a forma camelCase, que o `react-dom` ignora.
// Ao subir para o React 19: voltar a `fetchPriority` e apagar este bloco.
declare module 'react' {
  interface ImgHTMLAttributes<T> {
    fetchpriority?: 'high' | 'low' | 'auto';
  }
}

export {};
