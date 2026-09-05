// One-off parser for the owner's manually-tracked WhatsApp services list
// (2026-09-05 import). Reads scripts/whatsapp-services-raw.txt, prints the
// parsed table for review, and (with --insert) writes to Supabase leads.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const raw = fs.readFileSync(path.join(__dirname, 'whatsapp-services-raw.txt'), 'utf-8');
const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);

const REGION_NAME = { P: 'Porto', L: 'Lisboa', A: 'Algarve', B: 'Braga' };

function parseLine(line, idx) {
  const dateMatch = line.match(/^(\d{1,2})\/(\d{1,2})/);
  if (!dateMatch) throw new Error(`Linha ${idx + 1}: sem data reconhecida: "${line}"`);
  const day = parseInt(dateMatch[1], 10);
  const month = parseInt(dateMatch[2], 10);
  const year = 2026;

  const completed = line.includes('✅');
  const noEmoji = line.replace(/✅/g, '').trimEnd();
  const lastChar = noEmoji.slice(-1).toUpperCase();
  const region = REGION_NAME[lastChar];
  if (!region) throw new Error(`Linha ${idx + 1}: regiao nao reconhecida (ultimo char "${lastChar}"): "${line}"`);

  // Paired margin(total) first, else a single value, else free (0/0).
  let margin = 0, total = 0;
  const paired = line.match(/(\d+(?:[.,]\d+)?)\s*€?\s*\(\s*(\d+(?:[.,]\d+)?)\s*€?\s*\)/);
  if (paired) {
    margin = parseFloat(paired[1].replace(',', '.'));
    total = parseFloat(paired[2].replace(',', '.'));
  } else {
    const single = line.match(/(\d+(?:[.,]\d+)?)\s*€/);
    if (single) {
      margin = total = parseFloat(single[1].replace(',', '.'));
    }
  }

  // Loose human-readable description: strip date, price/parens, checkmark, trailing region letter.
  let desc = line
    .replace(/^\d{1,2}\/\d{1,2}\s*/, '')
    .replace(/^(serviço|servico|recolha)\s*/i, '')
    .replace(/\d+(?:[.,]\d+)?\s*€?\s*\(\s*\d+(?:[.,]\d+)?\s*€?\s*\)/, '')
    .replace(/\d+(?:[.,]\d+)?\s*€/, '')
    .replace(/✅/g, '')
    .trim();
  // Drop the trailing region letter (last 1-2 chars, possibly glued to prior word).
  desc = desc.replace(/[PLAB]$/, '').trim();
  if (!desc) desc = 'Serviço';

  const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T12:00:00.000Z`;

  return {
    date: `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`,
    created_at: iso,
    margin_value: margin,
    total_value: total,
    region,
    service: desc,
    status: completed ? 'scheduled_done' : 'scheduled',
    completed,
  };
}

const parsed = lines.map(parseLine);

console.log(`Total de linhas parseadas: ${parsed.length}\n`);
console.log('Data       | Margem  | Total   | Regiao  | Concl. | Servico');
console.log('-----------|---------|---------|---------|--------|--------------------------------');
for (const p of parsed) {
  console.log(
    `${p.date.padEnd(10)} | ${String(p.margin_value).padStart(6)}€ | ${String(p.total_value).padStart(6)}€ | ${p.region.padEnd(7)} | ${(p.completed ? 'sim' : 'nao').padEnd(6)} | ${p.service}`
  );
}

const sumMargin = parsed.reduce((s, p) => s + p.margin_value, 0);
const sumTotal = parsed.reduce((s, p) => s + p.total_value, 0);
console.log(`\nSoma margem propria: ${sumMargin.toFixed(2)}€`);
console.log(`Soma valor total cliente: ${sumTotal.toFixed(2)}€`);
console.log(`Concluidos: ${parsed.filter(p => p.completed).length} / Agendados (sem check): ${parsed.filter(p => !p.completed).length}`);

const byRegion = {};
for (const p of parsed) byRegion[p.region] = (byRegion[p.region] ?? 0) + p.margin_value;
console.log('\nMargem por regiao:', byRegion);

if (process.argv.includes('--insert')) {
  const envPath = path.join(__dirname, '..', '.env');
  const env = Object.fromEntries(
    fs.readFileSync(envPath, 'utf-8').split('\n').filter(l => l.includes('=')).map(l => {
      const i = l.indexOf('=');
      return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, '')];
    })
  );
  const SUPABASE_URL = env.VITE_SUPABASE_URL;
  const SUPABASE_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const rows = parsed.map((p, i) => ({
    created_at: p.created_at,
    name: 'Sem nome',
    phone: '',
    email: null,
    message: '',
    service: p.service,
    service_type: '',
    details: '',
    location: REGION_NAME[Object.keys(REGION_NAME).find(k => REGION_NAME[k] === p.region)] ?? p.region,
    value: `${p.margin_value}€`,
    slot: '',
    status: p.completed ? 'Fechado' : 'scheduled',
    notes: `Importado da lista WhatsApp do dono (2026-09-05). Margem propria: ${p.margin_value}€. Valor total cliente: ${p.total_value}€.`,
    assigned_to: '',
    priority: 'Frio',
    source: 'WhatsApp',
    next_step: '',
    booking_id: `WA-IMPORT-${i + 1}`,
    region: p.region,
    margin_value: p.margin_value,
    total_value: p.total_value,
  }));

  const resp = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(rows),
  });
  console.log(`\nInsert status: ${resp.status}`);
  if (!resp.ok) {
    console.log(await resp.text());
    process.exit(1);
  }
  console.log(`Inseridos ${rows.length} leads com source='WhatsApp'.`);
}
