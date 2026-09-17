// Endereço remetente das notificações de pedidos (ver send-lead-email). Centralizado
// aqui porque list-resend-leads também precisa dele, para filtrar a lista de emails
// da conta Resend só aos pedidos, sem misturar outros envios (ex. newsletter, que
// usa um remetente kyroclean.pt diferente).
export const LEAD_FROM_ADDRESS = "pedidos@cleansolutions.com.pt";
