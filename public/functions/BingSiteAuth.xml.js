export function onRequest() {
  return new Response('<?xml version="1.0"?>\n<users>\n\t<user>7A85986180F9F6BB2E5789D519F80386</user>\n</users>', {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' }
  });
}
