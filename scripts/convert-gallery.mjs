import sharp from "sharp";
import { copyFileSync } from "fs";
import path from "path";

const SRC = "C:/Users/im a god bruh/Downloads/Pasta dos projetos/imagens galeria";
const OUT = "C:/Users/im a god bruh/Downloads/Pasta dos projetos/spotless-pro-flow-main/src/assets";

const jobs = [
  // SOFÁ
  { src: `${SRC}/Sofá/antes sofa.jpeg`,                             out: `${OUT}/galeria-sofa-antes.webp` },
  { src: `${SRC}/Sofá/depois sofa.jpeg`,                            out: `${OUT}/galeria-sofa-depois.webp` },
  { src: `${SRC}/Sofá/WhatsApp Image 2026-04-27 at 01.25.35.jpeg`,  out: `${OUT}/galeria-sofa-resultado.webp` },
  { src: `${SRC}/Sofá/sofa maquina extratora.png`,                  out: `${OUT}/galeria-sofa-processo.webp` },

  // COLCHÃO
  { src: `${SRC}/Colchão/antes colchao.jpeg`,                                        out: `${OUT}/galeria-colchao-antes.webp` },
  { src: `${SRC}/Colchão/depois colchao.jpeg`,                                       out: `${OUT}/galeria-colchao-depois.webp` },
  { src: `${SRC}/Colchão/ChatGPT Image Apr 27, 2026, 01_07_57 AM.png`,              out: `${OUT}/galeria-colchao-resultado.webp` },
  { src: `${SRC}/Colchão/ChatGPT Image Apr 27, 2026, 01_05_21 AM.png`,              out: `${OUT}/galeria-colchao-processo.webp` },

  // CADEIRA
  { src: `${SRC}/Cadeira/antes cadeira.jpeg`,                                        out: `${OUT}/galeria-cadeira-antes.webp` },
  { src: `${SRC}/Cadeira/depois cadeira.jpeg`,                                       out: `${OUT}/galeria-cadeira-depois.webp` },
  { src: `${SRC}/Cadeira/WhatsApp Image 2026-04-27 at 01.26.36.jpeg`,               out: `${OUT}/galeria-cadeira-resultado.webp` },
  { src: `${SRC}/Cadeira/WhatsApp Image 2026-04-27 at 01.26.50.jpeg`,               out: `${OUT}/galeria-cadeira-processo.webp` },

  // IMPERMEABILIZAÇÃO
  { src: `${SRC}/Impermeabilizacao/Antes impermeabilizacao.png`,                     out: `${OUT}/galeria-impermeabilizacao-antes.webp` },
  { src: `${SRC}/Impermeabilizacao/Depois  impermeabilizacao.png`,                   out: `${OUT}/galeria-impermeabilizacao-depois.webp` },
  { src: `${SRC}/Impermeabilizacao/sofa impermeabilizado.png`,                       out: `${OUT}/galeria-impermeabilizacao-resultado.webp` },
  { src: `${SRC}/Impermeabilizacao/copo de agua.png`,                                out: `${OUT}/galeria-impermeabilizacao-processo.webp` },

  // TAPETE
  { src: `${SRC}/Tapete/cão sofa sujo antes.png`,                                    out: `${OUT}/galeria-tapete-antes.webp` },
  { src: `${SRC}/Tapete/cao tapete limpo depois.png`,                                out: `${OUT}/galeria-tapete-depois.webp` },
  { src: `${SRC}/Tapete/MAQUINA TAPETES.png`,                                        out: `${OUT}/galeria-tapete-processo.webp` },

  // ALCATIFA
  { src: `${SRC}/Alcatifa/ChatGPT Image Apr 27, 2026, 01_34_52 AM.png`,             out: `${OUT}/galeria-alcatifa-resultado.webp` },
  { src: `${SRC}/Alcatifa/limpeza alcatifa.png`,                                     out: `${OUT}/galeria-alcatifa-processo.webp` },
];

let ok = 0, fail = 0;
for (const { src, out } of jobs) {
  try {
    await sharp(src)
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 75 })
      .toFile(out);
    const name = path.basename(out);
    console.log(`✓ ${name}`);
    ok++;
  } catch (e) {
    console.error(`✗ ${path.basename(out)}: ${e.message}`);
    fail++;
  }
}
console.log(`\nDone: ${ok} converted, ${fail} failed.`);
