// Dono, 13 Nov 2026: "sempre que houver uma impermeabilização para fazer vais colocar ao lado
// (solvente) ou (à base de água)". Premium = solvente, Essencial = à base de água
// (src/components/quiz/QuizTypes.ts). Só em textos de impermeabilização; idempotente.

const TAG = { premium: '(solvente)', essencial: '(à base de água)' } as const;

/** "Impermeabilização Premium de sofá" → "Impermeabilização Premium (solvente) de sofá". */
export function tagWaterproofBase(text: string): string {
  if (!/imperm/i.test(text)) return text;
  return text.replace(/\b(premium|essencial)\b(?!\s*\((?:solvente|à base de água|a base de agua)\))/gi,
    (word: string) => `${word} ${TAG[word.toLowerCase() as keyof typeof TAG]}`);
}
