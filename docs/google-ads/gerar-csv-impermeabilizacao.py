# -*- coding: utf-8 -*-
"""Campanha só de impermeabilização de estofos, Porto e Lisboa (dono, 27/10/2026:
"campanha só para impermeabilização de estofos, tocar nos nossos pontos fortes,
anti-manchas e resistente a líquidos").

Porquê: a impermeabilização tem ticket médio ~210€ contra ~125€ da limpeza e já é
~40% do faturado, mas vivia dentro das campanhas de sofás, onde o orçamento a mais
ia sobretudo para limpeza. Campanha própria = orçamento próprio e medição própria.

Sem "resistente a qualquer líquido" nem "à prova de": a proteção faz os líquidos
ficarem à superfície durante uns minutos, não os torna inofensivos para sempre
(regra das afirmações absolutas do CLAUDE.md; o "Limpa com um Pano, Sem Nódoa"
já saiu a 26/09 pela mesma razão).

As campanhas saem em PAUSA. Ao ligar, pausar os grupos "Impermeabilização de
Sofás" das campanhas de sofás, senão as duas campanhas disputam as mesmas pesquisas.

    python3 docs/google-ads/gerar-csv-impermeabilizacao.py
"""
import csv, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def le(caminho, padrao):
    txt = open(os.path.join(ROOT, caminho), encoding="utf-8").read()
    m = re.search(padrao, txt, re.S)
    if not m:
        raise SystemExit(f"não encontrei {padrao!r} em {caminho}")
    return m.group(1)

Q = "src/components/quiz/QuizTypes.ts"
RATING  = le("src/constants/business.ts", r'REVIEW_RATING\s*=\s*"([\d.]+)"').replace(".", ",")
REVIEWS = le("src/constants/business.ts", r'REVIEW_COUNT\s*=\s*"(\d+)"')
ESSENC  = le(Q, r"id: '1-lugar',[^\n]*?waterproofingPrice: (\d+)")
PREMIUM = le(Q, r"id: '1-lugar',[^\n]*?waterproofingPremiumPrice: (\d+)")
PACK    = str(int(le(Q, r"id: '1-lugar',[^\n]*?bothPrice: (\d+)"))
              - int(le(Q, r"waterproofingUpsellDiscount: (\d+), id: '1-lugar'")))
# Cadeiras a partir de 5 (chairPricing.ts): Essencial 18€, Premium 25€.
CAD_ESS = le("src/constants/chairPricing.ts", r"(?:ESSENTIAL|ESSENCIAL)[A-Z_]*\s*=\s*(\d+)")
CAD_PRE = le("src/constants/chairPricing.ts", r"PREMIUM[A-Z_]*\s*=\s*(\d+)")

def cidade(city):
    return "{LOCATION(City):" + city + "}"

def visivel(t):
    return re.sub(r"\{LOCATION\(City\):([^}]*)\}", r"\1", t)

AVAL = f"+{REVIEWS} Avaliações de Clientes"
NOTA = f"Avaliação Média de {RATING}"

def sofas(city):
    c = city.lower()
    return dict(
        adgroup="Impermeabilização de Sofás",
        url=f"https://cleansolutions.com.pt/impermeabilizacao-{c}?ads=1",
        p1="impermeabilizar", p2=c,
        keywords=[f"impermeabilização de sofás {c}", f"impermeabilizar sofá {c}",
                  f"impermeabilização sofá {c}", "impermeabilização de sofás",
                  "impermeabilização sofá", "impermeabilizar sofá",
                  "impermeabilização de sofás preço", "quanto custa impermeabilizar um sofá",
                  "proteção anti manchas sofá", "tratamento anti manchas sofá",
                  "sofá anti manchas", "proteger sofá de manchas",
                  "proteger sofá de nódoas", "sofá impermeável",
                  "impermeabilizante para sofá profissional", "nano proteção sofá",
                  "limpeza e impermeabilização de sofás", "pack limpeza e impermeabilização sofá"],
        headlines=[f"Impermeabilizar Sofá {cidade(city)}", "Proteção Anti-Manchas no Sofá",
                   "Líquidos Ficam à Superfície", "Vinho, Café e Sumo no Sofá?",
                   "Repele Água e Derrames", "Proteja Antes da Próxima Nódoa",
                   "Crianças e Animais em Casa?", "Premium: Protege Até 10 Anos",
                   "Resiste a Até 5 Lavagens", f"Essencial Desde {ESSENC}€",
                   f"Premium Desde {PREMIUM}€", f"Limpeza + Proteção {PACK}€",
                   NOTA, AVAL, "Aplicação ao Domicílio"],
        descriptions=[
            "Proteção anti-manchas: vinho, café ou sumo ficam à superfície e limpam-se fácil.",
            f"Essencial desde {ESSENC}€, Premium desde {PREMIUM}€. Aplicação ao domicílio.",
            "A Premium protege até 10 anos e resiste a até 5 lavagens. Tecido continua igual.",
            f"Limpeza e proteção na mesma visita desde {PACK}€. Avaliação média de {RATING}."],
    )

def cadeiras(city):
    c = city.lower()
    return dict(
        adgroup="Impermeabilização de Cadeiras",
        url=f"https://cleansolutions.com.pt/impermeabilizacao-cadeiras-{c}?ads=1",
        p1="cadeiras", p2=c,
        keywords=[f"impermeabilização de cadeiras {c}", "impermeabilização de cadeiras",
                  "impermeabilizar cadeiras", "impermeabilizar cadeiras de jantar",
                  "proteção anti manchas cadeiras", "cadeiras de tecido anti manchas",
                  "impermeabilização de estofos", f"impermeabilização de estofos {c}",
                  "impermeabilizar estofos", "impermeabilização cadeiras restaurante"],
        headlines=["Impermeabilização de Cadeiras", "Cadeiras de Jantar Protegidas",
                   "Proteção Anti-Manchas", "Molho e Vinho à Superfície",
                   f"Essencial Desde {CAD_ESS}€/Cadeira", f"Premium Desde {CAD_PRE}€/Cadeira",
                   "Impermeabilização de Estofos", "Restaurantes e Casas",
                   "Premium: Protege Até 10 Anos", "Aplicação ao Domicílio",
                   "Orçamento Grátis no WhatsApp", "Resposta em 5 Minutos",
                   NOTA, AVAL, "Crianças à Mesa? Sem Stress"],
        descriptions=[
            "Proteção anti-manchas para cadeiras de tecido: derrames ficam à superfície.",
            f"Essencial desde {CAD_ESS}€ e Premium desde {CAD_PRE}€ por cadeira. Aplicação no local.",
            "Ideal para cadeiras de jantar, crianças e restaurantes. Tecido mantém o toque.",
            f"Avaliação média de {RATING} em mais de {REVIEWS} avaliações. Orçamento pelo WhatsApp."],
    )

# Orçamento proposto (dono decide antes de ligar): Lisboa primeiro, porque tem o
# clique mais barato e mais folga nas equipas; o Porto 1 está apertado desde 27/10.
CAMPANHAS = [("Kyro | Lisboa | Impermeabilização de Estofos | Out 2026", "Lisboa", "25"),
             ("Kyro | Porto | Impermeabilização de Estofos | Out 2026", "Porto", "15")]

cols = ["Campaign", "Campaign Type", "Campaign Status", "Budget", "Bid Strategy Type", "Networks",
        "Anúncios políticos da UE", "Ad Group", "Ad Group Status", "Max CPC", "Keyword",
        "Criterion Type", "Ad type", "Final URL", "Path 1", "Path 2", "Status"]
cols += [f"Headline {i}" for i in range(1, 16)] + [f"Description {i}" for i in range(1, 5)]

rows, erros = [], []
for nome, city, orc in CAMPANHAS:
    rows.append({"Campaign": nome, "Campaign Type": "Search", "Campaign Status": "Paused",
                 "Budget": orc, "Bid Strategy Type": "Maximize clicks", "Networks": "Google search",
                 "Anúncios políticos da UE": "Não"})
    for g in (sofas(city), cadeiras(city)):
        rows.append({"Campaign": nome, "Ad Group": g["adgroup"], "Ad Group Status": "Enabled", "Max CPC": "2,00"})
        for kw in g["keywords"]:
            rows.append({"Campaign": nome, "Ad Group": g["adgroup"], "Keyword": kw,
                         "Criterion Type": "Expressão", "Status": "Enabled"})
        if len(g["headlines"]) != 15 or len(g["descriptions"]) != 4:
            erros.append(f"{g['adgroup']}: precisa de 15 títulos e 4 descrições")
        ad = {"Campaign": nome, "Ad Group": g["adgroup"], "Ad type": "Responsive search ad",
              "Final URL": g["url"], "Path 1": g["p1"], "Path 2": g["p2"], "Status": "Enabled"}
        ad.update({f"Headline {i}": h for i, h in enumerate(g["headlines"], 1)})
        ad.update({f"Description {i}": d for i, d in enumerate(g["descriptions"], 1)})
        rows.append(ad)

for r in rows:
    for i in range(1, 16):
        v = visivel(r.get(f"Headline {i}", ""))
        if len(v) > 30: erros.append(f"título {len(v)}: {v}")
    for i in range(1, 5):
        v = visivel(r.get(f"Description {i}", ""))
        if len(v) > 90: erros.append(f"descrição {len(v)}: {v}")
    for p in ("Path 1", "Path 2"):
        if len(r.get(p, "")) > 15: erros.append(f"caminho: {r[p]}")
    texto = " ".join(str(v) for v in r.values()).lower()
    for proibido in ("qualquer líquido", "à prova de", "garantid", "elimina", "100%"):
        if proibido in texto: erros.append(f"afirmação absoluta '{proibido}': {r.get('Ad Group')}")
if erros:
    raise SystemExit("erros:\n" + "\n".join(erros))

destino = os.path.join(ROOT, "docs/google-ads/campanha-impermeabilizacao.csv")
with open(destino, "w", newline="", encoding="utf-8-sig") as f:
    w = csv.DictWriter(f, fieldnames=cols)
    w.writeheader()
    for r in rows:
        w.writerow({c: r.get(c, "") for c in cols})
print(f"{len(rows)} linhas. Sofá Essencial {ESSENC}€ / Premium {PREMIUM}€ / pack {PACK}€; "
      f"cadeiras {CAD_ESS}€ / {CAD_PRE}€")
