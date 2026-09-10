// Check both label orders, compact units, encoded spaces and split HTML text.
export function hasOldResponsePromise(input) {
  const text = input.replace(/<[^>]*>/g, ' ').replace(/&(?:nbsp|#160);/gi, ' ').replace(/&lt;/gi, '<').replace(/\\n|\\r|\\t/g, ' ').replace(/\s+/g, ' ');
  const time = '(?:30|trinta|thirty)\\s*(?:min(?:utos?|utes?|s)?\\b)';
  const label = '(?:resposta|respondemos|responder|response|reply|respond)';
  return new RegExp(`(?:menos de|under|within|em até|até|<)\\s*${time}|${label}[^.!?]{0,65}${time}|${time}[^.!?]{0,35}${label}`, 'i').test(text);
}
