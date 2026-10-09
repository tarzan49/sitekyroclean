// Avaliações reais do Google (dono, 2026-10-09: "substitui todas por avaliações
// reais, com datas reais, das duas fichas"). Transcritas tal como estão nas
// fichas "Kyro Clean Solutions" (Porto) e "Kyro Clean Solutions Lisboa".
// O Google só mostra datas relativas ("há um mês"): `date` é o mês (AAAA-MM)
// calculado a partir dessa data em 2026-10-09, ou só o ano quando o Google
// diz "há um ano"/"há 2 anos". Ficaram de fora as avaliações sem texto, as de
// 3 estrelas ou menos e as que só têm a resposta do proprietário.
// Para acrescentar: copiar da ficha, sem corrigir o texto, com a data e a ficha.

export interface PoolReview {
  name: string;
  city?: string;
  text: string;
  /** Estrelas dadas no Google (4 ou 5). */
  rating?: number;
  /** AAAA-MM, ou AAAA quando o Google só dá o ano. */
  date?: string;
}

interface GoogleReview {
  name: string;
  rating: number;
  date: string;
  profile: 'porto' | 'lisboa';
  text: string;
}

const GOOGLE_REVIEWS: GoogleReview[] = [
  { name: "Oksana Rizol", rating: 5, date: "2026-10", profile: "porto", text: "I’m very happy with the service. What I really appreciated was how quickly they responded. I sent them a message and received a reply within just a few minutes. They were very helpful, understood that I needed the cleaning done as soon as possible, and managed to find the earliest available slot for me.\n\nThe team arrived on time, worked quickly and professionally, and did a great job with the carpet. Everything was easy and efficient, and I’m very pleased with the result.\n\nI’ll definitely be using their services again and would happily recommend them." },
  { name: "Subhash Singh", rating: 5, date: "2026-10", profile: "porto", text: "It was nice experience to hire this company for mattress cleaning. They are very professional in terms of timing and cleaning." },
  { name: "Anne", rating: 5, date: "2026-10", profile: "porto", text: "Estamos muito satisfeitos com a limpeza dos nossos dois tapetes.\nA empresa responde muito rapidamente e a pessoa que veio foi pontual, profissional e simpático" },
  { name: "Cristiano Silva", rating: 5, date: "2026-10", profile: "porto", text: "Top! Marquei a impermeabilização num feriado e no dia a seguir já cá estavam em casa. Pessoal super simpático, trabalho rápido e bem feito. Recomendo a 100%" },
  { name: "Natalia Manqueme", rating: 4, date: "2026-10", profile: "porto", text: "Meninos muito simpáticos,atendimento super rápido e fizeram um trabalho excelente,com certeza que voltaria a chamar." },
  { name: "Sandra Galo", rating: 5, date: "2026-10", profile: "porto", text: "Ótimo serviço e disponibilidade total, o sofá além de limpo ficou como novo" },
  { name: "Cátia Freire", rating: 5, date: "2026-10", profile: "porto", text: "Fiz a limpeza de um sofá e de um colchão. O processo todo de marcação foi rápido e simples e o trabalho em si ficou muito bem feito. Foram simpáticos, profissionais e acessíveis. É sem dúvida uma empresa que voltarei a contratar." },
  { name: "Cleópatra Kórcia", rating: 5, date: "2026-10", profile: "porto", text: "Adoramos! O sofá ficou muito limpo!!!\nRecomendo" },
  { name: "Rita Roque", rating: 5, date: "2026-10", profile: "porto", text: "O meu sofá ficou como novo!! Com um cheirinho incrível." },
  { name: "Adriana Cestarolli", rating: 4, date: "2026-10", profile: "porto", text: "A experiência foi boa. Os estofos e carpete limpos e higienizado. Gostei muito." },
  { name: "Alzira Campos", rating: 5, date: "2026-10", profile: "porto", text: "Trabalho impecável. Muitos parabéns pela competência.\nContratava os serviços novamente sem hesitar." },
  { name: "Sofia Cordeiro", rating: 5, date: "2026-10", profile: "porto", text: "O colchão estava muito manchado e ficou irreconhecível. Recomendo." },
  { name: "Iris Estevez", rating: 5, date: "2026-10", profile: "porto", text: "No geral, o trabalho foi rápido e o serviço excelente. O contato para orçamentos, o esclarecimento de dúvidas e o agendamento foram extremamente eficientes (e significativamente melhores do que em outras ocasiões, já que comparamos orçamentos e serviços em diversos locais da região). Desta vez, o serviço prestado consistiu na impermeabilização de um sofá e oito cadeiras (não para limpeza), o que tornou o atendimento inicial rápido e eficiente. O pacote inclui uma garantia de impermeabilização de 10 anos. Até o momento, testamos apenas com água, mas o sofá e as cadeiras repeliram o líquido. Portanto, tudo está funcionando perfeitamente. O serviço, a cortesia do técnico e sua pontualidade foram fantásticos. O suporte via WhatsApp também foi muito bom." },
  { name: "Joana Direito", rating: 5, date: "2026-10", profile: "porto", text: "Ficámos mesmo muito satisfeitos com o resultado! O sofá estava a precisar de uma boa limpeza e ficou impecável, parece mesmo novo outra vez. O serviço foi feito com cuidado e durou cerca de 1h/1h30. Recomendo sem dúvida! 😊" },
  { name: "Sara Bento Silva", rating: 5, date: "2026-10", profile: "porto", text: "Tudo espetacular! Recomendo 100%" },
  { name: "Hugo Gomes", rating: 5, date: "2026-09", profile: "porto", text: "Desde o orçamento, até ao serviço, foram rápidos e profissionais! Outras em presas apresentavam quase o dobro dos valores! De salientar o Rodolfo, um excelente profissional e uma pessoa esforçada e gentil! Agradeço e recomendo o serviço!" },
  { name: "Beatriz Lopes", rating: 5, date: "2026-09", profile: "porto", text: "Serviço impecável.  Gostei muito do resultado.Precos muito razoáveis." },
  { name: "Francisco Clavel Costa", rating: 5, date: "2026-09", profile: "porto", text: "Muito bom serviço. Profissionais e eficientes." },
  { name: "Clara Sofia", rating: 5, date: "2026-09", profile: "porto", text: "Encontrei a página da Kyro pelo Facebook, pedi para ser contactada e no mesmo dia ligaram-me para dar orçamento e agendar a limpeza do mesmo. Diretamente do Porto para Setúbal e deixaram o nosso sofá impecável, limpo e impermeabilizado. Os rapazes foram super simpáticos, prestáveis e atenciosos. Não houve pressa nem rapidez no serviço, tudo no seu tempo e o resultado está á vista. Obrigada!" },
  { name: "Mikołaj Matoga", rating: 5, date: "2026-09", profile: "porto", text: "Excelente serviço da Kyro Clean Solutions! A limpeza do sofá ficou impecável, com uma qualidade realmente excelente. O funcionário foi muito simpático, pontual e profissional. O preço também foi muito bom. Recomendo vivamente esta empresa!" },
  { name: "Joana Moreira", rating: 5, date: "2026-09", profile: "porto", text: "Trabalho maravilhoso o sofá ficou com novo" },
  { name: "Alexandra Almeida", rating: 5, date: "2026-09", profile: "porto", text: "Fiquei muito satisfeita com o serviço de limpeza no domicílio do meu velho e muito  usado tapete que adoro! Desde o primeiro contacto se destacou um enorme profissionalismo, simpatia e disponibilidade. O profissional que realizou o serviço foi de uma delicadeza e educação excecionais, muito cuidadoso com tudo e sempre atento aos pequenos detalhes.\nA limpeza e impermeabilização ficaram impecáveis e o resultado superou as expectativas. É muito bom encontrar profissionais que, além de fazerem um excelente trabalho, o fazem com gosto, cuidado e respeito pelo cliente e pela sua casa. Recomendo sem qualquer dúvida. Voltarei a recorrer aos vossos serviços!" },
  { name: "Anabela Silva", rating: 5, date: "2026-09", profile: "porto", text: "Fiquei satisfeita!\nAgendamento rápido e flexível\nLimpeza profissional\nMuito bom resultado\nRecomendo" },
  { name: "Paula Lé", rating: 5, date: "2026-09", profile: "porto", text: "Recomendo! Fiquei bastante satisfeita com o serviço prestado. Inicialmente pensei que o preço iria ser mais alto mas foi bastante razoável a relação qualidade /preço. Vale a pena fazer a limpeza e impermeabilização. Obrigada." },
  { name: "Achille Blanchart", rating: 5, date: "2026-09", profile: "porto", text: "Had my living room rug and my sofa cleaned by Kyro Clean Solutions in Porto and the value for money is hard to beat. I compared a few quotes and theirs was clearly the best for the work involved. Everything was done at my flat in MAtosinhios, the rug came back looking years younger. If you need carpet or upholstery cleaning around Porto or Matosinhos, start here." },
  { name: "Rich Porter", rating: 5, date: "2026-09", profile: "porto", text: "The team came on time and was very professional. The sofa that they cleaned looks brand new in very happy with the work" },
  { name: "Adnan Ghoul", rating: 5, date: "2026-09", profile: "porto", text: "This service provided exceptional value for the price. It completely bypassed the need for a costly carpet replacement. I will absolutely be using them for annual maintenance and highly recommend booking with their team." },
  { name: "Eva Sarmento", rating: 5, date: "2026-09", profile: "porto", text: "Excelente experiência! O jovem que veio fazer a limpeza dos meus sofás e tapetes fez um trabalho exemplar. Foi extremamente educado, eficiente, cuidadoso e muito prestável durante todo o serviço. O resultado ficou impecável e superou as minhas expectativas.\n\nSem dúvida que merece 5 estrelas! Recomendo vivamente e voltarei a recorrer aos serviços desta empresa. Muito obrigada! 😊" },
  { name: "Claudia Correia", rating: 5, date: "2026-09", profile: "porto", text: "Top! Gostei do serviço. O Sr Rudolfo(?) transpirou para deixar os tapetes quase como novos. Obrigada e recomendo" },
  { name: "Sergio Pereira", rating: 5, date: "2026-09", profile: "porto", text: "Bom trabalho. Rapidez e eficácia. Lavam um tapete bem alto e difícil e fizeram um trabalho muito competente. Recomendo." },
  { name: "Sarah Matos", rating: 5, date: "2026-09", profile: "porto", text: "Gostei muito do trabalho, recomendo!" },
  { name: "Sergioisa Mota", rating: 5, date: "2026-09", profile: "porto", text: "Trabalho verdadeiramente excelente! Com certeza entrarei em contato quando precisar! Muito atenciosos!" },
  { name: "Jorge Roque", rating: 5, date: "2026-09", profile: "porto", text: "Serviço muito bom, rápido e acima do esperado." },
  { name: "Rúben Simões", rating: 5, date: "2026-09", profile: "porto", text: "Excelente trabalho na limpeza de colchões, muitos cuidados nomeadamente em proteger os sapatos na entrada da casa e durante o trabalho. Ficou com aspecto de novo. O Sr. Joab Gomes muito profissional e simpático. Recomendo!" },
  { name: "Sabina Silva", rating: 5, date: "2026-09", profile: "porto", text: "Profissionais, recomendo!" },
  { name: "Luís Pires", rating: 5, date: "2026-09", profile: "porto", text: "O serviço correu bem e tudo foi feito conforme combinado. O preço foi bastante acessível e o senhor foi muito prestável, dizendo que, caso encontrasse alguma zona do sofá ou das cadeiras que não tivesse ficado bem impermeabilizada, voltaria cá para corrigir. Recomendo!" },
  { name: "Patrícia Teixeira", rating: 5, date: "2026-09", profile: "porto", text: "Limpeza completa de sofá com chaise long e poltrona. Excelente trabalho 👌🏼" },
  { name: "Ali Carlos", rating: 5, date: "2026-09", profile: "porto", text: "Fizeram um ótimo trabalho, foram pontuais, são simpáticos e rápidos no trabalho que fazem. O menino até se ofereceu para limpar o chão depois do trabalho que fez. Recomendo os seus serviços" },
  { name: "Joao Mateus", rating: 5, date: "2026-09", profile: "porto", text: "Serviço fantástico, os funcionários são grandes lendas👍🏾" },
  { name: "Maria Inês Tomé", rating: 4, date: "2026-09", profile: "porto", text: "Serviço de limpeza bem realizado e o sofá ficou visivelmente mais limpo e fresco. No geral, fiquei satisfeita com o resultado e recomendo!" },
  { name: "Martim Guedes", rating: 5, date: "2026-09", profile: "porto", text: "Excelente serviço! Muito profissionais, rápidos e cuidadosos com o trabalho. Fiquei bastante satisfeito com o resultado da limpeza. Recomendo sem dúvida! ⭐⭐⭐⭐⭐" },
  { name: "Filipa Alexandra", rating: 5, date: "2026-09", profile: "porto", text: "Quero agradecer de coração ao António e a toda a equipa pelo excelente trabalho! O António foi sempre muito atencioso e manteve uma ótima comunicação comigo durante todo o processo.\n\nComo vivo no estrangeiro, precisava de alguém de confiança para limpar o meu colchão, que tinha acumulado bastante bolor. A equipa que foi à minha casa foi simplesmente fantástica, muito profissional, eficiente e realizou o trabalho de forma impecável.\n\nFiquei extremamente satisfeita com o resultado, o colchão ficou impecável! Recomendo esta empresa sem qualquer hesitação.\n\nMuito obrigada pelo excelente serviço! 🙏" },
  { name: "Atomy Algarve", rating: 4, date: "2026-09", profile: "porto", text: "Serviço ao domicílio, fácil de contratar, disponibilidade imediata e limpeza muito boa. Aceita MB Way e o preço é bom!\nUma referência especial ao Guilherme, que é super simpático e muito prestável! Gratos pela dedicação e rapidez com que nos deram assistência. Boa sorte para o negócio!" },
  { name: "Rob Colivet", rating: 5, date: "2026-08", profile: "porto", text: "I had an amazing experience with the guys. They got rid of all of the stains" },
  { name: "Kika Serra", rating: 5, date: "2026-08", profile: "porto", text: "Excelente serviço e atendimento ao cliente. Respostas rápidas, flexibilidade de marcação de recolha e devolução, tudo em menos de 48 horas. Higienizaram um tapete de qualidade (100% lã, tecido manualmente, bastante denso) com resultado impecável. Recomendo." },
  { name: "Cristina Pereira", rating: 5, date: "2026-08", profile: "porto", text: "Excelente trabalho na limpeza de um sofá muito sujo e com várias manchas. Um serviço executado com profissionalismo e simpatia 😊 definitivamente uma empresa a recomendar 🙌 muito obrigado!" },
  { name: "Alexandra Magro", rating: 5, date: "2026-08", profile: "porto", text: "Um serviço de excelência e um ótimo atendimento!\nO colchão ficou como novo!\nDaria 6 estrelas de fosse possível!" },
  { name: "Carla P.", rating: 5, date: "2026-08", profile: "porto", text: "Serviço profissional, rápido e eficiente" },
  { name: "Teresa Madeira", rating: 5, date: "2026-08", profile: "porto", text: "Recomendo" },
  { name: "Maria do Carmo Cruz", rating: 5, date: "2026-08", profile: "porto", text: "Prestáveis, com serviços de recolha e ao domicílio. Os tapetes, embora não os tenha aberto na totalidade, após a limpeza, chegaram cheirosos e limpos. Contacto fácil por Whatsaap com a equipa." },
  { name: "Francisco Silva", rating: 5, date: "2026-07", profile: "porto", text: "Serviço impecável, boa iniciativa! Recomendo!" },
  { name: "Stephany Rios", rating: 5, date: "2026-06", profile: "porto", text: "Fizeram um ótimo trabalho na limpeza do sofá. Vi o serviço a ser feito hoje e as manchas desapareceram logo após a limpeza. O sofá ficou com um aspeto renovado, limpo e com um cheiro muito agradável. Estou muito satisfeita com o trabalho e recomendo o serviço!" },
  { name: "PIFFEN", rating: 5, date: "2026-06", profile: "porto", text: "Muito bom! Excelente serviço, sem duvida irei voltar a contactar!" },
  { name: "Joao Abreu", rating: 5, date: "2026-06", profile: "porto", text: "Ótimo serviço, 100% recomendado!!" },
  { name: "Manuel Reis", rating: 5, date: "2026-06", profile: "porto", text: "Serviço 5 estrelas!" },
  { name: "Luisa Peixoto", rating: 5, date: "2026-06", profile: "porto", text: "Excelente serviço" },
  { name: "Beatriz Lança", rating: 5, date: "2026-04", profile: "porto", text: "Fizeram um ótimo trabalho com um sofá super antigo e com alguma sujidade acumulada, recomendo muito!!!" },
  { name: "Mário Martins Fonseca", rating: 5, date: "2026-01", profile: "porto", text: "O Guilherme foi super simpático e fez um serviço impecável! Mais do que uma sessão de limpeza também foi uma boa conversa e oportunidade de conhecer um jovem empreendedor que claramente ama o que faz! Recomendo 🌟" },
  { name: "Paulo Henrique Cavalcante Silverio", rating: 5, date: "2026-01", profile: "porto", text: "Serviço impecável!\nAtendimento ótimo\nDos rapazes" },
  { name: "Orlando Lima", rating: 5, date: "2026-01", profile: "porto", text: "Espetacular super rápidos e eficientes.\n\nObrigada." },
  { name: "Vitor Lucena", rating: 5, date: "2026-01", profile: "porto", text: "Incrível trabalho, recomendo 5⭐️" },
  { name: "Pedro Valenti", rating: 5, date: "2026-01", profile: "porto", text: "Excelente comunicação e resultados visíveis" },
  { name: "Guillermo Rumbos", rating: 5, date: "2026-01", profile: "porto", text: "Ótimo trabalho" },
  { name: "Francisco Peixoto", rating: 5, date: "2025-12", profile: "porto", text: "Limpeza e serviço impecável! Achei o estilo do vídeo antes e depois muito criativo também, dá a entender que sabem o que fazem 🙌🏻" },
  { name: "Jaime Guimarães", rating: 5, date: "2025-12", profile: "porto", text: "Recorri a esta empresa para a limpeza de um sofá e fiquei muito agradado com o resultado final e com a simpatia da equipa. Serviço 5 estrelas." },
  { name: "Lumiere Restaurante", rating: 5, date: "2025-12", profile: "porto", text: "Somos um restaurante que prima pela qualidade e gostamos de contratar empresas de excelência com o mesmo reflexo! São eles que tornam o nosso ambiente mais limpo e charmoso!" },
  { name: "Vitor Correia", rating: 5, date: "2025-12", profile: "porto", text: "Excelente serviço, equipa muito simpática e prestável." },
  { name: "Universo 7 Vibração Quântica", rating: 5, date: "2025-12", profile: "porto", text: "Excelente serviço: profissionalismo e eficiência. Recomendo." },
  { name: "Pedro Maia", rating: 5, date: "2025-12", profile: "porto", text: "Serviço impecável." },
  { name: "Lucas Costa", rating: 5, date: "2025-11", profile: "porto", text: "Estiveram em casa, Guilherme e Tomas, foram pontuais, profissionais, cordiais e fizeram um.exelente trabalho trazendo nosso sofá de volta a vida, recomendo" },
  { name: "Anna Aranha", rating: 5, date: "2025-11", profile: "porto", text: "Adorei o serviço!" },
  { name: "Sonya Marabyan", rating: 5, date: "2025", profile: "porto", text: "We called the guys to clean the sofa, they did everything very quickly and efficiently. Literally an hour and everything was ready" },
  { name: "Miriam Salomão", rating: 5, date: "2025", profile: "porto", text: "Excelente trabalho no meu tapete branco, que ficou limpinho! A equipa também é muito educada e foram muito cuidadosos com os restantes móveis da casa. Eu os recomendo!" },
  { name: "Pedro Novais", rating: 5, date: "2025", profile: "porto", text: "Serviço impecável! Dois jovens trabalhadores muito educados e profissionais fizeram a limpeza do meu sofá com grande cuidado e o resultado ficou excelente. Recomendo vivamente!" },
  { name: "Joana Esteves de Oliveira", rating: 5, date: "2025", profile: "porto", text: "Recomendo vivamente. Equipa impecável, disponibilidade em agendar o serviço para breve, preços muito adequados, simpatia e trabalho de qualidade - os sofás ficaram renovados, face ao aspecto encardido que tinham." },
  { name: "Maria Ines Bertao", rating: 5, date: "2025", profile: "porto", text: "O meu sofá ficou muito limpinho, como novo. São muito cuidadosos, simpáticos e prestáveis. Agendar o serviço foi rápido e simples. Obrigada! Recomendo." },
  { name: "Lui Iarocheski", rating: 5, date: "2025", profile: "porto", text: "Excelente serviço e profissionais! Deixaram tudo impecável e fizeram o trabalho com cuidado e simpatia" },
  { name: "Reginaldo Pascoal Do Nascimento Vicente", rating: 5, date: "2025", profile: "porto", text: "Serviço 5 estrelas, profissionalismo, pontualidade, qualidade e rigor. Recomendo 100%. Foi uma experiência ótima." },
  { name: "Sandra Gama", rating: 5, date: "2025", profile: "porto", text: "Trabalho excelente !os meu sofá parece novo! E os meninos super simpáticos e educados !recomendo!" },
  { name: "Esther Slotboom", rating: 5, date: "2025", profile: "porto", text: "Impecável! Limpeza e impermeabilização num instante. E não acho caro para o tempo que dura… Recomendo vivamente" },
  { name: "Aldiro Cusso", rating: 5, date: "2025", profile: "porto", text: "Trabalho muito eficaz. Funcionários muito simpáticos e educados, recomendo!!" },
  { name: "Sofia Alegria", rating: 5, date: "2025", profile: "porto", text: "Gostei bastante do serviço. Ambos muito simpáticos e cuidadosos." },
  { name: "Susana Guedes", rating: 5, date: "2025", profile: "porto", text: "Recomendo!!" },
  { name: "Luiza Tavares", rating: 5, date: "2024", profile: "porto", text: "Extremamente simpáticos, prestativos e profissionais. Tudo ficou 100%! Voltarei a agendar outros serviços!" },
  { name: "Clarinda Neves", rating: 5, date: "2024", profile: "porto", text: "Muito profissionais!\nDeixaram o sofá como novo!\nPreço acessível e muito simpáticos.\nRecomendo muito" },
  { name: "Tiago Torres", rating: 5, date: "2024", profile: "porto", text: "Pontuais, atenciosos e cuidadosos com o detalhe.\nTinha um sofá com xixi de gato. Ficou impecável.\nRecomendo." },
  { name: "Francisco Silva", rating: 5, date: "2024", profile: "porto", text: "Muito profissionais, malta jovem e com bastante conhecimento na área. Obrigado por limparem a minha carpete com sucesso!" },
  { name: "Ana Rita Mota", rating: 5, date: "2024", profile: "porto", text: "Muito simpáticos e profissionais. Recomendo." },
  { name: "Paula Sapage", rating: 5, date: "2026-10", profile: "lisboa", text: "Rapidez e eficiência, resultado impecável." },
  { name: "Pedro Campos", rating: 5, date: "2026-09", profile: "lisboa", text: "Serviço rapido" },
  { name: "Priscilla Roos", rating: 5, date: "2026-09", profile: "lisboa", text: "Tive uma ótima experiência! O serviço de limpeza do colchão e do sofá foi excelente, ficaram impecáveis e com um aspeto renovado. Equipa muito profissional, simpática e cuidadosa. Recomendo vivamente o serviço!" },
  { name: "Ana Paula Silveira", rating: 5, date: "2026-09", profile: "lisboa", text: "Fiquei muito satisfeita com o serviço. Desde o primeiro contacto, foram super prestáveis e solícitos. Consegui agendar a limpeza do sofá em menos de 24 horas, foram muito pontuais e o sofá ficou como novo." },
  { name: "Ana Figueira", rating: 5, date: "2026-09", profile: "lisboa", text: "Serviço excelente! Fiquei muito satisfeita com o resultado da limpeza dos meus tapetes. Ficaram impecáveis, limpos e com um aspeto renovado. 👌✨\nDestaco também o profissionalismo, a simpatia e o cuidado em todo o serviço. Sem dúvida uma empresa que recomendo e à qual voltarei a recorrer! ⭐⭐⭐⭐⭐" },
  { name: "Dongting Liu", rating: 5, date: "2026-09", profile: "lisboa", text: "Serviço excelente! O tapete ficou muito limpo, com um aspeto renovado e um cheiro agradável. Foram muito profissionais, cuidadosos e pontuais. O resultado superou as minhas expectativas. Recomendo sem dúvida!" },
  { name: "Marek Konieczny", rating: 5, date: "2026-09", profile: "lisboa", text: "Excellent communication, competitive pricing, quick execution time. The team arrived all smiles right on time, did the job well. 2 sofas, mattrass and bed'sback cleaned thoroughly.  Highly recommended." },
  { name: "Laura Rodrigues", rating: 5, date: "2026-09", profile: "lisboa", text: "Ótimo serviço! O profissional Rodolfo foi muito atencioso e querido. Chegou ainda mais cedo do que o combinado e fez o trabalho minuciosamete. Obrigada." },
  { name: "José Miguel Silva", rating: 5, date: "2026-09", profile: "lisboa", text: "Serviço bastante expedito - tudo o que eu precisava para um tratamento de alcatifas pós-inundação.\nEquipa bastante eficiente." },
  { name: "Cláudio Ferreira", rating: 5, date: "2026-09", profile: "lisboa", text: "Excelente trabalho. Tinha umas manchas de marcador no sofá e ambas foram removida na sua totalidade. Está como veio de fábrica." },
  { name: "Manuel Reis", rating: 5, date: "2026-09", profile: "lisboa", text: "Serviço excecional e equipa rápida e eficaz a resolver os problemas." },
  { name: "Rute Ribeiro", rating: 5, date: "2026-09", profile: "lisboa", text: "O colchão ficou como novo, muito satisfeita, o Sr. Joab é competente e muito simpático" },
  { name: "Rodolfo Lucena", rating: 5, date: "2026-09", profile: "lisboa", text: "Excelente serviço" },
  { name: "Lidia P", rating: 5, date: "2026-09", profile: "lisboa", text: "Serviço rápido e com todos os esclarecimentos e fichas técnicas dos produtos." },
  { name: "Bárbara Santos", rating: 5, date: "2026-09", profile: "lisboa", text: "Ótimo servico" },
  // Transcritas pelo dono a 2026-09-10 da ficha de Lisboa; a 2026-10-09 já não
  // apareciam na lista do Google, e o dono pediu para ficarem (mesmo dia).
  { name: "Diogo Branco", rating: 5, date: "2026-09", profile: "lisboa", text: "Correu muito bem. Quer a fase de combinação quer a de execução. A comunicação foi fácil e cordial, o trabalho cuidadoso e a pessoa que o efetuou, João, muito bem educado e cordial. Voltarei a utilizar os vossos serviços" },
  { name: "Maria Sousa", rating: 5, date: "2026-09", profile: "lisboa", text: "Serviço impecável e equipa muito simpática.\nRecomendo!" },
  { name: "Ana Relva", rating: 5, date: "2026-09", profile: "lisboa", text: "Super acessíveis desde o primeiro momento, sem problemas em responder a qualquer questão. Limpeza 5* e cumpridores de horários. Recomendo vivamente" },
  { name: "Susana Gonçalves", rating: 5, date: "2026-09", profile: "lisboa", text: "Muito satisfeita com o vosso serviço" },
  { name: "Paulo Peixoto", rating: 5, date: "2026-09", profile: "lisboa", text: "Serviço muito competente." },
];

const toPool = (r: GoogleReview): PoolReview => ({
  name: r.name, text: r.text, rating: r.rating, date: r.date,
  city: r.profile === 'lisboa' ? 'Lisboa' : undefined,
});

/** Ficha de Lisboa: a única cuja localidade é certa. A ficha do Porto recebe
 *  avaliações de todo o país, por isso essas saem sem cidade. */
export const LISBON_REVIEWS: PoolReview[] = GOOGLE_REVIEWS.filter(r => r.profile === 'lisboa').map(toPool);
const PORTO_PROFILE_REVIEWS: PoolReview[] = GOOGLE_REVIEWS.filter(r => r.profile === 'porto').map(toPool);

export const PUBLISHED_REVIEWS: PoolReview[] = GOOGLE_REVIEWS.map(toPool);

export interface ConfirmedReviewLocation {
  city: string;
  region: string;
  source: string;
}

export const CONFIRMED_REVIEW_LOCATIONS: Record<string, ConfirmedReviewLocation> = Object.fromEntries(
  LISBON_REVIEWS.map(review => [review.name, {
    city: 'Lisboa', region: 'lisboa', source: 'Ficha Google "Kyro Clean Solutions Lisboa"',
  }]),
);

const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
/** "setembro de 2026", ou "2025" quando só há o ano. */
export function formatReviewDate(date?: string): string | undefined {
  if (!date) return undefined;
  const [y, m] = date.split('-');
  return m ? `${MONTHS[Number(m) - 1]} de ${y}` : y;
}

export function reviewRegion(page: string): string | undefined {
  const slug = page.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const regions: Record<string, string[]> = {
    lisboa: ['lisboa', 'cascais', 'oeiras', 'sintra', 'amadora', 'odivelas', 'loures', 'almada', 'seixal', 'barreiro', 'moita', 'montijo', 'alcochete', 'mafra', 'vila-franca-de-xira', 'palmela', 'sesimbra', 'setubal'],
    porto: ['porto', 'vila-nova-de-gaia', 'matosinhos', 'maia', 'gondomar', 'valongo', 'espinho', 'trofa', 'santo-tirso', 'povoa-de-varzim', 'vila-do-conde'],
  };
  return Object.entries(regions).find(([, cities]) => cities.some(city => (`-${slug}-`).includes(`-${city}-`)))?.[0];
}

const SERVICE_KEYWORDS: Record<string, RegExp> = {
  'limpeza-sofas': /sof[áa]|chaise|poltrona|estofo|upholstery/i,
  'limpeza-colchoes': /colch|mattress|mattrass/i,
  'limpeza-tapetes': /tapete|carpete|\brug\b|carpet/i,
  'limpeza-cadeiras': /cadeira/i,
  'limpeza-alcatifas': /alcatifa/i,
  'impermeabilizacao': /impermeabiliz/i,
};

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

const servicesOf = (r: PoolReview) => Object.keys(SERVICE_KEYWORDS).filter(s => SERVICE_KEYWORDS[s].test(r.text));

/** Escolha determinística e variada: até metade fala do serviço da página,
 *  depois uma de cada outro serviço (para a página mostrar sofás, colchões,
 *  tapetes, impermeabilização…), e o resto com avaliações gerais.
 *  Páginas da região de Lisboa usam primeiro a ficha de Lisboa; as outras
 *  nunca mostram avaliações com a cidade de outra região. */
export function pickReviewSubset(serviceSlug: string, seed: string, count = 6): PoolReview[] {
  const region = reviewRegion(seed);
  const local = PUBLISHED_REVIEWS.filter(r => CONFIRMED_REVIEW_LOCATIONS[r.name]?.region === region && region);
  const rest = PUBLISHED_REVIEWS.filter(r => {
    const loc = CONFIRMED_REVIEW_LOCATIONS[r.name];
    return !loc || (region && loc.region === region);
  }).filter(r => !local.includes(r));
  const order = (list: PoolReview[]) => [...list].sort((a, b) => hashSeed(`${seed}:${a.name}:${a.date}`) - hashSeed(`${seed}:${b.name}:${b.date}`));
  const picked: PoolReview[] = [];
  const add = (r?: PoolReview) => { if (r && picked.length < count && !picked.includes(r)) picked.push(r); };

  // Sem avaliações locais deste serviço (ex.: impermeabilização em Lisboa),
  // duas da ficha do Porto, que não levam cidade, abrem a lista.
  if (local.length && !local.some(r => servicesOf(r).includes(serviceSlug))) {
    order(rest).filter(r => servicesOf(r).includes(serviceSlug)).slice(0, 2).forEach(add);
  }
  for (const pool of [order(local), order(rest)]) {
    if (picked.length >= count) break;
    const specific = pool.filter(r => servicesOf(r).includes(serviceSlug));
    specific.slice(0, Math.ceil(count / 2) - picked.filter(r => servicesOf(r).includes(serviceSlug)).length).forEach(add);
    for (const other of Object.keys(SERVICE_KEYWORDS).filter(s => s !== serviceSlug)) {
      if (picked.length >= count - 1) break;
      if (picked.some(r => servicesOf(r).includes(other))) continue;
      add(pool.find(r => servicesOf(r)[0] === other && !picked.includes(r)));
    }
    pool.filter(r => servicesOf(r).length === 0).forEach(add);
    specific.forEach(add);
    pool.forEach(add);
  }
  return picked.map(r => ({ ...r, city: CONFIRMED_REVIEW_LOCATIONS[r.name]?.city }));
}
