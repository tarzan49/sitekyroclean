// Política editorial publicada.
//
// Não é decoração: cada ponto corresponde a uma regra que o código impõe e a
// uma correção que já foi feita. Publicá-la é o que a torna verificável por
// quem lê e por um motor que compare o que o site promete com o que faz.
//
// Importada pela página de autor (React) e pelo prerender, para as duas
// audiências lerem exatamente os mesmos compromissos.

export interface EditorialRule {
  title: string;
  detail: string;
}

export const EDITORIAL_RULES: EditorialRule[] = [
  {
    title: "Os preços vêm de uma fonte única",
    detail:
      "Os valores citados nos artigos são os mesmos que o simulador de orçamento usa, importados do mesmo ficheiro. Não são escritos à mão, por isso não podem ficar desatualizados em relação ao preço real do serviço.",
  },
  {
    title: "Afirmações sobre saúde citam a fonte",
    detail:
      "Quando um artigo afirma algo sobre ácaros, alergias, bactérias ou humidade, a afirmação remete para uma fonte identificada, com editor e data de verificação, no fim do artigo.",
  },
  {
    title: "Sem fonte, a afirmação sai",
    detail:
      "Em setembro de 2026 revimos os artigos e retirámos números que circulavam sem origem verificável, incluindo uma estimativa atribuída à Organização Mundial de Saúde que a OMS nunca publicou. A correção foi retirar a afirmação, não procurar uma fonte parecida.",
  },
  {
    title: "A evidência que não nos convém também é publicada",
    detail:
      "Perguntam-nos se há estudos que provem que a limpeza profissional reduz sintomas de alergia. A revisão Cochrane que juntou 54 ensaios não encontrou esse efeito, e é isso que o artigo diz e cita. A limpeza remove pó, alérgenos acumulados, manchas e odores; não trata doenças.",
  },
  {
    title: "Testemunhos só de clientes reais",
    detail:
      "As avaliações mostradas no site são transcrições de avaliações recebidas. As entradas antigas cuja origem não conseguimos confirmar não são usadas nas páginas de serviço, e uma avaliação sem texto não é transformada num testemunho escrito.",
  },
  {
    title: "O que o site mostra é o que o site diz",
    detail:
      "As páginas deste site são servidas já escritas para quem não executa JavaScript, incluindo os motores de pesquisa e os assistentes de IA. Essa versão contém a mesma informação que a pessoa lê no ecrã, apresentada de outra forma, nunca informação diferente.",
  },
];
