// O que as Edge Functions `follow-up-digest` e `bot-api` usam do motor de
// seguimento. Empacotado num só ficheiro por `npm run build:follow-up-engine`
// (scripts/build-follow-up-engine.mjs), como o motor de preços do bot: o Deno
// não importa o TypeScript do site diretamente. O teste
// followUpEngineBundle.test.ts rebenta se o pacote ficar para trás.

export {
  ACTION_KINDS,
  CONTACT_PREFERENCES,
  OFFERS_CONFIRMED,
  STAGE_INFO,
  botGuidance,
  campaignCalendar,
  isQuietTime,
  planAll,
  snapshotAt,
  waLink,
} from './clientFollowUp';
export { buildDigest } from './followUpDigest';
export { factsFromLabels, firstName, normalizePhone, phoneKey } from './clientRecords';
export { lisbonDay } from './crmClosings';
