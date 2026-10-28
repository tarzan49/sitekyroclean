// Entry of the bundle the `bot-api` Edge Function imports
// (`npm run build:bot-engine` → supabase/functions/_shared/botEngine.generated.js):
// the bot's prices and its availability, from the site's own code.
export { botQuote, listBotCities, resolveBotCity } from './botQuote';
export { botAvailability, eventTeam, teamBusyAt } from './botAvailability';
export { planBotBooking, planBotHold, planOwnerBooking, TEAM_COLOR } from './botHold';
export { agendaCheck } from './agendaCheck';
export { teamAccounts } from './teamAccounts';
export { addDays, checkProcedure, clientPhoneFromTitle, clientReviewDue, factsFromTitle, lisbonDayOf, procedureApplies, procedureClientMessage, procedureClosedMessage, procedureFrom, procedurePromptMessage, procedureReceiptMessage, procedureReminderMessage, procedureStatusChanges, reminderDue, slotForMedia, PROCEDURE_NOT_A_REPLY_MESSAGE } from './serviceProcedure';
export { describeQuizOrder } from './quizOrder';
export { isTestOrder } from './testLead';
export { labelFacts } from './labelFacts';
export { bookedServices } from './botBookedServices';
export { planBookingUpdate } from './botBookingUpdate';
export { certificateItemsFromChat, certificateName, certificateNumber, pickCertificateService } from './botCertificate';
