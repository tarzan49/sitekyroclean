# -*- coding: utf-8 -*-
"""Gera o ficheiro de carregamento em massa das campanhas Porto e Lisboa.

Os factos (preços, avaliações, promessas) saem das constantes do site, para o
anúncio nunca poder contradizer a página de destino. Correr:

    python3 docs/google-ads/gerar-csv.py

Escreve docs/google-ads/campanhas-porto-lisboa.csv.
"""
import csv, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def le(caminho, padrao):
    txt = open(os.path.join(ROOT, caminho), encoding="utf-8").read()
    m = re.search(padrao, txt)
    if not m:
        raise SystemExit(f"não encontrei {padrao!r} em {caminho}")
    return m.group(1)

# Fonte única: se algum destes desaparecer, isto rebenta em vez de publicar um número velho.
RATING   = le("src/constants/business.ts", r'REVIEW_RATING\s*=\s*"([\d.]+)"').replace(".", ",")
REVIEWS  = le("src/constants/business.ts", r'REVIEW_COUNT\s*=\s*"(\d+)"')
CLIENTES = le("src/constants/business.ts", r'CLIENTS_SERVED_LABEL\s*=\s*"([^"]+)"')
LIMPEZA_1L   = le("src/components/quiz/QuizTypes.ts", r"id: '1-lugar',.*?cleaningPrice: (\d+)")
IMPER_ESSENC = le("src/components/quiz/QuizTypes.ts", r"id: '1-lugar',.*?waterproofingPrice: (\d+)")
IMPER_PREMIUM= le("src/components/quiz/QuizTypes.ts", r"id: '1-lugar',.*?waterproofingPremiumPrice: (\d+)")
PACK_1L      = le("src/components/quiz/QuizTypes.ts", r"id: '1-lugar',.*?bothPrice: (\d+)")

PREP = {"Porto": "no Porto", "Lisboa": "em Lisboa"}
# Decisão do dono (23/09/2026): Lisboa arranca com o dobro do Porto.
ORCAMENTO = {"Porto": "13,00", "Lisboa": "27,00"}

def limpeza(city):
    c, em = city.lower(), PREP[city]
    return dict(
        adgroup="Limpeza de Sofás",
        url=f"https://cleansolutions.com.pt/limpeza-sofas-{c}?ads=1",
        p1="limpeza-sofas", p2=c,
        keywords=[f"limpeza de sofás {c}", f"limpeza de sofá {c}", f"higienização de sofás {c}",
                  f"lavagem de sofás {c}", f"limpar sofá {c}", f"limpeza de estofos {c}",
                  "limpeza de sofás ao domicílio", "empresa de limpeza de sofás",
                  "preço limpeza sofá", "quanto custa limpar um sofá",
                  "limpeza de sofás preço", "higienização de estofos"],
        headlines=[f"Limpeza de Sofás {city}", "Higienização de Sofás",
                   f"{REVIEWS} Avaliações no Google", f"{RATING} Estrelas no Google",
                   f"{CLIENTES} Clientes Servidos", "Resposta em 10 Minutos",
                   "Orçamento Grátis no WhatsApp", "Preço Fechado Antes de Marcar",
                   "Garantia de Repetição", "Limpeza ao Domicílio", "Seca em 3 a 6 Horas",
                   "Manchas, Pelos e Odores", "Sofá Limpo sem Sair de Casa",
                   f"Equipa Própria {em}", "Limpe e Proteja no Mesmo Dia"],
        descriptions=[
            f"Higienização profissional de sofás ao domicílio {em}. Secagem média de 3 a 6 horas.",
            f"{RATING} estrelas no Google, {REVIEWS} avaliações reais e mais de 1100 clientes servidos.",
            "Preço fechado antes da marcação, sem surpresas. Orçamento grátis pelo WhatsApp.",
            "Se não ficar satisfeito, avise em 48 horas e repetimos a limpeza sem custos."],
    )

def imper(city):
    c, em = city.lower(), PREP[city]
    return dict(
        adgroup="Impermeabilização de Sofás",
        url=f"https://cleansolutions.com.pt/impermeabilizacao-{c}?ads=1",
        p1="protecao-sofas", p2=c,
        keywords=[f"impermeabilização de sofás {c}", f"impermeabilizar sofá {c}",
                  f"impermeabilização de estofos {c}", "limpeza e impermeabilização de sofás",
                  "impermeabilização de sofás preço", "quanto custa impermeabilizar um sofá",
                  "pack limpeza e impermeabilização sofá"],
        headlines=["Impermeabilização de Sofás", f"Impermeabilizar Sofá {city}",
                   "Vinho, Café e Sumo no Sofá", "Derrames Ficam à Superfície",
                   "Limpa com um Pano, Sem Nódoa", "Proteja Antes da Próxima Nódoa",
                   "Crianças e Animais em Casa?", "Premium: Até 10 Anos",
                   "Resiste a Até 5 Lavagens", f"Essencial {IMPER_ESSENC}€, Premium {IMPER_PREMIUM}€",
                   f"Pack com Limpeza Desde {PACK_1L}€", f"{RATING} Estrelas no Google",
                   f"{REVIEWS} Avaliações no Google", "Aplicação ao Domicílio",
                   "Orçamento Grátis no WhatsApp"],
        descriptions=[
            "Vinho, café ou sumo entornados ficam à superfície e saem com um pano seco.",
            f"Impermeabilização de sofás ao domicílio {em}. Essencial desde {IMPER_ESSENC}€, Premium desde {IMPER_PREMIUM}€.",
            "A Premium protege até 10 anos e resiste a até 5 lavagens. A Essencial, 1 a 2 anos.",
            f"Limpeza e proteção na mesma visita, em pack desde {PACK_1L}€. {RATING} estrelas no Google."],
    )

CAMPANHAS = [("Kyro | Porto | Limpeza e Proteção de Sofás | Set 2026", "Porto"),
             ("Kyro | Lisboa | Limpeza e Proteção de Sofás | Set 2026", "Lisboa")]

cols = ["Campaign", "Campaign Type", "Campaign Status", "Budget", "Bid Strategy Type", "Networks",
        "Anúncios políticos da UE",
        "Ad Group", "Ad Group Status", "Max CPC", "Keyword", "Criterion Type",
        "Ad type", "Final URL", "Path 1", "Path 2", "Status"]
cols += [f"Headline {i}" for i in range(1, 16)] + [f"Description {i}" for i in range(1, 5)]

rows = []
for nome, city in CAMPANHAS:
    rows.append({"Campaign": nome, "Campaign Type": "Search", "Campaign Status": "Paused",
                 "Budget": ORCAMENTO[city], "Bid Strategy Type": "Maximize clicks", "Networks": "Google search",
                 "Anúncios políticos da UE": "Não"})
    for g in (limpeza(city), imper(city)):
        rows.append({"Campaign": nome, "Ad Group": g["adgroup"], "Ad Group Status": "Enabled", "Max CPC": "1,50"})
        for kw in g["keywords"]:
            rows.append({"Campaign": nome, "Ad Group": g["adgroup"], "Keyword": kw,
                         "Criterion Type": "Expressão", "Status": "Enabled"})
        ad = {"Campaign": nome, "Ad Group": g["adgroup"], "Ad type": "Responsive search ad",
              "Final URL": g["url"], "Path 1": g["p1"], "Path 2": g["p2"], "Status": "Enabled"}
        ad.update({f"Headline {i}": h for i, h in enumerate(g["headlines"], 1)})
        ad.update({f"Description {i}": d for i, d in enumerate(g["descriptions"], 1)})
        rows.append(ad)

erros = []
for r in rows:
    for i in range(1, 16):
        v = r.get(f"Headline {i}", "")
        if len(v) > 30: erros.append(f"título {len(v)}: {v}")
    for i in range(1, 5):
        v = r.get(f"Description {i}", "")
        if len(v) > 90: erros.append(f"descrição {len(v)}: {v}")
    for p in ("Path 1", "Path 2"):
        if len(r.get(p, "")) > 15: erros.append(f"caminho: {r[p]}")
if erros:
    raise SystemExit("acima do limite:\n" + "\n".join(erros))

destino = os.path.join(ROOT, "docs/google-ads/campanhas-porto-lisboa.csv")
with open(destino, "w", newline="", encoding="utf-8-sig") as f:
    w = csv.DictWriter(f, fieldnames=cols)
    w.writeheader()
    for r in rows:
        w.writerow({c: r.get(c, "") for c in cols})
print(f"{len(rows)} linhas, tudo dentro dos limites. Factos: {RATING}/{REVIEWS}/{CLIENTES}, "
      f"limpeza {LIMPEZA_1L}€, imper {IMPER_ESSENC}€/{IMPER_PREMIUM}€, pack {PACK_1L}€")
