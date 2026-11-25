// Avaliações reais do Google (dono, 2026-10-09: "substitui todas por avaliações
// reais, com datas reais, das duas fichas"). Transcritas tal como estão nas
// fichas "Kyro Clean Solutions" (Porto) e "Kyro Clean Solutions Lisboa".
// `date` é o mês (AAAA-MM) ou, em algumas antigas, só o ano. Ficam de fora as
// de 3 estrelas ou menos.
// A 2026-11-25 (dono: "todas as avaliações acima de 4 estrelas, as de 1/2/3 não
// coloques"; 4 e 5 confirmadas) entraram as 37 em falta, pelo painel dos dois
// perfis, com a data exata do Google. Nesse dia: 212 avaliações, 203 de 4 e 5
// estrelas, 145 delas com texto (112 Porto, 33 Lisboa) e 58 só com
// estrelas, todas aqui. As 46 datas erradas (tiradas das relativas do Google) e
// dois textos traduzidos foram acertados no mesmo dia. Numa avaliação noutra
// língua copia-se o original, nunca a tradução do Google.
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
  { name: "Jose Manuel", rating: 5, date: "2026-11", profile: "porto", text: "Muito eficientes . A repetir" },
  { name: "Luciana Ribeiro", rating: 5, date: "2026-11", profile: "porto", text: "Excelente serviço, ótimos profissionais. Tudo impecável. Super recomendo." },
  { name: "Joana Faria", rating: 4, date: "2026-11", profile: "porto", text: "Excelente trabalho" },
  { name: "Daniela Monteiro", rating: 5, date: "2026-11", profile: "porto", text: "Muito simpáticos e um trabalho muito rápido!" },
  { name: "Marina Henriques Pedrosa", rating: 5, date: "2026-11", profile: "porto", text: "Rapidez e profissionalismo\nRecomendo!!" },
  { name: "Ana Duque", rating: 5, date: "2026-11", profile: "porto", text: "Limpeza impecável, profissional competente e simpática!" },
  { name: "João Falcão", rating: 5, date: "2026-11", profile: "porto", text: "Excelente serviço da KyroClean! Comunicação rápida e profissional desde o primeiro contacto, pontualidade no horário marcado e um trabalho de limpeza de sofá realmente detalhado. Cuidado no manuseamento e preocupação em manter o restante espaço limpo." },
  { name: "Ana Rossetto", rating: 5, date: "2026-11", profile: "porto", text: "Limpeza ficou incrível. Trabalho impecável. Tanto o tratamento enzimático tirou o cheio de xixi como o sofá ficou como novo." },
  { name: "Carolina Rodrigues", rating: 5, date: "2026-11", profile: "porto", text: "O Bruno e a Jaqueline vieram na nossa casa proceder a impermeabilização e correu tudo muito bem! Adoramos, fica realmente o tecido igual ou até mais bonito. Recomendo vivamente" },
  { name: "angela martin (machead1964)", rating: 5, date: "2026-11", profile: "porto", text: "The cleaners were very professional.  They did a great job at cleaning the mattress and sofa." },
  { name: "Fernanda Joceli Bade Schuster Hachmann", rating: 5, date: "2026-11", profile: "porto", text: "Excelente profissional. Vou chamar novamente. Obrigada" },
  { name: "Vanessa Freitas", rating: 5, date: "2026-10", profile: "porto", text: "Enorme diferença no antes e no depois!" },
  { name: "Juliana Cavalcante", rating: 5, date: "2026-10", profile: "porto", text: "A melhor possível, já marquei outros serviços, recomendo imenso." },
  { name: "Daliana Marques", rating: 5, date: "2026-10", profile: "porto", text: "Atendimento impecável. Meu sofá ficou como novo. Estava muito sujo devido aos miúdos. Nota 10!" },
  { name: "Filipa Guerra", rating: 5, date: "2026-10", profile: "porto", text: "Serviço impecável! A Kyro veio cá a casa limpar e impermeabilizar o sofá e um tapete e o resultado superou as expetativas! Temos vários animais e um dos tapetes tinha até manchas e cheiro a urina. Ficou tudo super limpo, renovado e sem qualquer mau cheiro! Resultados imediatos, pontualidade, profissionalismo e uma equipa extremamente simpática e educada. Recomendo a 100%, especialmente a quem tem animais em casa!" },
  { name: "Regina Costa", rating: 5, date: "2026-10", profile: "porto", text: "Equipa profissional, desde o primeiro contacto via whatsapp!" },
  { name: "Gabriel Lopes", rating: 5, date: "2026-10", profile: "porto", text: "O serviço é excelente! Indico demais!" },
  { name: "Duarte Penha", rating: 5, date: "2026-10", profile: "porto", text: "Ficou tudo a brilhar,excelente serviço!" },
  { name: "Lucio Gomes", rating: 4, date: "2026-10", profile: "porto", text: "Serviço muito bom" },
  { name: "Raquel Argona", rating: 5, date: "2026-10", profile: "porto", text: "Excelente trabalho .\nMeu sofá está impecável !" },
  { name: "Duarte Cardoso", rating: 5, date: "2026-10", profile: "porto", text: "Trabalho perfeito! Atendimento incrível e mesmo muito prestáveis. Muito obrigado." },
  { name: "Maria Paula", rating: 5, date: "2026-10", profile: "porto", text: "Sempre muito atenciosos e prestáveis, respondem praticamente na hora. Tanto a pessoa com quem trocámos mensagens como a pessoa que veio fazer o serviço  Serviço foram muito simpáticas e muito profissionais. Serviço muito bom!" },
  { name: "Dalila Marreiros", rating: 5, date: "2026-10", profile: "porto", text: "Excelente profissional e muito simpático . Recomendo" },
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
  { name: "Sofia Cordeiro", rating: 5, date: "2026-09", profile: "porto", text: "O colchão estava muito manchado e ficou irreconhecível. Recomendo." },
  { name: "Iris Estevez", rating: 5, date: "2026-09", profile: "porto", text: "En general el trabajo fue rápido y la atención muy buena. El contacto para pedir presupuesto, solventar dudas y agendar fecha fue de lo más eficaz (y comparativamente mucho mejor que en otros casos, ya que comparamos presupuestos y servicios en varios lugares de la zona). En esta ocasión el servicio prestado consistió en impermeabilizar un sofá y ocho sillas (no para limpieza), lo que implica que el servicio inicial fuese ágil y rápido. El pack contratado se configura de una garantía de impermeabilización de 10 años. Por el momento, solo hemos hecho la prueba con agua pero el sofá y las sillas repelen el líquido. Por eso, por ahora, todo bien. La atención recibida, la educación y la puntualidad del muchacho fue fantástica. La atención vía whats app muy buena también." },
  { name: "Joana Direito", rating: 5, date: "2026-09", profile: "porto", text: "Ficámos mesmo muito satisfeitos com o resultado! O sofá estava a precisar de uma boa limpeza e ficou impecável, parece mesmo novo outra vez. O serviço foi feito com cuidado e durou cerca de 1h/1h30. Recomendo sem dúvida! 😊" },
  { name: "Sara Bento Silva", rating: 5, date: "2026-09", profile: "porto", text: "Tudo espetacular! Recomendo 100%" },
  { name: "Hugo Gomes", rating: 5, date: "2026-09", profile: "porto", text: "Desde o orçamento, até ao serviço, foram rápidos e profissionais! Outras em presas apresentavam quase o dobro dos valores! De salientar o Rodolfo, um excelente profissional e uma pessoa esforçada e gentil! Agradeço e recomendo o serviço!" },
  { name: "Beatriz Lopes", rating: 5, date: "2026-09", profile: "porto", text: "Serviço impecável.  Gostei muito do resultado.Precos muito razoáveis." },
  { name: "Francisco Clavel Costa", rating: 5, date: "2026-09", profile: "porto", text: "Muito bom serviço. Profissionais e eficientes." },
  { name: "Clara Sofia", rating: 5, date: "2026-09", profile: "porto", text: "Encontrei a página da Kyro pelo Facebook, pedi para ser contactada e no mesmo dia ligaram-me para dar orçamento e agendar a limpeza do mesmo. Diretamente do Porto para Setúbal e deixaram o nosso sofá impecável, limpo e impermeabilizado. Os rapazes foram super simpáticos, prestáveis e atenciosos. Não houve pressa nem rapidez no serviço, tudo no seu tempo e o resultado está á vista. Obrigada!" },
  { name: "Mikołaj Matoga", rating: 5, date: "2026-09", profile: "porto", text: "Excelente serviço da Kyro Clean Solutions! A limpeza do sofá ficou impecável, com uma qualidade realmente excelente. O funcionário foi muito simpático, pontual e profissional. O preço também foi muito bom. Recomendo vivamente esta empresa!" },
  { name: "Joana Moreira", rating: 5, date: "2026-09", profile: "porto", text: "Trabalho maravilhoso o sofá ficou com novo" },
  { name: "Alexandra Almeida", rating: 5, date: "2026-09", profile: "porto", text: "Fiquei muito satisfeita com o serviço de limpeza no domicílio do meu velho e muito  usado tapete que adoro! Desde o primeiro contacto se destacou um enorme profissionalismo, simpatia e disponibilidade. O profissional que realizou o serviço foi de uma delicadeza e educação excecionais, muito cuidadoso com tudo e sempre atento aos pequenos detalhes.\nA limpeza e impermeabilização ficaram impecáveis e o resultado superou as expectativas. É muito bom encontrar profissionais que, além de fazerem um excelente trabalho, o fazem com gosto, cuidado e respeito pelo cliente e pela sua casa. Recomendo sem qualquer dúvida. Voltarei a recorrer aos vossos serviços!" },
  { name: "Anabela Silva", rating: 5, date: "2026-09", profile: "porto", text: "Fiquei satisfeita!\nAgendamento rápido e flexível\nLimpeza profissional\nMuito bom resultado\nRecomendo" },
  { name: "Paula Lé", rating: 5, date: "2026-09", profile: "porto", text: "Recomendo! Fiquei bastante satisfeita com o serviço prestado. Inicialmente pensei que o preço iria ser mais alto mas foi bastante razoável a relação qualidade /preço. Vale a pena fazer a limpeza e impermeabilização. Obrigada." },
  { name: "Achille Blanchart", rating: 5, date: "2026-08", profile: "porto", text: "Had my living room rug and my sofa cleaned by Kyro Clean Solutions in Porto and the value for money is hard to beat. I compared a few quotes and theirs was clearly the best for the work involved. Everything was done at my flat in MAtosinhios, the rug came back looking years younger. If you need carpet or upholstery cleaning around Porto or Matosinhos, start here." },
  { name: "Rich Porter", rating: 5, date: "2026-08", profile: "porto", text: "The team came on time and was very professional. The sofa that they cleaned looks brand new in very happy with the work" },
  { name: "Adnan Ghoul", rating: 5, date: "2026-08", profile: "porto", text: "This service provided exceptional value for the price. It completely bypassed the need for a costly carpet replacement. I will absolutely be using them for annual maintenance and highly recommend booking with their team." },
  { name: "Eva Sarmento", rating: 5, date: "2026-08", profile: "porto", text: "Excelente experiência! O jovem que veio fazer a limpeza dos meus sofás e tapetes fez um trabalho exemplar. Foi extremamente educado, eficiente, cuidadoso e muito prestável durante todo o serviço. O resultado ficou impecável e superou as minhas expectativas.\n\nSem dúvida que merece 5 estrelas! Recomendo vivamente e voltarei a recorrer aos serviços desta empresa. Muito obrigada! 😊" },
  { name: "Claudia Correia", rating: 5, date: "2026-08", profile: "porto", text: "Top! Gostei do serviço. O Sr Rudolfo(?) transpirou para deixar os tapetes quase como novos. Obrigada e recomendo" },
  { name: "Sergio Pereira", rating: 5, date: "2026-08", profile: "porto", text: "Bom trabalho. Rapidez e eficácia. Lavam um tapete bem alto e difícil e fizeram um trabalho muito competente. Recomendo." },
  { name: "Sarah Matos", rating: 5, date: "2026-08", profile: "porto", text: "Gostei muito do trabalho, recomendo!" },
  { name: "Sergioisa Mota", rating: 5, date: "2026-09", profile: "porto", text: "La verdad que un trabajo excelente! Seguramente llamaré para cuando sea preciso! Bastante atencioso!" },
  { name: "Jorge Roque", rating: 5, date: "2026-08", profile: "porto", text: "Serviço muito bom, rápido e acima do esperado." },
  { name: "Rúben Simões", rating: 5, date: "2026-08", profile: "porto", text: "Excelente trabalho na limpeza de colchões, muitos cuidados nomeadamente em proteger os sapatos na entrada da casa e durante o trabalho. Ficou com aspecto de novo. O Sr. Joab Gomes muito profissional e simpático. Recomendo!" },
  { name: "Sabina Silva", rating: 5, date: "2026-08", profile: "porto", text: "Profissionais, recomendo!" },
  { name: "Luís Pires", rating: 5, date: "2026-08", profile: "porto", text: "O serviço correu bem e tudo foi feito conforme combinado. O preço foi bastante acessível e o senhor foi muito prestável, dizendo que, caso encontrasse alguma zona do sofá ou das cadeiras que não tivesse ficado bem impermeabilizada, voltaria cá para corrigir. Recomendo!" },
  { name: "Patrícia Teixeira", rating: 5, date: "2026-08", profile: "porto", text: "Limpeza completa de sofá com chaise long e poltrona. Excelente trabalho 👌🏼" },
  { name: "Ali Carlos", rating: 5, date: "2026-08", profile: "porto", text: "Fizeram um ótimo trabalho, foram pontuais, são simpáticos e rápidos no trabalho que fazem. O menino até se ofereceu para limpar o chão depois do trabalho que fez. Recomendo os seus serviços" },
  { name: "Joao Mateus", rating: 5, date: "2026-08", profile: "porto", text: "Serviço fantástico, os funcionários são grandes lendas👍🏾" },
  { name: "Maria Inês Tomé", rating: 4, date: "2026-08", profile: "porto", text: "Serviço de limpeza bem realizado e o sofá ficou visivelmente mais limpo e fresco. No geral, fiquei satisfeita com o resultado e recomendo!" },
  { name: "Martim Guedes", rating: 5, date: "2026-08", profile: "porto", text: "Excelente serviço! Muito profissionais, rápidos e cuidadosos com o trabalho. Fiquei bastante satisfeito com o resultado da limpeza. Recomendo sem dúvida! ⭐⭐⭐⭐⭐" },
  { name: "Filipa Alexandra", rating: 5, date: "2026-08", profile: "porto", text: "Quero agradecer de coração ao António e a toda a equipa pelo excelente trabalho! O António foi sempre muito atencioso e manteve uma ótima comunicação comigo durante todo o processo.\n\nComo vivo no estrangeiro, precisava de alguém de confiança para limpar o meu colchão, que tinha acumulado bastante bolor. A equipa que foi à minha casa foi simplesmente fantástica, muito profissional, eficiente e realizou o trabalho de forma impecável.\n\nFiquei extremamente satisfeita com o resultado, o colchão ficou impecável! Recomendo esta empresa sem qualquer hesitação.\n\nMuito obrigada pelo excelente serviço! 🙏" },
  { name: "Atomy Algarve", rating: 4, date: "2026-08", profile: "porto", text: "Serviço ao domicílio, fácil de contratar, disponibilidade imediata e limpeza muito boa. Aceita MB Way e o preço é bom!\nUma referência especial ao Guilherme, que é super simpático e muito prestável! Gratos pela dedicação e rapidez com que nos deram assistência. Boa sorte para o negócio!" },
  { name: "Jorge Castro", rating: 5, date: "2026-08", profile: "porto", text: "Hoje contactei pela 1ª vez esta firma.\nFoi uma boa experiência: marcaram e no dia tiveram o cuidado de avisar que estavam um pouco atrasados. O funcionário que compareceu foi super simpático, educado e esforçado. Fizeram um bom trabalho! 👌🏼" },
  { name: "Rob Colivet", rating: 5, date: "2026-08", profile: "porto", text: "I had an amazing experience with the guys. They got rid of all of the stains" },
  { name: "Kika Serra", rating: 5, date: "2026-08", profile: "porto", text: "Excelente serviço e atendimento ao cliente. Respostas rápidas, flexibilidade de marcação de recolha e devolução, tudo em menos de 48 horas. Higienizaram um tapete de qualidade (100% lã, tecido manualmente, bastante denso) com resultado impecável. Recomendo." },
  { name: "Cristina Pereira", rating: 5, date: "2026-08", profile: "porto", text: "Excelente trabalho na limpeza de um sofá muito sujo e com várias manchas. Um serviço executado com profissionalismo e simpatia 😊 definitivamente uma empresa a recomendar 🙌 muito obrigado!" },
  { name: "Alexandra Magro", rating: 5, date: "2026-08", profile: "porto", text: "Um serviço de excelência e um ótimo atendimento!\nO colchão ficou como novo!\nDaria 6 estrelas de fosse possível!" },
  { name: "Carla P.", rating: 5, date: "2026-08", profile: "porto", text: "Serviço profissional, rápido e eficiente" },
  { name: "Teresa Madeira", rating: 5, date: "2026-08", profile: "porto", text: "Recomendo" },
  { name: "Maria do Carmo Cruz", rating: 5, date: "2026-08", profile: "porto", text: "Prestáveis, com serviços de recolha e ao domicílio. Os tapetes, embora não os tenha aberto na totalidade, após a limpeza, chegaram cheirosos e limpos. Contacto fácil por Whatsaap com a equipa." },
  { name: "Francisco Silva", rating: 5, date: "2026-06", profile: "porto", text: "Serviço impecável, boa iniciativa! Recomendo!" },
  { name: "Stephany Rios", rating: 5, date: "2026-05", profile: "porto", text: "Fizeram um ótimo trabalho na limpeza do sofá. Vi o serviço a ser feito hoje e as manchas desapareceram logo após a limpeza. O sofá ficou com um aspeto renovado, limpo e com um cheiro muito agradável. Estou muito satisfeita com o trabalho e recomendo o serviço!" },
  { name: "PIFFEN", rating: 5, date: "2026-06", profile: "porto", text: "Muito bom! Excelente serviço, sem duvida irei voltar a contactar!" },
  { name: "Joao Abreu", rating: 5, date: "2026-06", profile: "porto", text: "Ótimo serviço, 100% recomendado!!" },
  { name: "Manuel Reis", rating: 5, date: "2026-06", profile: "porto", text: "Serviço 5 estrelas!" },
  { name: "Luisa Peixoto", rating: 5, date: "2026-06", profile: "porto", text: "Excelente serviço" },
  { name: "Beatriz Lança", rating: 5, date: "2026-03", profile: "porto", text: "Fizeram um ótimo trabalho com um sofá super antigo e com alguma sujidade acumulada, recomendo muito!!!" },
  { name: "Mário Martins Fonseca", rating: 5, date: "2025-12", profile: "porto", text: "O Guilherme foi super simpático e fez um serviço impecável! Mais do que uma sessão de limpeza também foi uma boa conversa e oportunidade de conhecer um jovem empreendedor que claramente ama o que faz! Recomendo 🌟" },
  { name: "Paulo Henrique Cavalcante Silverio", rating: 5, date: "2026-01", profile: "porto", text: "Serviço impecável!\nAtendimento ótimo\nDos rapazes" },
  { name: "Orlando Lima", rating: 5, date: "2025-12", profile: "porto", text: "Espetacular super rápidos e eficientes.\n\nObrigada." },
  { name: "Vitor Lucena", rating: 5, date: "2026-01", profile: "porto", text: "Incrível trabalho, recomendo 5⭐️" },
  { name: "Pedro Valenti", rating: 5, date: "2025-12", profile: "porto", text: "Excelente comunicação e resultados visíveis" },
  { name: "Guillermo Rumbos", rating: 5, date: "2026-01", profile: "porto", text: "Ótimo trabalho" },
  { name: "Francisco Peixoto", rating: 5, date: "2025-12", profile: "porto", text: "Limpeza e serviço impecável! Achei o estilo do vídeo antes e depois muito criativo também, dá a entender que sabem o que fazem 🙌🏻" },
  { name: "Jaime Guimarães", rating: 5, date: "2025-11", profile: "porto", text: "Recorri a esta empresa para a limpeza de um sofá e fiquei muito agradado com o resultado final e com a simpatia da equipa. Serviço 5 estrelas." },
  { name: "Lumiere Restaurante", rating: 5, date: "2025-11", profile: "porto", text: "Somos um restaurante que prima pela qualidade e gostamos de contratar empresas de excelência com o mesmo reflexo! São eles que tornam o nosso ambiente mais limpo e charmoso!" },
  { name: "Vitor Correia", rating: 5, date: "2025-11", profile: "porto", text: "Excelente serviço, equipa muito simpática e prestável." },
  { name: "Universo 7 Vibração Quântica", rating: 5, date: "2025-12", profile: "porto", text: "Excelente serviço: profissionalismo e eficiência. Recomendo." },
  { name: "Pedro Maia", rating: 5, date: "2025-11", profile: "porto", text: "Serviço impecável." },
  { name: "Lucas Costa", rating: 5, date: "2025-11", profile: "porto", text: "Estiveram em casa, Guilherme e Tomas, foram pontuais, profissionais, cordiais e fizeram um.exelente trabalho trazendo nosso sofá de volta a vida, recomendo" },
  { name: "Anna Aranha", rating: 5, date: "2025-10", profile: "porto", text: "Adorei o serviço!" },
  { name: "Sonya Marabyan", rating: 5, date: "2025", profile: "porto", text: "We called the guys to clean the sofa, they did everything very quickly and efficiently. Literally an hour and everything was ready" },
  { name: "Miriam Salomão", rating: 5, date: "2025", profile: "porto", text: "Excelente trabalho no meu tapete branco, que ficou limpinho! A equipa também é muito educada e foram muito cuidadosos com os restantes móveis da casa. Eu os recomendo!" },
  { name: "Pedro Novais", rating: 5, date: "2025", profile: "porto", text: "Serviço impecável! Dois jovens trabalhadores muito educados e profissionais fizeram a limpeza do meu sofá com grande cuidado e o resultado ficou excelente. Recomendo vivamente!" },
  { name: "Joana Esteves de Oliveira", rating: 5, date: "2024-12", profile: "porto", text: "Recomendo vivamente. Equipa impecável, disponibilidade em agendar o serviço para breve, preços muito adequados, simpatia e trabalho de qualidade - os sofás ficaram renovados, face ao aspecto encardido que tinham." },
  { name: "Maria Ines Bertao", rating: 5, date: "2024-12", profile: "porto", text: "O meu sofá ficou muito limpinho, como novo. São muito cuidadosos, simpáticos e prestáveis. Agendar o serviço foi rápido e simples. Obrigada! Recomendo." },
  { name: "Lui Iarocheski", rating: 5, date: "2025", profile: "porto", text: "Excelente serviço e profissionais! Deixaram tudo impecável e fizeram o trabalho com cuidado e simpatia" },
  { name: "Reginaldo Pascoal Do Nascimento Vicente", rating: 5, date: "2024-11", profile: "porto", text: "Serviço 5 estrelas, profissionalismo, pontualidade, qualidade e rigor. Recomendo 100%. Foi uma experiência ótima." },
  { name: "Sandra Gama", rating: 5, date: "2024-12", profile: "porto", text: "Trabalho excelente !os meu sofá parece novo! E os meninos super simpáticos e educados !recomendo!" },
  { name: "Esther Slotboom", rating: 5, date: "2024-10", profile: "porto", text: "Impecável! Limpeza e impermeabilização num instante. E não acho caro para o tempo que dura… Recomendo vivamente" },
  { name: "Aldiro Cusso", rating: 5, date: "2025", profile: "porto", text: "Trabalho muito eficaz. Funcionários muito simpáticos e educados, recomendo!!" },
  { name: "Sofia Alegria", rating: 5, date: "2024-11", profile: "porto", text: "Gostei bastante do serviço. Ambos muito simpáticos e cuidadosos." },
  { name: "Susana Guedes", rating: 5, date: "2025", profile: "porto", text: "Recomendo!!" },
  { name: "Luiza Tavares", rating: 5, date: "2024", profile: "porto", text: "Extremamente simpáticos, prestativos e profissionais. Tudo ficou 100%! Voltarei a agendar outros serviços!" },
  { name: "Clarinda Neves", rating: 5, date: "2024", profile: "porto", text: "Muito profissionais!\nDeixaram o sofá como novo!\nPreço acessível e muito simpáticos.\nRecomendo muito" },
  { name: "Tiago Torres", rating: 5, date: "2024", profile: "porto", text: "Pontuais, atenciosos e cuidadosos com o detalhe.\nTinha um sofá com xixi de gato. Ficou impecável.\nRecomendo." },
  { name: "Francisco Silva", rating: 5, date: "2024", profile: "porto", text: "Muito profissionais, malta jovem e com bastante conhecimento na área. Obrigado por limparem a minha carpete com sucesso!" },
  { name: "Ana Rita Mota", rating: 5, date: "2024", profile: "porto", text: "Muito simpáticos e profissionais. Recomendo." },
  { name: "tayana", rating: 5, date: "2026-11", profile: "lisboa", text: "Excelente atendimento, recomendo." },
  { name: "Maria Miranda", rating: 4, date: "2026-11", profile: "lisboa", text: "Muito profissionalismo e muita simpatia. Trabalho bem feito" },
  { name: "Mafalda Teixeira", rating: 5, date: "2026-11", profile: "lisboa", text: "Muito profissionais. O técnico Joel é extremamente afável e competente. Recomendo!" },
  { name: "Sharles Da Silva", rating: 5, date: "2026-11", profile: "lisboa", text: "O sofá ficou muito bom 👏👏👏👏 bem limpo e cheiroso, obrigado pelo\nServiço recomendo 100%" },
  { name: "Benedita Covas Lima", rating: 5, date: "2026-11", profile: "lisboa", text: "Óptimo serviço. Muito prestáveis e eficientes. Recomendo." },
  { name: "Nadia Yakimenko", rating: 5, date: "2026-11", profile: "lisboa", text: "Fiz um serviço de impermeabilização e fiquei muito satisfeita. Foi tudo rápido e eficaz, e o técnico foi muito simpático e atencioso. Recomendo!" },
  { name: "Raquel Felgueiras", rating: 5, date: "2026-10", profile: "lisboa", text: "Facilidade de comunicação. Serviço impecável. Recomendo." },
  { name: "Natália R.Oliveira", rating: 5, date: "2026-10", profile: "lisboa", text: "Ótimo serviço! O profissional Rodolfo foi muito atencioso e explicou detalhadamente como cuidar do sofá e dos bancos após a impermeabilização.\n\nPretendo contratar no futuro, caso precise." },
  { name: "Annika Hallström", rating: 5, date: "2026-10", profile: "lisboa", text: "Mycket bra hjälp. Snabb service och noggranna. Tusen tack!" },
  { name: "Alexandre ferreira lopes filho", rating: 5, date: "2026-10", profile: "lisboa", text: "O trabalho foi rápido e bem feito." },
  { name: "Tânia Patrício", rating: 5, date: "2026-10", profile: "lisboa", text: "Muito simpáticos e gostámos muito do serviço de impermeabilização" },
  { name: "Paula Sapage", rating: 5, date: "2026-09", profile: "lisboa", text: "Rapidez e eficiência, resultado impecável." },
  { name: "Pedro Campos", rating: 5, date: "2026-09", profile: "lisboa", text: "Serviço rapido" },
  { name: "Priscilla Roos", rating: 5, date: "2026-09", profile: "lisboa", text: "Tive uma ótima experiência! O serviço de limpeza do colchão e do sofá foi excelente, ficaram impecáveis e com um aspeto renovado. Equipa muito profissional, simpática e cuidadosa. Recomendo vivamente o serviço!" },
  { name: "Ana Paula Silveira", rating: 5, date: "2026-09", profile: "lisboa", text: "Fiquei muito satisfeita com o serviço. Desde o primeiro contacto, foram super prestáveis e solícitos. Consegui agendar a limpeza do sofá em menos de 24 horas, foram muito pontuais e o sofá ficou como novo." },
  { name: "Ana Figueira", rating: 5, date: "2026-09", profile: "lisboa", text: "Serviço excelente! Fiquei muito satisfeita com o resultado da limpeza dos meus tapetes. Ficaram impecáveis, limpos e com um aspeto renovado. 👌✨\nDestaco também o profissionalismo, a simpatia e o cuidado em todo o serviço. Sem dúvida uma empresa que recomendo e à qual voltarei a recorrer! ⭐⭐⭐⭐⭐" },
  { name: "Dongting Liu", rating: 5, date: "2026-09", profile: "lisboa", text: "Serviço excelente! O tapete ficou muito limpo, com um aspeto renovado e um cheiro agradável. Foram muito profissionais, cuidadosos e pontuais. O resultado superou as minhas expectativas. Recomendo sem dúvida!" },
  { name: "Marek Konieczny", rating: 5, date: "2026-09", profile: "lisboa", text: "Excellent communication, competitive pricing, quick execution time. The team arrived all smiles right on time, did the job well. 2 sofas, mattrass and bed'sback cleaned thoroughly.  Highly recommended." },
  { name: "Laura Rodrigues", rating: 5, date: "2026-09", profile: "lisboa", text: "Ótimo serviço! O profissional Rodolfo foi muito atencioso e querido. Chegou ainda mais cedo do que o combinado e fez o trabalho minuciosamete. Obrigada." },
  { name: "José Miguel Silva", rating: 5, date: "2026-09", profile: "lisboa", text: "Serviço bastante expedito - tudo o que eu precisava para um tratamento de alcatifas pós-inundação.\nEquipa bastante eficiente." },
  { name: "Cláudio Ferreira", rating: 5, date: "2026-09", profile: "lisboa", text: "Excelente trabalho. Tinha umas manchas de marcador no sofá e ambas foram removida na sua totalidade. Está como veio de fábrica." },
  { name: "Manuel Reis", rating: 5, date: "2026-08", profile: "lisboa", text: "Serviço excecional e equipa rápida e eficaz a resolver os problemas." },
  { name: "Rute Ribeiro", rating: 5, date: "2026-09", profile: "lisboa", text: "O colchão ficou como novo, muito satisfeita, o Sr. Joab é competente e muito simpático" },
  { name: "Rodolfo Lucena", rating: 5, date: "2026-08", profile: "lisboa", text: "Excelente serviço" },
  { name: "Lidia P", rating: 5, date: "2026-09", profile: "lisboa", text: "Serviço rápido e com todos os esclarecimentos e fichas técnicas dos produtos." },
  { name: "Bárbara Santos", rating: 5, date: "2026-09", profile: "lisboa", text: "Ótimo servico" },
  { name: "Pb. Céfas Audicelio Reis", rating: 4, date: "2026-09", profile: "lisboa", text: "A higienização ficou perfeita, o operador excelente, mas com tudo infelizmente por ser uma sujidade de muito anos não ficou a cor do colchão como eu esperava." },
  { name: "Francisco Peixoto", rating: 5, date: "2026-08", profile: "lisboa", text: "Ótimo serviço, muita simpatia!" },
  // Transcritas pelo dono a 2026-09-10 da ficha de Lisboa; a 2026-10-09 já não
  // apareciam na lista do Google, e o dono pediu para ficarem (mesmo dia).
  { name: "Diogo Branco", rating: 5, date: "2026-08", profile: "lisboa", text: "Correu muito bem. Quer a fase de combinação quer a de execução. A comunicação foi fácil e cordial, o trabalho cuidadoso e a pessoa que o efetuou, João, muito bem educado e cordial. Voltarei a utilizar os vossos serviços" },
  { name: "Maria Sousa", rating: 5, date: "2026-08", profile: "lisboa", text: "Serviço impecável e equipa muito simpática.\nRecomendo!" },
  { name: "Ana Relva", rating: 5, date: "2026-08", profile: "lisboa", text: "Super acessíveis desde o primeiro momento, sem problemas em responder a qualquer questão. Limpeza 5* e cumpridores de horários. Recomendo vivamente" },
  { name: "Susana Gonçalves", rating: 5, date: "2026-09", profile: "lisboa", text: "Muito satisfeita com o vosso serviço" },
  { name: "Paulo Peixoto", rating: 5, date: "2026-08", profile: "lisboa", text: "Serviço muito competente." },
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

// Só estrelas, sem comentário (dono, 25 Nov: "as sem texto podes por"): vão no
// fim das histórias da página inicial e em mais lado nenhum.
const GOOGLE_STAR_ONLY: GoogleReview[] = [
  { name: "Joana Vasconcelos Sousa", rating: 5, date: "2026-11", profile: "porto", text: "" },
  { name: "Raquel Palma", rating: 5, date: "2026-11", profile: "lisboa", text: "" },
  { name: "Marc Recco", rating: 5, date: "2026-11", profile: "lisboa", text: "" },
  { name: "miguel santos", rating: 4, date: "2026-11", profile: "lisboa", text: "" },
  { name: "Bárbara Fonseca", rating: 5, date: "2026-11", profile: "porto", text: "" },
  { name: "Vera Lacerda", rating: 5, date: "2026-11", profile: "lisboa", text: "" },
  { name: "Rafaela Passos", rating: 5, date: "2026-11", profile: "lisboa", text: "" },
  { name: "Patrick Machado", rating: 5, date: "2026-11", profile: "porto", text: "" },
  { name: "Ana Isabel Bezerra Rodrigues Machado", rating: 5, date: "2026-11", profile: "porto", text: "" },
  { name: "Cristina Domingues Cabral", rating: 5, date: "2026-11", profile: "porto", text: "" },
  { name: "Luciana Pinto Pinto", rating: 5, date: "2026-11", profile: "porto", text: "" },
  { name: "DANIEL Oliveira", rating: 4, date: "2026-11", profile: "porto", text: "" },
  { name: "Tiago Costa", rating: 5, date: "2026-11", profile: "porto", text: "" },
  { name: "Paulo Peixoto", rating: 5, date: "2026-11", profile: "porto", text: "" },
  { name: "Hélder Neves", rating: 5, date: "2026-10", profile: "porto", text: "" },
  { name: "Eduardo Cruz", rating: 5, date: "2026-10", profile: "porto", text: "" },
  { name: "José Gonçalves", rating: 5, date: "2026-10", profile: "porto", text: "" },
  { name: "liliana costa", rating: 5, date: "2026-10", profile: "porto", text: "" },
  { name: "Leonel Carvalho", rating: 5, date: "2026-10", profile: "porto", text: "" },
  { name: "Cristina Ferreira", rating: 5, date: "2026-10", profile: "porto", text: "" },
  { name: "Maciel Sa", rating: 4, date: "2026-10", profile: "porto", text: "" },
  { name: "Inês Carvalho", rating: 5, date: "2026-10", profile: "lisboa", text: "" },
  { name: "Ana Alexandre", rating: 5, date: "2026-10", profile: "lisboa", text: "" },
  { name: "Anabela Gerardo", rating: 5, date: "2026-10", profile: "porto", text: "" },
  { name: "Alice Gonçalves", rating: 5, date: "2026-10", profile: "porto", text: "" },
  { name: "Sandra Santos", rating: 5, date: "2026-10", profile: "lisboa", text: "" },
  { name: "Cristiana Ferreira", rating: 5, date: "2026-09", profile: "porto", text: "" },
  { name: "Oliur Rahman", rating: 5, date: "2026-09", profile: "porto", text: "" },
  { name: "Pedro Santos", rating: 5, date: "2026-09", profile: "porto", text: "" },
  { name: "Sebastião Lopes Teixeira", rating: 4, date: "2026-09", profile: "lisboa", text: "" },
  { name: "Jorge Lopes", rating: 5, date: "2026-09", profile: "porto", text: "" },
  { name: "Arq. Helena Faria", rating: 5, date: "2026-09", profile: "porto", text: "" },
  { name: "Marcelo Davis", rating: 5, date: "2026-09", profile: "lisboa", text: "" },
  { name: "Maria Otília Neto", rating: 4, date: "2026-09", profile: "porto", text: "" },
  { name: "vanessa couto da mata", rating: 5, date: "2026-09", profile: "porto", text: "" },
  { name: "Sara Rochete", rating: 4, date: "2026-09", profile: "lisboa", text: "" },
  { name: "André Geraldes", rating: 5, date: "2026-09", profile: "porto", text: "" },
  { name: "Miguel CR", rating: 5, date: "2026-08", profile: "porto", text: "" },
  { name: "Carla Laureano", rating: 5, date: "2026-08", profile: "porto", text: "" },
  { name: "Maria João Velez", rating: 5, date: "2026-08", profile: "porto", text: "" },
  { name: "Monique", rating: 5, date: "2026-08", profile: "porto", text: "" },
  { name: "Antonio Caldas", rating: 5, date: "2026-08", profile: "porto", text: "" },
  { name: "Maria Sousa", rating: 5, date: "2026-08", profile: "porto", text: "" },
  { name: "Parabéns Francis", rating: 5, date: "2026-06", profile: "porto", text: "" },
  { name: "Helena Peixoto", rating: 5, date: "2025-12", profile: "porto", text: "" },
  { name: "Mariana Campilho", rating: 5, date: "2025-12", profile: "porto", text: "" },
  { name: "fatima martins", rating: 5, date: "2025-11", profile: "porto", text: "" },
  { name: "tomas melo", rating: 5, date: "2025-11", profile: "porto", text: "" },
  { name: "Afonso", rating: 5, date: "2025-09", profile: "porto", text: "" },
  { name: "Sandra Miranda da Silva", rating: 5, date: "2025-09", profile: "porto", text: "" },
  { name: "sonia Basto", rating: 5, date: "2025-09", profile: "porto", text: "" },
  { name: "Genuino - restaurante italiano", rating: 5, date: "2025-09", profile: "porto", text: "" },
  { name: "Diogo Osório", rating: 5, date: "2025-01", profile: "porto", text: "" },
  { name: "Beatriz Machado", rating: 5, date: "2024-11", profile: "porto", text: "" },
  { name: "Maria príncipe vaz de almada", rating: 5, date: "2024-11", profile: "porto", text: "" },
  { name: "Susana Oliveira", rating: 5, date: "2024-10", profile: "porto", text: "" },
  { name: "Joana Aires", rating: 5, date: "2024-08", profile: "porto", text: "" },
  { name: "Santiago Aires", rating: 5, date: "2024-07", profile: "porto", text: "" },
];
export const STAR_ONLY_REVIEWS: PoolReview[] = GOOGLE_STAR_ONLY.map(toPool);

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

/** Escolha determinística (dono, 14 Nov): cada página mostra só avaliações
 *  de 5 estrelas que falam do serviço dela; se faltarem, completa com
 *  avaliações gerais de 5 estrelas que não falam de nenhum serviço. Nunca
 *  uma avaliação de outro serviço (ex.: carpete numa página de sofás).
 *  Páginas da região de Lisboa usam primeiro a ficha de Lisboa; as outras
 *  nunca mostram avaliações com a cidade de outra região. */
export function pickReviewSubset(serviceSlug: string, seed: string, count = 6): PoolReview[] {
  const region = reviewRegion(seed);
  const regionOf = (r: PoolReview) => (r.city === 'Lisboa' ? 'lisboa' : undefined);
  const fiveStars = PUBLISHED_REVIEWS.filter(r => r.rating === 5);
  const local = region ? fiveStars.filter(r => regionOf(r) === region) : [];
  const rest = fiveStars.filter(r => !regionOf(r) && !local.includes(r));
  const order = (list: PoolReview[]) => [...list].sort((a, b) => hashSeed(`${seed}:${a.name}:${a.date}`) - hashSeed(`${seed}:${b.name}:${b.date}`));
  const own = (r: PoolReview) => servicesOf(r).includes(serviceSlug);
  const generic = (r: PoolReview) => servicesOf(r).length === 0;
  const picked: PoolReview[] = [];
  for (const r of [...order(local).filter(own), ...order(rest).filter(own), ...order(local).filter(generic), ...order(rest).filter(generic)]) {
    if (picked.length >= count) break;
    if (!picked.includes(r)) picked.push(r);
  }
  return picked.map(r => ({ ...r }));
}
