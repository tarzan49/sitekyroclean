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
# O pack é o que o motor cobra (calcPackPricing): bothPrice MENOS o
# waterproofingUpsellDiscount. Ler só o bothPrice deu "desde 99€" nos anúncios
# enquanto o site cobrava 89€ (corrigido a 26/09/2026, dono: "pack desde 89").
PACK_1L      = str(int(le("src/components/quiz/QuizTypes.ts", r"id: '1-lugar',.*?bothPrice: (\d+)"))
                   - int(le("src/components/quiz/QuizTypes.ts", r"waterproofingUpsellDiscount: (\d+), id: '1-lugar'")))

# A equipa do Porto também serve Braga, Guimarães e o resto do Norte.
EQUIPA = {"Porto": "Equipa Própria no Norte", "Lisboa": "Equipa Própria em Lisboa"}
# Decisão do dono (23/09/2026): Lisboa arranca com o dobro do Porto.
ORCAMENTO = {"Porto": "13,00", "Lisboa": "27,00"}

# Inserção automática da cidade (26/09/2026): quem pesquisa em Gaia ou no
# Seixal lê "Limpeza de Sofás Gaia"; sem cidade reconhecida, sai o texto a
# seguir aos dois pontos. A Google conta os carateres por esse texto.
def cidade(city):
    return "{LOCATION(City):" + city + "}"

def visivel(texto):
    return re.sub(r"\{LOCATION\(City\):([^}]*)\}", r"\1", texto)

# Sem "no Google" (26/09/2026): a ficha do Google mostra números por
# estabelecimento que não coincidem com o total, e o anúncio não pode prometer
# o que a ficha ao lado desmente.
AVAL_TITULO  = f"+{REVIEWS} Avaliações de Clientes"
RATING_TITULO = f"Avaliação Média de {RATING}"

def limpeza(city):
    c = city.lower()
    return dict(
        adgroup="Limpeza de Sofás",
        url=f"https://cleansolutions.com.pt/limpeza-sofas-{c}?ads=1",
        p1="limpeza-sofas", p2=c,
        keywords=[f"limpeza de sofás {c}", f"limpeza de sofá {c}", f"higienização de sofás {c}",
                  f"lavagem de sofás {c}", f"limpar sofá {c}", f"limpeza de estofos {c}",
                  "limpeza de sofás ao domicílio", "empresa de limpeza de sofás",
                  "preço limpeza sofá", "quanto custa limpar um sofá",
                  "limpeza de sofás preço", "higienização de estofos",
                  # Termos gerais sem cidade (26/09/2026): com a segmentação em
                  # "Presença", quem pesquisa só "limpeza de sofás" na zona também vê.
                  "limpeza de sofás", "limpeza sofá", "higienização de sofás",
                  "higienização sofá", "lavagem de sofás", "limpeza de estofos"],
        # Os títulos com palavra-chave de procura (higienização, estofos, ao
        # domicílio) levaram Lisboa de "Boa" a "Excelente"; a 26/09/2026 os dois
        # anúncios de limpeza ficaram iguais, só muda a equipa.
        headlines=[f"Limpeza de Sofás {cidade(city)}", f"Higienização de Sofás {cidade(city)}",
                   AVAL_TITULO, RATING_TITULO,
                   f"{CLIENTES} Clientes Servidos", "Resposta em 10 Minutos",
                   "Orçamento Grátis no WhatsApp", "Preço Fechado Antes de Marcar",
                   "Garantia de Repetição", "Limpeza de Sofás ao Domicílio",
                   "Secagem Média de 3 a 6 Horas", "Manchas, Pelos e Odores",
                   f"Limpeza de Estofos {cidade(city)}", EQUIPA[city],
                   "Limpe e Proteja no Mesmo Dia"],
        # Descrições sem cidade: a cidade já está nos títulos, e quem está em
        # Almada não deve ler "em Lisboa".
        descriptions=[
            "Higienização profissional de sofás ao domicílio. Secagem média de 3 a 6 horas.",
            f"Avaliação média de {RATING} em mais de {REVIEWS} avaliações e mais de "
            f"{CLIENTES.lstrip('+')} clientes servidos.",
            "Preço fechado antes da marcação, sem surpresas. Orçamento grátis pelo WhatsApp.",
            "Se não ficar satisfeito, avise em 48 horas e repetimos a limpeza sem custos."],
    )

def imper(city):
    c = city.lower()
    return dict(
        adgroup="Impermeabilização de Sofás",
        url=f"https://cleansolutions.com.pt/impermeabilizacao-{c}?ads=1",
        p1="protecao-sofas", p2=c,
        keywords=[f"impermeabilização de sofás {c}", f"impermeabilizar sofá {c}",
                  f"impermeabilização de estofos {c}", "limpeza e impermeabilização de sofás",
                  "impermeabilização de sofás preço", "quanto custa impermeabilizar um sofá",
                  "pack limpeza e impermeabilização sofá",
                  "impermeabilização de sofás", "impermeabilização sofá",
                  "impermeabilizar sofá", "impermeabilização de estofos"],
        # "Limpa com um Pano, Sem Nódoa" e "saem com um pano seco" saíram a
        # 26/09/2026: prometiam um resultado garantido que a proteção não dá.
        # Os preços passaram a "Desde", porque o 59€ e o pack são de 1 lugar.
        headlines=["Impermeabilização de Sofás", f"Impermeabilizar Sofá {cidade(city)}",
                   "Vinho, Café e Sumo no Sofá", "Derrames Ficam à Superfície",
                   "Impermeabilização de Estofos", "Proteja Antes da Próxima Nódoa",
                   "Crianças e Animais em Casa?", "Premium: Até 10 Anos",
                   "Resiste a Até 5 Lavagens", f"Impermeabilização Desde {IMPER_ESSENC}€",
                   f"Limpeza + Proteção Desde {PACK_1L}€", RATING_TITULO,
                   AVAL_TITULO, "Aplicação ao Domicílio",
                   "Orçamento Grátis no WhatsApp"],
        descriptions=[
            "Com a proteção, vinho, café ou sumo ficam à superfície e limpam-se com mais facilidade.",
            f"Impermeabilização de sofás ao domicílio. Essencial desde {IMPER_ESSENC}€, Premium desde {IMPER_PREMIUM}€.",
            "A Premium protege até 10 anos e resiste a até 5 lavagens. A Essencial, 1 a 2 anos.",
            f"Limpeza e proteção na mesma visita, em pack desde {PACK_1L}€. Avaliação média de {RATING}."],
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
        if len(visivel(v)) > 30: erros.append(f"título {len(visivel(v))}: {v}")
    for i in range(1, 5):
        v = r.get(f"Description {i}", "")
        if len(visivel(v)) > 90: erros.append(f"descrição {len(visivel(v))}: {v}")
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

# ---------------------------------------------------------------------------
# Grupos novos de tapetes e colchões (28/09/2026, dono: "prepara os de tapetes
# e colchões em pausa"). Vão para um ficheiro à parte e só com linhas de grupo,
# palavra-chave e anúncio: o CSV de cima traz as campanhas com "Paused" e
# orçamentos antigos, e carregá-lo outra vez pausava as campanhas no ar.
# ---------------------------------------------------------------------------

# Colchão: o mais barato da tabela e o anti-ácaros acrescentado (bothPrice - cleaningPrice),
# os mesmos números que o site mostra (enginePrices.ts).
COLCHAO_DESDE = le("src/components/quiz/QuizTypes.ts", r"id: 'solteiro',.*?cleaningPrice: (\d+)")
COLCHAO_CASAL = le("src/components/quiz/QuizTypes.ts", r"id: 'casal',.*?cleaningPrice: (\d+)")
COLCHAO_KING = le("src/components/quiz/QuizTypes.ts", r"id: 'king',.*?cleaningPrice: (\d+)")
ANTI_ACAROS_COLCHAO = str(int(le("src/components/quiz/QuizTypes.ts", r"id: 'solteiro',.*?bothPrice: (\d+)"))
                          - int(COLCHAO_DESDE))

BASE_TITULOS = [AVAL_TITULO, RATING_TITULO, f"{CLIENTES} Clientes Servidos",
                "Resposta em 10 Minutos", "Orçamento Grátis no WhatsApp",
                "Preço Fechado Antes de Marcar", "Garantia de Repetição"]
DESC_AVAL = (f"Avaliação média de {RATING} em mais de {REVIEWS} avaliações e mais de "
             f"{CLIENTES.lstrip('+')} clientes servidos.")
DESC_GARANTIA = "Se não ficar satisfeito, avise em 48 horas e repetimos a limpeza sem custos."

def tapetes(city):
    c = city.lower()
    return dict(
        adgroup="Limpeza de Tapetes",
        url=f"https://cleansolutions.com.pt/limpeza-tapetes-{c}?ads=1",
        p1="tapetes", p2=c,
        keywords=[f"limpeza de tapetes {c}", f"lavagem de tapetes {c}", f"lavar tapetes {c}",
                  f"limpeza de carpetes {c}", "limpeza de tapetes", "lavagem de tapetes",
                  "limpeza de carpetes", "lavagem de carpetes", "higienização de tapetes",
                  "limpeza de tapetes ao domicílio", "empresa de limpeza de tapetes",
                  "lavagem de tapetes preço", "quanto custa lavar um tapete",
                  # 29/09/2026, segunda ronda ("quero algo extremamente bom"):
                  f"higienização de tapetes {c}", f"lavagem de carpetes {c}",
                  "lavagem de tapetes ao domicílio", "limpeza de tapetes em casa",
                  "lavandaria de tapetes", "limpeza de tapetes de lã", "lavagem de tapetes de lã",
                  "limpeza de tapetes persas", "lavagem de tapetes persas",
                  "recolha de tapetes para lavar"],
        # Tapetes são sempre sob orçamento: nenhum título ou descrição leva preço.
        # Também sem "recolha": o site diz de propósito que a modalidade (em
        # casa ou recolhido) se confirma no orçamento, e o anúncio não pode
        # prometer o que a página não promete.
        # v3 (29/09/2026). Concorrência lida no mesmo dia: as lavandarias de
        # tapetes levam cerca de uma semana (Washouse 6 dias úteis, LavCarpet ~1
        # semana); a Kyro lava no local e o tapete fica seco em 3 a 6 horas
        # (FAQ da página-pilar). Recolha só quando é precisa (dono: "prefiro
        # ao domicílio"), com entrega em até 4 dias úteis (dono, 05/10/2026; eram 3 dias). Tapetes nunca levam preço. Sem percentagens de ácaros.
        headlines=[f"Limpeza de Tapetes {cidade(city)}", f"Lavagem de Tapetes {cidade(city)}",
                   "Higienização de Tapetes", f"Limpeza de Carpetes {cidade(city)}",
                   "Tapetes Lavados ao Domicílio", "Sem Levar o Tapete de Casa",
                   "Seco em 3 a 6 Horas", "Entrega em 4 Dias Úteis",
                   "Lã, Persas, Shaggy e Sisal", "Manchas, Pelos e Odores",
                   "Orçamento por Foto no WhatsApp", "Preço Fechado Antes de Marcar",
                   AVAL_TITULO, RATING_TITULO, "Garantia de Repetição 48h"],
        descriptions=[
            "Lavagem de tapetes ao domicílio com extração profunda. Fica seco em 3 a 6 horas.",
            "Envie foto e medidas pelo WhatsApp e receba o preço fechado antes de marcar.",
            "Lã, persas, shaggy e sisal. Se for preciso recolher, entregamos em 4 dias úteis.",
            DESC_AVAL],
    )

def colchoes(city):
    c = city.lower()
    return dict(
        adgroup="Limpeza de Colchões",
        url=f"https://cleansolutions.com.pt/limpeza-colchoes-{c}?ads=1",
        p1="colchoes", p2=c,
        keywords=[f"limpeza de colchões {c}", f"limpeza de colchão {c}",
                  f"higienização de colchões {c}", f"lavagem de colchão {c}",
                  "limpeza de colchões", "limpeza de colchão", "higienização de colchões",
                  "higienização de colchão", "lavagem de colchões",
                  "limpeza de colchões ao domicílio", "limpeza de colchão preço",
                  "tratamento anti ácaros colchão",
                  # 29/09/2026, segunda ronda:
                  f"higienização de colchão {c}", f"lavagem de colchões {c}",
                  "limpeza de colchões em casa", "higienização de colchões ao domicílio",
                  "lavagem de colchão", "desinfeção de colchões", "anti ácaros colchão",
                  "limpeza de colchão de casal", "limpeza de colchão urina"],
        # Sem verbos de eliminar/matar (regra das afirmações absolutas do CLAUDE.md).
        # v3 (29/09/2026). Ninguém na concorrência publica os três tamanhos
        # (O Janota dá dois, os outros "desde"): a Kyro dá solteiro e casal.
        # "Sem tirar o colchão" é a FAQ da página ("não precisa de retirar o
        # colchão"). Sem "99% dos ácaros": não é verificável.
        headlines=[f"Limpeza de Colchões {cidade(city)}", "Higienização de Colchões",
                   f"Lavagem de Colchões {cidade(city)}", "Limpeza de Colchões em Casa",
                   f"Colchões Desde {COLCHAO_DESDE}€", f"Colchão de Casal Desde {COLCHAO_CASAL}€",
                   "Tratamento Anti-Ácaros", "Manchas de Urina e Suor",
                   "Sem Tirar o Colchão de Casa", "Secagem Média de 3 a 6 Horas",
                   "Preço Fechado Antes de Marcar", "Orçamento Grátis no WhatsApp",
                   AVAL_TITULO, RATING_TITULO, "Garantia de Repetição 48h"],
        descriptions=[
            "Limpeza e higienização de colchões ao domicílio, sem tirar o colchão do quarto.",
            f"Solteiro desde {COLCHAO_DESDE}€, casal desde {COLCHAO_CASAL}€, king desde {COLCHAO_KING}€. Anti-ácaros opcional.",
            "Manchas de urina, suor e marcas amareladas tratadas no local. Secagem de 3 a 6 horas.",
            f"Avaliação média de {RATING} em mais de {REVIEWS} avaliações. Orçamento grátis pelo WhatsApp."],
    )

# O carregamento de linhas soltas (sem a linha da campanha) exige o ID da
# campanha: só com o nome, a Google recusa todas ("Valor em falta em ID da
# campanha", visto a 28/09/2026). IDs da conta 920-786-3494.
CAMPANHA_ID = {"Porto": "24286916320", "Lisboa": "24275823960"}

novos = []
for nome, city in CAMPANHAS:
    for g in (tapetes(city), colchoes(city)):
        cid = CAMPANHA_ID[city]
        novos.append({"Campaign ID": cid, "Campaign": nome, "Ad Group": g["adgroup"], "Ad Group Status": "Paused", "Max CPC": "1,50"})
        for kw in g["keywords"]:
            novos.append({"Campaign ID": cid, "Campaign": nome, "Ad Group": g["adgroup"], "Keyword": kw,
                          "Criterion Type": "Expressão", "Status": "Enabled"})
        ad = {"Campaign ID": cid, "Campaign": nome, "Ad Group": g["adgroup"], "Ad type": "Responsive search ad",
              "Final URL": g["url"], "Path 1": g["p1"], "Path 2": g["p2"], "Status": "Enabled"}
        ad.update({f"Headline {i}": h for i, h in enumerate(g["headlines"], 1)})
        ad.update({f"Description {i}": d for i, d in enumerate(g["descriptions"], 1)})
        novos.append(ad)

erros = []
for r in novos:
    for i in range(1, 16):
        v = r.get(f"Headline {i}", "")
        if len(visivel(v)) > 30: erros.append(f"título {len(visivel(v))}: {v}")
    if r.get("Ad type") and len([i for i in range(1, 16) if r.get(f"Headline {i}")]) != 15:
        erros.append(f"{r['Ad Group']}: não tem 15 títulos")
    for i in range(1, 5):
        v = r.get(f"Description {i}", "")
        if len(visivel(v)) > 90: erros.append(f"descrição {len(visivel(v))}: {v}")
    for p in ("Path 1", "Path 2"):
        if len(r.get(p, "")) > 15: erros.append(f"caminho: {r[p]}")
if erros:
    raise SystemExit("acima do limite:\n" + "\n".join(erros))

novas_cols = ["Campaign ID"] + [c for c in cols if c not in ("Campaign Type", "Campaign Status", "Budget",
                                           "Bid Strategy Type", "Networks", "Anúncios políticos da UE")]
destino = os.path.join(ROOT, "docs/google-ads/grupos-tapetes-colchoes.csv")
with open(destino, "w", newline="", encoding="utf-8-sig") as f:
    w = csv.DictWriter(f, fieldnames=novas_cols)
    w.writeheader()
    for r in novos:
        w.writerow({c: r.get(c, "") for c in novas_cols})
PRIMEIRA_RONDA = 13, 12  # tapetes, colchões: carregadas a 29/09/2026 00:00
extra = []
for nome, city in CAMPANHAS:
    for g, n in ((tapetes(city), PRIMEIRA_RONDA[0]), (colchoes(city), PRIMEIRA_RONDA[1])):
        for kw in g["keywords"][n:]:
            extra.append({"Campaign ID": CAMPANHA_ID[city], "Campaign": nome, "Ad Group": g["adgroup"],
                          "Keyword": kw, "Criterion Type": "Expressão", "Status": "Enabled"})
with open(os.path.join(ROOT, "docs/google-ads/palavras-extra-tapetes-colchoes.csv"), "w", newline="", encoding="utf-8-sig") as f:
    w = csv.DictWriter(f, fieldnames=novas_cols)
    w.writeheader()
    for r in extra:
        w.writerow({c: r.get(c, "") for c in novas_cols})
print(f"{len(extra)} palavras-chave novas (segunda ronda)")
v2 = [r for r in novos if r.get("Ad type")]
with open(os.path.join(ROOT, "docs/google-ads/anuncios-v3-tapetes-colchoes.csv"), "w", newline="", encoding="utf-8-sig") as f:
    w = csv.DictWriter(f, fieldnames=novas_cols)
    w.writeheader()
    for r in v2:
        w.writerow({c: r.get(c, "") for c in novas_cols})
print(f"{len(v2)} anúncios v3")
print(f"{len(novos)} linhas de tapetes/colchões (grupos em pausa). Colchão desde {COLCHAO_DESDE}€, "
      f"anti-ácaros +{ANTI_ACAROS_COLCHAO}€")
