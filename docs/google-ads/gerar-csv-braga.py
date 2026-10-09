# -*- coding: utf-8 -*-
"""Gera campanha-braga.csv: a campanha de Braga (9/10/2026), criada por carregamento em massa.

Oito grupos (limpeza e impermeabilização × Braga, Guimarães, Famalicão, Barcelos), cada anúncio
a abrir a página da sua cidade. Os factos saem das constantes do site, como no gerar-csv.py.
Correr: python3 docs/google-ads/gerar-csv-braga.py
"""
import csv, re, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
def le(c, p):
    m = re.search(p, open(os.path.join(ROOT, c), encoding="utf-8").read(), re.S)
    if not m: raise SystemExit(p)
    return m.group(1)
RATING = le("src/constants/business.ts", r'REVIEW_RATING\s*=\s*"([\d.]+)"').replace(".", ",")
REVIEWS = le("src/constants/business.ts", r'REVIEW_COUNT\s*=\s*"(\d+)"')
CLIENTES = le("src/constants/business.ts", r'CLIENTS_SERVED_LABEL\s*=\s*"([^"]+)"')
QT = "src/components/quiz/QuizTypes.ts"
IMPER_E = le(QT, r"id: '1-lugar',.*?waterproofingPrice: (\d+)")
IMPER_P = le(QT, r"id: '1-lugar',.*?waterproofingPremiumPrice: (\d+)")
PACK = str(int(le(QT, r"id: '1-lugar',.*?bothPrice: (\d+)")) - int(le(QT, r"waterproofingUpsellDiscount: (\d+), id: '1-lugar'")))

NOME = "Kyro | Braga | Limpeza e Proteção de Sofás | Out 2026"
# (nome no anúncio, slug, palavras da cidade, inclui termos gerais)
CIDADES = [("Braga", "braga", ["braga"], True),
           ("Guimarães", "guimaraes", ["guimarães", "guimaraes"], False),
           ("Famalicão", "vila-nova-de-famalicao", ["famalicão", "famalicao", "vila nova de famalicão"], False),
           ("Barcelos", "barcelos", ["barcelos"], False)]

def vis(t): return re.sub(r"\{LOCATION\(City\):([^}]*)\}", r"\1", t)
def ok(h): return len(vis(h)) <= 30
AVAL = f"+{REVIEWS} Avaliações de Clientes"
RAT = f"Avaliação Média de {RATING}"

def limpeza(nome, slug, kws, gerais):
    k = []
    for c in kws:
        k += [f"limpeza de sofás {c}", f"limpeza de sofá {c}", f"higienização de sofás {c}",
              f"lavagem de sofás {c}", f"limpar sofá {c}", f"limpeza de estofos {c}"]
    if gerais:
        k += ["limpeza de sofás ao domicílio", "empresa de limpeza de sofás", "preço limpeza sofá",
              "quanto custa limpar um sofá", "limpeza de sofás preço", "higienização de estofos",
              "limpeza de sofás", "limpeza sofá", "higienização de sofás", "higienização sofá",
              "lavagem de sofás"]
    hl = [f"Limpeza de Sofás {nome}", f"Higienização de Sofás {nome}", f"Sofás Limpos em {nome}",
          AVAL, RAT, f"{CLIENTES} Clientes Servidos", "Resposta em 5 Minutos",
          "Orçamento Grátis no WhatsApp", "Preço Fechado Antes de Marcar", "Garantia de Repetição",
          "Limpeza de Sofás ao Domicílio", "Secagem Média de 2 a 5 Horas", "Manchas, Pelos e Odores",
          f"Limpeza de Estofos {nome}", "Equipa Própria no Norte", "Limpe e Proteja no Mesmo Dia",
          "Limpeza de Sofás Desde 49€"]
    hl = [h for h in hl if ok(h)][:15]
    ds = ["Higienização profissional de sofás ao domicílio. Secagem média de 2 a 5 horas.",
          f"Avaliação média de {RATING} em mais de {REVIEWS} avaliações e mais de {CLIENTES.lstrip('+')} clientes servidos.",
          "Preço fechado antes da marcação, sem surpresas. Orçamento grátis pelo WhatsApp.",
          "Se não ficar satisfeito, avise em 48 horas e repetimos a limpeza sem custos."]
    return dict(ag=f"Limpeza de Sofás | {nome}", url=f"https://cleansolutions.com.pt/limpeza-sofas-{slug}?ads=1",
                p1="limpeza-sofas", p2=slug[:15] if len(slug) <= 15 else "famalicao", kw=k, hl=hl, ds=ds)

def imper(nome, slug, kws, gerais):
    k = []
    for c in kws:
        k += [f"impermeabilização de sofás {c}", f"impermeabilizar sofá {c}", f"impermeabilização de estofos {c}"]
    if gerais:
        k += ["limpeza e impermeabilização de sofás", "impermeabilização de sofás preço",
              "quanto custa impermeabilizar um sofá", "impermeabilização de sofás", "impermeabilização sofá",
              "impermeabilizar sofá", "impermeabilização de estofos"]
    hl = ["Impermeabilização de Sofás", f"Impermeabilizar Sofá {nome}", f"Proteção de Sofás {nome}",
          "Vinho, Café e Sumo no Sofá", "Derrames Ficam à Superfície", "Impermeabilização de Estofos",
          "Proteja Antes da Próxima Nódoa", "Crianças e Animais em Casa?", "Premium: Até 10 Anos",
          "Resiste a Até 5 Lavagens", f"Impermeabilização Desde {IMPER_E}€", f"Limpeza + Proteção Desde {PACK}€",
          RAT, AVAL, "Aplicação ao Domicílio", "Orçamento Grátis no WhatsApp"]
    hl = [h for h in hl if ok(h)][:15]
    ds = ["Com a proteção, vinho, café ou sumo ficam à superfície e limpam-se com mais facilidade.",
          f"Impermeabilização de sofás ao domicílio. Essencial desde {IMPER_E}€, Premium desde {IMPER_P}€.",
          "A Premium protege até 10 anos e resiste a até 5 lavagens. A Essencial, 1 a 2 anos.",
          f"Limpeza e proteção na mesma visita, em pack desde {PACK}€. Avaliação média de {RATING}."]
    return dict(ag=f"Impermeabilização | {nome}", url=f"https://cleansolutions.com.pt/impermeabilizacao-{slug}?ads=1",
                p1="protecao-sofas", p2=slug if len(slug) <= 15 else "famalicao", kw=k, hl=hl, ds=ds)

cols = ["Campaign", "Campaign Type", "Campaign Status", "Budget", "Bid Strategy Type", "Networks",
        "Anúncios políticos da UE", "Ad Group", "Ad Group Status", "Keyword", "Criterion Type",
        "Ad type", "Final URL", "Path 1", "Path 2", "Status"]
cols += [f"Headline {i}" for i in range(1, 16)] + [f"Description {i}" for i in range(1, 5)]
rows = [{"Campaign": NOME, "Campaign Type": "Search", "Campaign Status": "Paused", "Budget": "15,00",
         "Bid Strategy Type": "Maximize clicks", "Networks": "Google search", "Anúncios políticos da UE": "Não"}]
for c in CIDADES:
    for g in (limpeza(*c), imper(*c)):
        rows.append({"Campaign": NOME, "Ad Group": g["ag"], "Ad Group Status": "Enabled"})
        for kw in g["kw"]:
            rows.append({"Campaign": NOME, "Ad Group": g["ag"], "Keyword": kw, "Criterion Type": "Expressão", "Status": "Enabled"})
        ad = {"Campaign": NOME, "Ad Group": g["ag"], "Ad type": "Responsive search ad", "Final URL": g["url"],
              "Path 1": g["p1"], "Path 2": g["p2"], "Status": "Enabled"}
        assert len(g["hl"]) >= 10, g["ag"]
        ad.update({f"Headline {i}": h for i, h in enumerate(g["hl"], 1)})
        ad.update({f"Description {i}": d for i, d in enumerate(g["ds"], 1)})
        for d in g["ds"]: assert len(d) <= 90, d
        for p in (g["p1"], g["p2"]): assert len(p) <= 15, p
        rows.append(ad)
out = os.path.join(ROOT, "docs/google-ads/campanha-braga.csv")
with open(out, "w", newline="", encoding="utf-8-sig") as f:
    w = csv.DictWriter(f, fieldnames=cols); w.writeheader()
    for r in rows: w.writerow({c: r.get(c, "") for c in cols})
print(len(rows), "linhas", RATING, REVIEWS, CLIENTES, IMPER_E, IMPER_P, PACK)
for r in rows:
    if r.get("Ad type"): print(r["Ad Group"], sum(1 for i in range(1,16) if r.get(f"Headline {i}")), r["Final URL"])
