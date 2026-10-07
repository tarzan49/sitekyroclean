// Entry of the bundle the `bot-api` Edge Function imports
// (`npm run build:bot-engine` → supabase/functions/_shared/botEngine.generated.js):
// the bot's prices and its availability, from the site's own code.
export { botQuote, listBotCities, resolveBotCity } from './botQuote';
export { botAvailability } from './botAvailability';
