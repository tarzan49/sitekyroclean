# Navegação no final das páginas

Os diretórios finais usam grupos expansíveis fechados por defeito. Só os cabeçalhos e a quantidade de opções aparecem inicialmente. O utilizador abre e fecha cada grupo ao toque ou com o teclado.

`DirectoryGroup` recebe os elementos Link existentes e preserva destinos e handlers. Listas com oito ou mais opções têm pesquisa interna, insensível a acentos. Os links permanecem no HTML, mesmo com o grupo fechado ou com pesquisa ativa. Uma navegação para outro endereço repõe os grupos fechados e limpa a pesquisa. Suporta fundos claros/escuros e rótulos em inglês.

## Famílias abrangidas

- Seis páginas de serviço principais: `ServiceCityLinks`, regiões fechadas com pesquisa global (implementação anterior).
- Localidade: zonas, outras cidades, serviços, problemas, materiais e marcas.
- Freguesia: freguesias próximas, serviços e problemas.
- Variantes de lavagem/higienização: zonas, cidades e serviços.
- Materiais: materiais relacionados e localidades.
- Preços: serviço principal, outros serviços e cidades.
- Problemas nacionais e locais: serviços, problemas relacionados e cidades.
- Marcas de sofás, colchões e cadeiras: marcas relacionadas.
- Combinações de packs: serviços e packs relacionados.
- Guia de packs: localidades de cada pack. A página de packs deixou de escrever todas as cidades num parágrafo corrido.
- Blog: artigos relacionados.
- Guia em inglês: ligações regionais.
- Áreas de Serviço: região → concelho → serviços/freguesias, tudo fechado inicialmente. Pesquisa global de concelhos e freguesias, com expansão apenas após pesquisar. Inclui também cidades sem freguesias cadastradas.

A homepage, páginas comerciais, páginas inglesas de serviço, páginas institucionais/legais e páginas de confirmação não tinham diretórios finais extensos deste tipo. Os CTAs, conteúdo editorial, contactos e rodapés não foram convertidos em diretórios.

## Verificação

Testes do componente verificam preservação de destinos em HTML fechado, pesquisa sem acentos, pesquisa sem resultados e limpeza. Verificação visual em computador/telemóvel, incluindo o tema escuro, e compilação com pré-renderização das rotas. A integração incluiu a reposição de fragmentos JSX deslocados que já existiam em `SofaVariantPage`; a correção equivalente de `LocationServicePage` veio da tarefa de preview.
