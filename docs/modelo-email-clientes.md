# Modelo de email a clientes (pedido de orçamento)

Pedido do dono, 4 Nov 2026. Vale para responder à mão a um pedido por email. O dono vê sempre o texto final antes de sair. Preços só do motor (`quote` da `bot-api`) ou os que o dono der.

## Texto

Assunto: resposta no mesmo fio do email da pessoa, com quem ela pôs em cópia.

    Bom dia, [nome],

    Obrigado pelo contacto[ e pelas fotografias].

    Para [peças], em [localidade] e com a deslocação incluída:

    [Opção Premium]: [total]€. Dura até 10 anos, conforme o uso, com garantia, e inclui 5 lavagens: se cair um líquido, limpa sozinha com um pano, até 5 vezes no mesmo sítio.
    [Opção Essencial]: [total]€. Dura 1 a 2 anos, com garantia de 2 anos, e inclui 2 lavagens no mesmo sítio.
    [Só limpeza]: [total]€.

    [Uma frase sobre o problema dela, sem prometer resultado.]

    A limpeza é feita por extração profissional e seca em 2 a 5 horas.

    Em anexo seguem fotografias de antes e depois de trabalhos nossos e um vídeo de como a impermeabilização repele os líquidos.

    Qual das opções prefere, e que dias lhe dão mais jeito?

    Com os melhores cumprimentos,
    Kyro Clean Solutions

## Anexos, conforme o serviço pedido

Pasta: `~/Documents/02 Kyro/Pastas antigas/Kyro-bot-whatsapp/`. Um antes e depois por serviço pedido; o vídeo só se a impermeabilização for oferecida.

| Serviço | Ficheiro |
|---|---|
| Sofá | `antes-depois-juntas/antes-depois-sofa.jpg` |
| Cadeiras | `antes-depois-juntas/antes-depois-cadeiras.jpg` |
| Colchão | `antes-depois-juntas/antes-depois-colchao.jpg` |
| Tapete | `antes-depois-juntas/antes-depois-tapete.jpg` |
| Impermeabilização | `fotos-antes-depois/impermeabilizacao/video-impermeabilizacao.mp4` |
