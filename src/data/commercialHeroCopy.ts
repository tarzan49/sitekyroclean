const subtitles: Record<string, string> = {
  'limpeza-sofas': 'Cuidado profissional para o seu sofá, sem sair de casa.',
  'limpeza-colchoes': 'Limpeza do colchão com cuidados adaptados ao tecido.',
  'limpeza-cadeiras': 'Cuidamos dos assentos, encostos e tecidos das suas cadeiras.',
  'limpeza-tapetes': 'Cuidados adaptados às fibras e ao estado do seu tapete.',
  'limpeza-alcatifas': 'Limpeza da alcatifa com atenção às zonas de maior uso.',
  impermeabilizacao: 'Proteção do tecido para facilitar os cuidados do dia a dia.',
};
export const commercialHeroSubtitle = (serviceSlug: string, city?: string) => `${subtitles[serviceSlug] ?? 'Cuidados profissionais adaptados aos seus estofos.'}${city === 'Aveiro' || city === 'Coimbra' ? ' Disponibilidade sob consulta.' : ''}`;
