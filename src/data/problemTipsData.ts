export const CATEGORY_TIPS: Record<string, { title: string; steps: string[]; warning: string }> = {
  manchas: {
    title: "O que fazer nos primeiros 5 minutos",
    steps: [
      "Absorva o excesso com pano branco seco, nunca esfregue",
      "Aplique pressão suave do exterior para o interior da mancha",
      "Não use água quente: fixa proteínas e taninos permanentemente nas fibras",
    ],
    warning: "Manchas com mais de 24 horas requerem extração profissional para remoção completa",
  },
  odores: {
    title: "Ação imediata para neutralizar odores",
    steps: [
      "Ventile a divisão ao máximo durante pelo menos 2 horas",
      "Bicarbonato de sódio seco sobre o tecido absorve odores temporariamente (30 min, depois aspire)",
      "Evite produtos perfumados, mascaram o odor mas não o eliminam na raiz",
    ],
    warning: "Odores orgânicos (urina, suor, mofo) só são eliminados definitivamente com extração profissional",
  },
  saude: {
    title: "Redução imediata da carga alergénica",
    steps: [
      "Aspire com filtro HEPA em movimentos lentos e sobrepostos (2 passagens)",
      "Capa anti-ácaros reduz exposição mas não elimina os ácaros existentes",
      "Mantenha humidade interior abaixo de 50%, ácaros proliferam acima desse valor",
    ],
    warning: "Eliminação permanente de 99% dos ácaros só é possível com extração profissional a vapor",
  },
  animais: {
    title: "Controlo imediato com animais de estimação",
    steps: [
      "Remova pelos visíveis com fita adesiva ou luva de borracha húmida",
      "Bicarbonato neutraliza o cheiro de animal temporariamente",
      "Urina: absorva imediatamente e aplique solução de água e vinagre branco (50/50)",
    ],
    warning: "Dander e alérgenos de animais penetram nas fibras, só extração profissional os remove completamente",
  },
  urgencia: {
    title: "Protocolo de emergência",
    steps: [
      "Absorva o máximo de líquido imediatamente com toalhas absorventes",
      "Não aplique calor (secador), fixa manchas e odores nas fibras",
      "Contacte um profissional nas primeiras 2-4 horas para melhores resultados",
    ],
    warning: "Após 24 horas, manchas e odores tornam-se significativamente mais difíceis de remover",
  },
  protecao: {
    title: "Como preparar os estofos para impermeabilização",
    steps: [
      "Limpe profissionalmente antes de impermeabilizar, a sujidade bloqueia a proteção",
      "Aguarde 24-48h após aplicação para ativação completa, evite uso intenso",
      "Reaplique a cada 12-18 meses ou após cada limpeza profissional",
    ],
    warning: "Impermeabilização em tecido sujo é ineficaz, a ordem correta é sempre: limpar primeiro, proteger depois",
  },
  materiais: {
    title: "Cuidados essenciais com materiais delicados",
    steps: [
      "Verifique a etiqueta: W (água), S (solvente), WS (ambos), X (só aspiração)",
      "Teste qualquer produto numa zona não visível por 10 min antes de aplicar",
      "Veludo e alcântara: nunca esfregue, use pano na direção da fibra apenas",
    ],
    warning: "Materiais delicados sem tratamento adequado perdem textura e cor permanentemente",
  },
  preco: {
    title: "Como obter o orçamento mais preciso",
    steps: [
      "Fotografe o estado atual do estofado e envie pelo WhatsApp para orçamento mais exato",
      "Compare sempre pelo método: extração profissional a quente ≠ shampooing superficial",
      "Orçamentos que discriminam deslocação, pré-tratamento e secagem são os mais transparentes",
    ],
    warning: "Preços abaixo de 25€ geralmente não incluem extração profissional real, o resultado é temporário",
  },
  metodo: {
    title: "O que esperar de um serviço profissional de qualidade",
    steps: [
      "O técnico inspeciona o tipo de tecido e manchas antes de iniciar (sinal de profissionalismo)",
      "Processo completo: 45 min a 3 horas conforme dimensão e estado do estofado",
      "Deixe secar completamente antes de usar, 2 a 6 horas dependendo da ventilação",
    ],
    warning: "Uso antes de secar completamente pode causar marcas de água no tecido",
  },
};
