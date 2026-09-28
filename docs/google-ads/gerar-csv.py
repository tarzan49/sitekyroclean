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
                  "lavagem de tapetes preço", "quanto custa lavar um tapete"],
        # Tapetes são sempre sob orçamento: nenhum título ou descrição leva preço.
        # Também sem "recolha": o site diz de propósito que a modalidade (em
        # casa ou recolhido) se confirma no orçamento, e o anúncio não pode
        # prometer o que a página não promete.
        headlines=[f"Limpeza de Tapetes {cidade(city)}", f"Lavagem de Tapetes {cidade(city)}",
                   *BASE_TITULOS,
                   "Tapetes com Extração Profunda", "Método Conforme o Tapete",
                   "Manchas, Pelos e Odores", "Limpeza de Carpetes",
                   EQUIPA[city], "Envie Foto e Medidas"],
        descriptions=[
            "Lavagem profissional de tapetes com extração profunda e método escolhido pelo material.",
            DESC_AVAL,
            "Envie uma foto e as medidas pelo WhatsApp e receba o preço fechado antes de marcar.",
            DESC_GARANTIA],
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
                  "tratamento anti ácaros colchão"],
        # Sem verbos de eliminar/matar (regra das afirmações absolutas do CLAUDE.md).
        headlines=[f"Limpeza de Colchões {cidade(city)}", "Higienização de Colchões",
                   f"Colchões Desde {COLCHAO_DESDE}€",
                   *BASE_TITULOS,
                   "Secagem Média de 3 a 6 Horas", "Manchas, Urina e Odores",
                   "Tratamento Anti-Ácaros", EQUIPA[city],
                   "Limpeza de Colchões em Casa"],
        descriptions=[
            "Higienização profissional de colchões ao domicílio. Secagem média de 3 a 6 horas.",
            DESC_AVAL,
            f"Limpeza de colchão desde {COLCHAO_DESDE}€. Tratamento anti-ácaros acrescentado desde {ANTI_ACAROS_COLCHAO}€.",
            DESC_GARANTIA],
    )

novos = []
for nome, city in CAMPANHAS:
    for g in (tapetes(city), colchoes(city)):
        novos.append({"Campaign": nome, "Ad Group": g["adgroup"], "Ad Group Status": "Paused", "Max CPC": "1,50"})
        for kw in g["keywords"]:
            novos.append({"Campaign": nome, "Ad Group": g["adgroup"], "Keyword": kw,
                          "Criterion Type": "Expressão", "Status": "Enabled"})
        ad = {"Campaign": nome, "Ad Group": g["adgroup"], "Ad type": "Responsive search ad",
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

novas_cols = [c for c in cols if c not in ("Campaign Type", "Campaign Status", "Budget",
                                           "Bid Strategy Type", "Networks", "Anúncios políticos da UE")]
destino = os.path.join(ROOT, "docs/google-ads/grupos-tapetes-colchoes.csv")
with open(destino, "w", newline="", encoding="utf-8-sig") as f:
    w = csv.DictWriter(f, fieldnames=novas_cols)
    w.writeheader()
    for r in novos:
        w.writerow({c: r.get(c, "") for c in novas_cols})
print(f"{len(novos)} linhas de tapetes/colchões (grupos em pausa). Colchão desde {COLCHAO_DESDE}€, "
      f"anti-ácaros +{ANTI_ACAROS_COLCHAO}€")
