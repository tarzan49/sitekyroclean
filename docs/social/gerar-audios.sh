#!/bin/bash
# Gera os 15 MP3 a partir de narracoes-elevenlabs/*.txt
# Uso: ELEVENLABS_API_KEY=sk_... bash docs/social/gerar-audios.sh [VOICE_ID]
set -e
cd "$(dirname "$0")/narracoes-elevenlabs"
K="${ELEVENLABS_API_KEY:?falta ELEVENLABS_API_KEY}"
V="${1:-}"
if [ -z "$V" ]; then
  V=$(curl -s "https://api.elevenlabs.io/v2/voices?page_size=1&voice_type=personal" -H "xi-api-key: $K" | python3 -c "import json,sys;v=json.load(sys.stdin).get('voices',[]);print(v[0]['voice_id'] if v else 'JBFqnCBsd6RMkjVDRZzb')")
fi
echo "Voz: $V"
for f in *.txt; do
  python3 -c "import json,sys;print(json.dumps({'text':open(sys.argv[1]).read().strip(),'model_id':'eleven_multilingual_v2','language_code':'pt'}))" "$f" > /tmp/kyro_body.json
  curl -sf "https://api.elevenlabs.io/v1/text-to-speech/$V?output_format=mp3_44100_128" \
    -H "xi-api-key: $K" -H "Content-Type: application/json" --data @/tmp/kyro_body.json -o "${f%.txt}.mp3"
  echo "feito ${f%.txt}.mp3"
done
open . 2>/dev/null || true
