#!/bin/bash
# Junta cada MP3 (narracoes-elevenlabs/NN.mp3) ao vídeo videos/NN.mp4 -> finais/NN.mp4
cd "$(dirname "$0")"
command -v ffmpeg >/dev/null || conda install -y -q -c conda-forge ffmpeg || { echo "Instale o ffmpeg"; exit 1; }
A="${1:-narracoes-elevenlabs}"; mkdir -p finais
for v in videos/*.mp4; do n=$(basename "$v" .mp4)
  [ -f "$A/$n.mp3" ] || { echo "falta $A/$n.mp3"; continue; }
  ffmpeg -y -loglevel error -i "$v" -i "$A/$n.mp3" -map 0:v -map 1:a -c:v copy -c:a aac -af apad -shortest "finais/$n.mp4" && echo "pronto finais/$n.mp4"
done
open finais 2>/dev/null || true
