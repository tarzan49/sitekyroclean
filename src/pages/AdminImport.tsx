import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Upload, CheckCircle, XCircle, AlertCircle, Lock } from 'lucide-react';

const ADMIN_PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD as string) || 'kyro2025';
const BATCH_SIZE = 25;

// ── Helpers ───────────────────────────────────────────────────────────────────

function toIso(d: string): string {
  const s = d.trim();
  if (!s) return new Date().toISOString();
  const parts = s.split('/');
  if (parts.length !== 3) return new Date().toISOString();
  const [y, m, day] = parts;
  return `${y}-${m.padStart(2, '0')}-${day.padStart(2, '0')}T12:00:00.000Z`;
}

function parseContact(raw: string): { phone: string; email: string; extra: string } {
  const c = raw.trim();
  if (!c) return { phone: '', email: '', extra: '' };
  if (c.includes('@')) {
    const parts = c.split('/');
    const email = parts.find(p => p.includes('@'))?.trim() ?? '';
    const phonePart = parts.find(p => !p.includes('@') && /\d{5,}/.test(p))?.replace(/\s/g, '') ?? '';
    return { phone: phonePart, email, extra: '' };
  }
  if (/\d{5,}/.test(c)) return { phone: c.replace(/\s/g, ''), email: '', extra: '' };
  // Not a real contact — store as extra note
  return { phone: '', email: '', extra: c };
}

// ── Raw CSV data ──────────────────────────────────────────────────────────────
// [assignedTo, date, name, location, status, priority, nextStep, feedback, col11, contact, source]
// Source: "Base de dados CS - Sheet1.csv" — 168 records

type R = [string, string, string, string, string, string, string, string, string, string, string];

const RAW: R[] = [
  ['Manuel','2025/12/09','Sra. Amélia','Leça','Fechado','Fechado','Fechar serviço','Serviço fechado','','936 866 616','Outro'],
  ['Manuel','2025/12/09','Arcádia Bom Sucesso','Porto','Contacto inicial','Morno','Ligar novamente','Sem retorno da chamada','','226 000 863','Restaurante'],
  ['António','2025/12/09','Akeah','Porto','Contacto inicial','Morno','Fechar serviço','Demonstração feita','','Nelito tem cartão','Hotel'],
  ['António','2025/12/09','Hotel Paris','Porto','Sem interesse','','Arquivar lead','','','Gui tem cartão','Hotel'],
  ['António','2025/12/09','Hard Rock','Porto','Interesse demonstrado','Morno','Aguardar resposta','Email enviado','','','Restaurante'],
  ['António','2025/12/09','Café Ateneia','Porto','Interesse demonstrado','Quente','Contactar para o mês seguinte','Contactar em Fevereiro','','','Restaurante'],
  ['António','2025/12/09','Intercontinental','Porto','Follow-up','Frio','Enviar email de follow-up','Enviar proposta','','Gui tem cartão','Hotel'],
  ['António','2025/12/09','Sra. Marlene','Alentejo','Fechado','Fechado','','','','913776427','Site'],
  ['António','2025/12/09','Sra. Helena Silva','Porto','Orçamento enviado','Urgente','Aguardar resposta','Aguardar resposta','','918888370','Site'],
  ['António','2025/12/09','Sra. Ana Costa','Porto','Orçamento enviado','Urgente','Ligar novamente','Aguardar resposta','','938016044','Site'],
  ['Manuel','2025/12/09','Sr. António Poças','Porto','Orçamento enviado','Fechado','','Aguardar resposta','','937422576','Site'],
  ['António','2025/12/09','Sra. Helena Pereira','Porto','Orçamento enviado','Frio','Arquivar lead','Não quer mais','','910023089','Site'],
  ['António','2025/12/09','Sra. Julia','Cantanhede','A decidir','Urgente','Ligar novamente','Prov Terça 16/12 16h','','968018187','Site'],
  ['António','2025/12/09','Sra. Cláudia Bravo','Porto','Fechado','Fechado','','Impermeabilização','','969991845','Site'],
  ['António','2025/12/09','Garden Baltazar','Porto','Cliente recorrente','Fechado','','Contactar antes Natal','','924133466','Restaurante'],
  ['António','2025/12/09','Mãe da Zu','Espinho','Fechado','Fechado','','TARZAN + Enviar videos','','964 161 729','Outro'],
  ['António','2025/12/09','Sky Valley','Esposende','Interesse demonstrado','Morno','Ligar novamente','Ligar','','913 947 843','Restaurante'],
  ['Manuel','2025/12/09','Arcádia Boavista','Porto','Cliente recorrente','Quente','Contactar para a semana','Contactar até 14/12','','Contacto Cláudia','Site'],
  ['Manuel','2025/12/09','Arcádia Foz','Porto','A decidir','Quente','Contactar para a semana','Tentar fechar até final do ano','','Contactar Helena','Site'],
  ['António','2025/12/09','Downtown Hotel','Porto','A decidir','Quente','Contactar para a semana','Dão resposta em inicio de janeiro','','22 325 8071','Hotel'],
  ['António','2025/12/09','Jaime Guimarães','Porto','Fechado','Fechado','','','','935 530 350','Outro'],
  ['António','2025/12/09','Tiago Borges','Porto','Fechado','Fechado','','Contactar acerca de AL','','917 844 262','Outro'],
  ['António','2025/12/09','Rafaela Duarte','Lisboa','Demonstração marcada','Fechado','','Influencer Lisboa 14h 20/12','','','Instagram'],
  ['António','2025/12/09','Vera Kolodzig','Lisboa','Demonstração marcada','Fechado','','Influencer Lisboa 21/12','','932956558','Instagram'],
  ['António','2025/12/09','Luciana Abreu','Lisboa','Interesse demonstrado','Morno','Enviar mensagem WhatsApp','Parou de responder','','Instagram','Instagram'],
  ['António','2025/12/09','Elma Aveiro','Lisboa/Brasil','Interesse demonstrado','Frio','Contactar para o mês seguinte','Futuramente se precisar contactar','','Instagram','Instagram'],
  ['António','2025/12/11','Arcádia Matosinhos','Matosinhos','Contacto inicial','Frio','Enviar email de follow-up','Subcontratam outra empresa','','online@arcadia.pt','Restaurante'],
  ['António','2025/12/11','Sky Valley','Esposende','Interesse demonstrado','Morno','Ligar novamente','Enviei mensagem 11/12','','913 947 843','Restaurante'],
  ['António','2025/12/11','Motel Flamingo','Porto','Contacto inicial','Frio','Ligar novamente','Podem vir a precisar','','229 965 950','Hotel'],
  ['António','2025/12/11','Silk Motel','Porto','Contacto inicial','Frio','Ligar novamente','Voltar a ligar','','227418418/geral@silkmotel.com','Hotel'],
  ['António','2025/12/11','Motel Portofino','Porto','Interesse demonstrado','Frio','Ligar novamente','Enviei email para ana soares governanta','','geral@motelportofino.com','Site'],
  ['Manuel','2025/12/11','Artcore Hotel','Porto','Follow-up','Frio','','Email de apresentação enviado','','Info@artcorehotel.com','Hotel'],
  ['Manuel','2025/12/11','Paulo Ferreira','Porto','Follow-up','Frio','','Contacto feito a aguarda reposta','','936 950 260','Hotel'],
  ['Manuel','2025/12/11','Helena Maria','Porto','Orçamento enviado','Morno','Aguardar resposta','Aguardar reposta ao orçamento','','helenamariap073@gmail.com','Outro'],
  ['Manuel','2025/12/11','Oito em Ponto','Porto','Interesse demonstrado','','','A aguardar retorno na mensagem','','oitoemponto@oitoemponto.com','Restaurante'],
  ['Manuel','2025/12/11','Boite Porto','Porto','Interesse demonstrado','Fechado','Contactar para o mês seguinte','Contactar futuramente para limpeza dos restantes itens','','','Outro'],
  ['António','2025/12/11','Motel Alto de Valongo','Porto','Contacto inicial','Frio','Marcar demonstração','Enviei email','','altodevalongo@altodevalongo.com','Hotel'],
  ['Manuel','2025/12/11','The Cork','Porto','Interesse demonstrado','Morno','Marcar demonstração','Falei com o responsável Pedro','','938 394 324','Restaurante'],
  ['Manuel','2025/12/11','Tourigalo','Porto','Interesse demonstrado','Morno','','Voltar a ir lá','','226162058','Restaurante'],
  ['Tomás','2025/12/11','Wow','Porto','Contacto inicial','Frio','','Enviar email','','Info@wow.pt','Restaurante'],
  ['Tomás','2025/12/11','Sim ou sopas','Porto','Contacto inicial','','','Já tem empresa q faça isto','','932 909 997','Restaurante'],
  ['Tomás','2025/12/11','Thamel Porto','Porto','Contacto inicial','','','Voltam a contactar','','221 113 947','Restaurante'],
  ['Tomás','2025/12/11','Astoria','Porto','Contacto inicial','','','Enviar email','','22 003 5639','Restaurante'],
  ['Manuel','2025/12/11','Bia Pinto','Porto','Fechado','Fechado','','','','','Instagram'],
  ['Manuel','2025/12/12','Patrícia Silva','Ribeirão','Fechado','','','Influencer','','913872772','Instagram'],
  ['Tomás','2025/12/12','Sofia','Porto','Reunião marcada','','','Necessita dos nossos serviços','','926 250 769','Hotel'],
  ['Tomás','2025/12/12','Sardines and friends','Porto','Interesse demonstrado','','','Ligar na terça feira novamente','','962 083 329','Hotel'],
  ['Tomás','2025/12/12','Oporto ocean','Porto','Contacto inicial','','','Enviar email','','','Hotel'],
  ['Tomás','2025/12/12','Hostel das flores','Porto','Contacto inicial','','','Ligar no dia 22','','931 182 478','Hotel'],
  ['Tomás','2025/12/12','So cool hostel','Porto','Contacto inicial','','','','','224 928 334','Hotel'],
  ['Tomás','2025/12/12','Vanda gerente vintage beach house','Matosinhos','Contacto inicial','','','Enviar apresentação','','936 205 520','Hotel'],
  ['Manuel','2025/12/12','Bb Gourmet','Porto','Contacto inicial','Frio','Marcar demonstração','Email','','','Restaurante'],
  ['António','2025/12/13','Café Cerva','Porto','Contacto inicial','Frio','','Dono restaurante passatempo','','','Restaurante'],
  ['Guilherme','2025/12/13','limehome hosteis','Porto','Ainda não houve contacto','Frio','','Gui guardou contacto','','','AL'],
  ['Guilherme','2025/12/13','Ilicito Bar','Porto','Contacto inicial','Frio','','Enviar email - Gui tem contacto','','','Hotel'],
  ['António','2025/12/13','Hotel Pão de Açucár','Porto','Contacto inicial','Frio','','Email enviado','','info@paodeacucarhotel.pt','Hotel'],
  ['António','2025/12/13','Hotel Porto Rico','Porto','Ainda não houve contacto','Frio','','Ligar gerente numero à frente','','967001258','Hotel'],
  ['António','2025/12/13','Antonio Julio Santander','Porto','Contacto inicial','Frio','','Email enviado','','antonio.perre@santander.pt','Rua'],
  ['António','2025/12/13','Buga Ramen','Porto','Contacto inicial','Frio','','Vai passar informação à gerência','','221111332','Restaurante'],
  ['António','2025/12/13','degema','Porto','Sem interesse','Frio','','Deixei cartão','','','Restaurante'],
  ['Guilherme','2025/12/13','Bullguer','Porto','Contacto inicial','Frio','','Gui tem contacto','','','Restaurante'],
  ['Guilherme','2025/12/13','Han tabel Barbecue','Porto','Contacto inicial','Frio','','Gui tem contacto','','','Restaurante'],
  ['António','2025/12/13','Grupo brasão','Porto','Contacto inicial','Frio','','Enviei email','','reservas@brasao.pt','Restaurante'],
  ['Guilherme','2025/12/13','Interdesign Aliados','Porto','Contacto inicial','Frio','','Gui tem contacto','','','Outro'],
  ['António','2025/12/13','David Rosas Aliados','Porto','Interesse demonstrado','Morno','Contactar para o mês seguinte','Passar dia 5 de janeiro interessa para lojas todas','','Ir diretamente lá','Outro'],
  ['António','2025/12/13','Italian Republic','Porto','Sem interesse','Frio','','Já têm equipa interna','','','Restaurante'],
  ['António','2025/12/13','Glad Café','Porto','Demonstração marcada','Morno','Fechar serviço','Dia 14/12 11h','','Instagram','Restaurante'],
  ['António','2025/12/13','The Social Hub','Porto','Contacto inicial','Frio','Enviar email de follow-up','Passar dia 29 dezembro 15h email já enviado Nuno Silva','','nuno.silva@thesocialhub.co','Hotel'],
  ['Guilherme','2025/12/13','Real by Casa da Calçada','Porto','Interesse demonstrado','Morno','Marcar demonstração','Ligar segunda marca demo','','Gui tem contacto','Outro'],
  ["António",'2025/12/13',"N' Ordem",'Porto','Ainda não houve contacto','Frio','','Não estavam Responsáveis','','915 316 276','Outro'],
  ['Guilherme','2025/12/13','Boémio restaurante','Porto','Contacto inicial','Frio','','Sem informação','','','Outro'],
  ['Guilherme','2025/12/13','Simplicoffe','Porto','Interesse demonstrado','Morno','Contactar para o mês seguinte','Falar em Fevereiro','','','Outro'],
  ['António','2025/12/13','Sweet Porto','Porto','Contacto inicial','Frio','','Enviei email','','hello@sweetporto.com','AL'],
  ['António','2025/12/13','Vacaruum','Porto','Sem interesse','Frio','','Já têm equipa interna','','','Restaurante'],
  ['António','2025/12/13','Mercure Hotel','Porto','Contacto inicial','Frio','','Enviei email','','hb2l7@accor.com','Hotel'],
  ['Guilherme','2025/12/13','Nuad Thai massage','Porto','Contacto inicial','Frio','','Sem informação','','','Outro'],
  ['António','2025/12/13','Gelataria Portuense','Porto','Interesse demonstrado','Morno','Fechar serviço','Enviei email','','info@gelatariaportuense.pt','Outro'],
  ['António','2025/12/13','A Brasileira','Porto','Contacto inicial','Frio','Enviar email de follow-up','Enviei email','','res.abrasileira@pestana.com','Restaurante'],
  ['António','2025/12/13','Porto Bay Hotel','Porto','Contacto inicial','Frio','Enviar email de follow-up','Enviei email','','housekeeping.pbt@portobay.pt','AL'],
  ['António','2025/12/13','Lethes Home','Porto','Contacto inicial','Frio','Enviar email de follow-up','Enviei email - vai mudar gerência','','reservas@letheshome.pt','Outro'],
  ['Guilherme','2025/12/13','Hotel Pestana a Brasileira','Porto','Contacto inicial','Frio','Enviar email de follow-up','Falamos com gerente mas já limparam colchões','','Gui tem do gerente','Hotel'],
  ['António','2025/12/13','Hotel Girassol','Porto','Contacto inicial','Frio','Enviar email de follow-up','Enviei email','','reservas@hotelgirassolmadeira.com','Hotel'],
  ['António','2025/12/13','Hotel D José','Porto','Contacto inicial','Frio','Enviar email de follow-up','Enviei email','','hotelsaojose@hotelsjose.pt','Hotel'],
  ['António','2025/12/13','Bessa apartmens','Porto','Contacto inicial','Frio','Enviar email de follow-up','Enviei email','','geral@oportoseven.pt','AL'],
  ['António','2025/12/13','Confeitaria Tupi','Porto','Orçamento enviado','Morno','Fechar serviço','Enviei email com orçamento','','confeitariatupi@gmail.com','Restaurante'],
  ['Guilherme','2025/12/13','Nortada','Porto','Interesse demonstrado','Morno','Marcar demonstração','Interesse - Ligar janeiro','','968842550','Outro'],
  ['Guilherme','2025/12/13','Niva','Porto','Interesse demonstrado','Morno','Marcar demonstração','Falar com niva matosinhos para demonstração','','968 967 566','Outro'],
  ['Guilherme','2025/12/13','Galo Grigio','Porto','Interesse demonstrado','Morno','Marcar demonstração','Gui email para demonstração','','','Outro'],
  ['António','2025/12/13','Brunch It','Porto','Interesse demonstrado','Quente','Marcar demonstração','Enviei mensagem a fazer apresentação a Tiago Rocha','','912405901','Restaurante'],
  ['Guilherme','2025/12/13','Duello Mexicano','Porto','Orçamento enviado','Fechado','Fechar serviço','Aguardando resposta','','duelloporto@gmail.com','Restaurante'],
  ['Guilherme','2025/12/13','Jeronymo','Porto','Contacto inicial','Frio','Enviar email de follow-up','Gui enviar email','','','Restaurante'],
  ['Guilherme','2025/12/13','Inala Porto','Porto','Demonstração marcada','Quente','Fechar serviço','Demo 13/12 15h','','Gui tem contacto','Outro'],
  ['António','2025/12/13','Pizzaiolo','Porto','Follow-up','Morno','Ligar novamente','Enviei email a diretor geral grupo','','blvcinvest@gmail.com','Restaurante'],
  ['António','2025/12/13','Hotel Boa Vista Foz','Porto','Contacto inicial','Frio','Enviar orçamento','Enviei email','','Sugestoes@hotelboavista.com','Hotel'],
  ['António','2025/12/13','Taberna Londrina','Porto','Contacto inicial','Frio','Enviar orçamento','Enviei email','','geral@tabernalondrina.com','Restaurante'],
  ['Guilherme','2025/12/12','Susboom Tattoo Cliente','Porto','Interesse demonstrado','Quente','Ligar novamente','Tirar medidas dos m2','','912 455 689','Outro'],
  ['Guilherme','2025/12/12','Mário Cliente','Porto','Fechado','Fechado','Contactar para a semana','Contactar dia 19','','965 382 144','Outro'],
  ['Guilherme','2025/12/12','Benedita Guimarães','Porto','Interesse demonstrado','Quente','Contactar para a semana','Desmarcou ligar e remarcar','','912 298 786','Outro'],
  ['Manuel','2025/12/13','Sushiana','Porto','Contacto inicial','Frio','Contactar para a semana','','','','Restaurante'],
  ['Guilherme','2025/12/16','Your host','Porto','Fechado','Fechado','Contactar para o mês seguinte','Ligar em janeiro para ver novos apartamentos','','911 175 582','AL'],
  ['Guilherme','2025/12/16','Marlene Teixeira','Santarém/Lisboa','Fechado','Fechado','Contactar para o mês seguinte','Ligar em janeiro a marcar limpeza de tapetes e colchões','','913 776 427','Google Ads'],
  ['Guilherme','2025/12/15','The Cakes','Braga','A decidir','Quente','Ligar novamente','Insistir para marcar serviço','','913 529 934','Restaurante'],
  ['Guilherme','2025/12/15','Benedita','Evora','Orçamento enviado','Quente','Enviar mensagem WhatsApp','Chatear para marcar serviço quer impermeabilização','','932 688 722','Google Ads'],
  ['Guilherme','2025/12/16','Marta Carvalhais','Viseu','A decidir','Quente','Ligar novamente','Ficou apreensiva ao preço','','966 288 282','Google Ads'],
  ['Guilherme','2025/12/16','Isabel Azeredo Mae David','Porto','Fechado','Quente','Contactar para a semana','Falta limpar os sofás em janeiro','','931 121 671','Flyer'],
  ['Guilherme','2025/12/16','Helena Brandão','Porto','Interesse demonstrado','Quente','Marcar demonstração','Quer limpar tapetes da yoga','','932 777 500','Rua'],
  ['Guilherme','2025/12/16','Pedro','Porto','Interesse demonstrado','Morno','Enviar mensagem WhatsApp','Insistir, quer limpar sofá e tapete','','913 498 193','Rua'],
  ['Guilherme','2025/12/16','Gilberto','Gaia','Interesse demonstrado','Morno','Ligar novamente','Baixar o preço para vender','','915 296 308','Flyer'],
  ['Guilherme','2025/12/16','Mariana Figueiredo','Aveiro','Cliente recorrente','Fechado','Enviar mensagem WhatsApp','Contactar a confirmar serviço','','910 660 550','Flyer'],
  ['António','2025/12/19','Amiga Zu','Espinho','Interesse demonstrado','Quente','Contactar para o mês seguinte','Contactar quando Zu voltar do brasil','','','Outro'],
  ['Flávia','2025/12/29','Paulo Nunes','Vila do Conde','Marcar demonstração','Morno','Marcar demonstração','Marcar visita para demonstração e orçar serviços','','936549438','Rua'],
  ['Flávia','2025/12/29','Viaya','Vila do Conde','Marcar demonstração','Quente','Marcar demonstração','Marcar visita para demonstração e orçar serviços','','963333393','Restaurante'],
  ['Flávia','2025/12/29','Mariana','Vila do Conde','Marcar demonstração','Morno','Marcar demonstração','Marcar visita para demonstração e orçar serviços','','91977886','Restaurante'],
  ['Flávia','2025/12/29','Isilda','Vila do Conde','Marcar demonstração','Morno','Marcar demonstração','Marcar visita para demonstração e orçar serviços','','252620249','Rua'],
  ['Flávia','2025/12/29','Senze','Vila do Conde','Marcar demonstração','Morno','Marcar demonstração','Marcar visita para demonstração e orçar serviços','','967896678','Restaurante'],
  ['Flávia','2025/12/29','Elsa Lima','Vila do Conde','Marcar demonstração','Morno','Marcar demonstração','Marcar visita para demonstração e orçar serviços','','960063206','Hotel'],
  ['Flávia','2025/12/29','Stefanie','Vila do Conde','Marcar demonstração','Morno','Marcar demonstração','Marcar visita para demonstração e orçar serviços','','965313776','Restaurante'],
  ['Flávia','2025/12/29','Pedro Torres','Vila do Conde','Marcar demonstração','Quente','Marcar demonstração','Marcar visita para demonstração e orçar serviços','Ligar e agendar segunda feira com Ana Paula - responsáveis compras','967010144','Restaurante'],
  ['Flávia','2025/12/29','Carlos Almeida','Vila do Conde','Marcar demonstração','Morno','Marcar demonstração','Carlos volta de ferias, retornar ligacao 5 janeiro a tarde','','227335200','Rua'],
  ['Flávia','2025/12/29','Tiago (amigo pessoal)','Vila do Conde','Marcar demonstração','Morno','Marcar demonstração','Marcar visita para demonstração e orçar serviços','','252065059','Restaurante'],
  ['Flávia','2025/12/29','Vivian - amiga pessoal','Casa Musica','Demonstração marcada','Quente','Realizar demonstração e fechar','Tapete BEIRIZ limpar e impermeabilizar e Sofa - marcar janeiro','','915 488 433','Amiga pessoal'],
  ['Flávia','2026/1/2','Fitnessup','Povoa do Varzim','Contacto inicial','Frio','','Aguardo contato Diretor Diogo','','911128277','Academia'],
  ['Flávia','2026/1/2','Casa do Rio - charm suites','Vila do Conde','Contacto inicial','Frio','','','','967892019','Hotel'],
  ['Flávia','2026/1/2','B & B Hotels','Vila do Conde','Contacto inicial','Frio','','','','252021996','Hotel'],
  ['Flávia','2026/1/2','Rendilheira Boutique Hotel','Vila do Conde','Contacto inicial','Frio','','','','252615113','Hotel'],
  ['Flávia','2026/1/2','Hl Vila do Conde Pousada','Vila do Conde','Contacto inicial','Frio','','','','252611627','Hotel'],
  ['Flávia','2026/1/2','Hotel Brazão','Vila do Conde','Contacto inicial','Frio','','','','252642016','Hotel'],
  ['Flávia','2026/1/2','The Lince Santa Vlara Hostoric','Vila do Conde','Contacto inicial','Frio','','','','252035300','Hotel'],
  ['Flávia','2026/1/2','VillaC Boutique Hotel','Vila do Conde','Contacto inicial','Frio','','','','252240420','Hotel'],
  ['Flávia','2026/1/2','Venceslau Wine Boutique Hotel','Vila do Conde','Contacto inicial','Frio','','','','252646362','Hotel'],
  ['Flávia','2026/1/2','Azurara Guest House','Vila do Conde','Contacto inicial','Frio','','','','919262393','Hotel'],
  ['Flávia','2026/1/2','Giest House Eça Agora','Vila do Conde','Contacto inicial','Frio','','','','917508185','Hotel'],
  ['António','2026/1/20','Cidália Cliente','Esmoriz','Interesse demonstrado','Urgente','Fechar serviço','Contactar 1/2 fechar serviço','','912143590','Google Ads'],
  ['António','2026/1/20','Soraia Cliente','Aveiro','A decidir','Morno','Fechar serviço','Está a analisar - 2 colchões','','965800221','Google Ads'],
  ['António','2026/1/20','Maria de Fátima Cliente','Aveiro','Contacto inicial','Morno','Ligar novamente','Não respondeu 2x - tapetes','','915309674','Google Ads'],
  ['António','2026/1/20','Patrícia Cliente','Porto','Contacto inicial','Frio','Ligar novamente','Não quer','','934173572','Google Ads'],
  ['António','2026/1/20','Carlos Cliente','Porto','Contacto inicial','Morno','Ligar novamente','Enviei email - nr tlf não funciona - colchão','','932551225','Google Ads'],
  ['António','2026/1/20','Cláudia Cliente','Lisboa','Contacto inicial','Morno','Ligar novamente','Disse que futuramente vai querer - Sofá','','962853375','Google Ads'],
  ['António','2026/1/20','Angela Cliente','Lisboa - Torres Vedras','Contacto inicial','Fechado','Fechar serviço','Quer limpeza - colchão + sofá + impermeabilização','','913728216','Google Ads'],
  ['António','2026/1/20','Soraia Cliente','Lisboa','Contacto inicial','Morno','Ligar novamente','Vai avaliar - Sofá','','932589555','Google Ads'],
  ['António','2026/1/20','Ana Lúcia Cliente','Lisboa','Contacto inicial','Morno','Contactar para o mês seguinte','Para já não quer voltar a ligar 3/2','','916307059','Google Ads'],
  ['António','2026/1/20','Ana Cliente','Leiria','Contacto inicial','Frio','Aguardar resposta','não quer','','914483486','Google Ads'],
  ['António','2026/1/20','Angela Cliente','Famalicão','Contacto inicial','Frio','Ligar novamente','Não quer','','914100305','Google Ads'],
  ['António','2026/1/20','Katia Cliente','Porto','Fechado','Fechado','Fechar serviço','Confirmou - sofá + chaise longue','','931624973','Google Ads'],
  ['António','2026/1/20','Carla Cliente','Porto','Interesse demonstrado','Quente','Contactar para o mês seguinte','Contactar 5/3 termina obras - Sofá','','911904041','Google Ads'],
  ['António','2026/1/20','Manuela Cliente','Porto','Contacto inicial','Morno','Enviar email de follow-up','Enviei email - sofá','','938577356','Google Ads'],
  ['António','2026/1/20','Nor Palma Influencer','Lisboa','Interesse demonstrado','Fechado','Fechar serviço','Quer fazer parceria - marcar para altura de lisboa','','Influencer','Instagram'],
  ['António','2026/1/20','Helena Cliente','Porto','Interesse demonstrado','Morno','Ligar novamente','Não respondeu - colchão','','918888370','Google Ads'],
  ['António','2026/1/20','Ana Costa Cliente','Porto','Interesse demonstrado','Morno','Ligar novamente','Não respondeu - tapetes','','938016044','Google Ads'],
  ['António','2026/1/20','Rafaela Duarte Influencer','Lisboa','Interesse demonstrado','Fechado','Fechar serviço','Quer fazer parceria - marcar para altura de lisboa','','Influencer','Instagram'],
  ['António','2026/1/20','Vera Influencer','Lisboa','Interesse demonstrado','Fechado','Fechar serviço','Quer fazer parceria - marcar para altura de lisboa','','Influencer','Instagram'],
  ['António','2026/1/23','Margarida Ribeiro Cliente','Porto','Orçamento enviado','Frio','Fechar serviço','Quer fazer na 1a semana Fevereiro','','917667269','Google Ads'],
  ['António','2026/1/23','Luis Batista Cliente','Porto','Interesse demonstrado','Morno','Ligar novamente','Enviei mensagem Quer limpar sofá e colchão','','916339914','Google Ads'],
  ['António','2026/1/26','Daniela Paiva Cliente','Porto','Follow-up','Morno','Contactar para o mês seguinte','Diz que quer limpar quando parar de chover - 1 sofá','','933106550','Google Ads'],
  ['António','2026/1/26','Inês Pereira Cliente','Porto','Interesse demonstrado','Urgente','Contactar para o mês seguinte','Quer limpar assim que arranjar as poltronas','','913 452 400','Google Ads'],
  ['António','2026/1/26','Mariana Rabaça','Porto','Follow-up','Morno','Aguardar resposta','não respondeu - sofa e tapetes','','','Google Ads'],
  ['António','2026/1/26','Ana Paula Cliente','Aveiro','Orçamento enviado','Quente','Contactar para o mês seguinte','Ainda está a pensar quando quer fazer','','965411417','Google Ads'],
  ['António','2026/1/26','Vania Nogueira Cliente','Porto','Interesse demonstrado','Morno','Aguardar resposta','Limpeza Cabeceira Cama Casal','','931673910','Google Ads'],
  ['António','2026/1/26','Nice Souza Cliente','Porto','A responder','Morno','Aguardar resposta','Quer limpar tapetes vai mandar as medidas','','911999228','Google Ads'],
  ['António','2026/1/26','Paula Sousa Cliente','Porto','Orçamento enviado','Urgente','Aguardar resposta','3 colchões + 1 sofá','','917 812 240','Google Ads'],
  ['António','2026/1/27','Rita Pinho Cliente','Maia','Orçamento enviado','Urgente','Fechar serviço','1 colchão - quer para esta semana','','965766400','Google Ads'],
  ['António','2026/1/27','Maria Silva Cliente','Rio Tinto','Orçamento enviado','Urgente','Fechar serviço','1 colchão - ficou de dar resposta','','914588640',''],
  ['António','2026/1/28','Manuel Policarpo','Gondomar','Orçamento enviado','Urgente','Fechar serviço','1 colchão + carro 144€ aguardar resposta','','934746999',''],
  ['Manuel','2026/1/26','Miguel Santos','Porto/Matosinhos','A decidir','Morno','Enviar orçamento','64 metros quadrados','','919196343','Rua'],
  ['Manuel','2026/2/10','Fernando - Restaurante na esquina','Santa Maria da Feira','Demonstração marcada','Morno','Realizar demonstração','38 cadeiras + sofás','','',''],
  ['António','2026/2/26','Filomena Cliente','Porto Foz','Fechado','Fechado','Fechar serviço','À espera de dia para limpar','','','Outro'],
  ['António','2026/2/26','Marianela Amiga Zu','Santa Maria da Feira','Fechado','Fechado','Fechar serviço','À espera de dia para limpar','','','Outro'],
  ['António','2026/2/26','Porto dos Gatos','Porto','Interesse demonstrado','Morno','Marcar demonstração','Vou dar follow up nos próximos dias','','','Rua'],
];

// ── Transform raw rows to Supabase records ────────────────────────────────────

function buildRecords() {
  return RAW.map(([assignedTo, date, name, location, status, priority, nextStep, feedback, col11, contact, source]) => {
    const { phone, email, extra } = parseContact(contact);
    const noteParts = [feedback, col11, extra].filter(Boolean);
    return {
      assigned_to: assignedTo.trim(),
      created_at: toIso(date),
      name: name.trim(),
      location: location.trim(),
      status: status.trim() || 'Contacto inicial',
      priority: priority.trim(),
      next_step: nextStep.trim(),
      notes: noteParts.join(' — '),
      phone,
      email: email || null,
      source: source.trim(),
      // Fields required by leads table schema (empty for legacy records)
      service: 'Histórico',
      service_type: '',
      details: '',
      value: '',
      slot: '',
      booking_id: `CSV-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      message: '',
    };
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

const AdminImport = ({ embedded = false }: { embedded?: boolean }) => {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('kyro_admin') === '1');
  const [pwInput, setPwInput] = useState('');
  const [pwError, setPwError] = useState(false);

  const [status, setStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [total] = useState(RAW.length);
  const [errorMsg, setErrorMsg] = useState('');
  const [inserted, setInserted] = useState(0);

  const handleLogin = () => {
    if (pwInput === ADMIN_PASSWORD) {
      sessionStorage.setItem('kyro_admin', '1');
      setAuthed(true);
    } else {
      setPwError(true);
      setTimeout(() => setPwError(false), 2000);
    }
  };

  const runImport = async () => {
    setStatus('running');
    setProgress(0);
    setInserted(0);
    setErrorMsg('');

    const records = buildRecords();
    let done = 0;

    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);
      const { error } = await supabase.from('leads').insert(batch);
      if (error) {
        setErrorMsg(`Erro no lote ${Math.floor(i / BATCH_SIZE) + 1}: ${error.message}`);
        setStatus('error');
        return;
      }
      done += batch.length;
      setProgress(done);
      setInserted(done);
    }

    setStatus('done');
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0D0D1A] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-gold" />
            </div>
            <h1 className="font-playfair text-2xl font-bold text-white">Kyro Admin</h1>
            <p className="text-white/40 text-sm mt-1">Acesso restrito à equipa Kyro</p>
          </div>
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6">
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              value={pwInput}
              onChange={e => setPwInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••••••"
              className={`w-full h-12 px-4 text-sm bg-white/[0.06] border rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-gold transition-colors ${pwError ? 'border-red-500' : 'border-white/15'}`}
            />
            {pwError && <p className="text-red-400 text-xs mt-1.5">Password incorrecta</p>}
            <button onClick={handleLogin} className="w-full h-12 mt-4 bg-gradient-to-r from-gold to-[#d4c57b] text-[#12121e] font-bold rounded-xl hover:opacity-90 transition-opacity">
              Entrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pct = total > 0 ? Math.round((progress / total) * 100) : 0;

  return (
    <div className={`text-white ${embedded ? "" : "min-h-screen bg-[#0D0D1A] px-6 py-8 max-w-2xl mx-auto"}`}>
      {!embedded && (
        <button onClick={() => navigate('/admin/dashboard')} className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar ao Dashboard
        </button>
      )}

      <div className="mb-8">
        <h1 className="font-playfair text-3xl font-bold text-white mb-2">Importar Base de Dados</h1>
        <p className="text-white/40 text-sm">
          Importa <span className="text-gold font-bold">{total} registos</span> históricos da Kyro Clean Solutions para o Supabase.
        </p>
      </div>

      {/* Summary card */}
      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 mb-6 space-y-3">
        <h2 className="text-sm font-bold text-white/60 uppercase tracking-wider">O que vai ser importado</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            ['Registos totais', `${total}`],
            ['Datas', 'Dez 2025 – Fev 2026'],
            ['Responsáveis', 'António, Manuel, Guilherme, Tomás, Flávia'],
            ['Origens', 'Google Ads, Instagram, Site, Rua, Flyer…'],
            ['Colunas mapeadas', 'assigned_to, priority, source, next_step'],
            ['Coluna status', 'Funil original (Fechado, Contacto inicial…)'],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-white/30 text-[10px] uppercase tracking-wider">{k}</p>
              <p className="text-white font-medium text-xs mt-0.5">{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 bg-amber-900/20 border border-amber-500/30 rounded-xl px-4 py-3 mb-6">
        <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-amber-300/80 text-xs leading-relaxed">
          Esta operação é <strong>irreversível</strong>. Garante que a tabela <code className="bg-amber-900/30 px-1 rounded">leads</code> tem as colunas <code className="bg-amber-900/30 px-1 rounded">assigned_to</code>, <code className="bg-amber-900/30 px-1 rounded">priority</code>, <code className="bg-amber-900/30 px-1 rounded">source</code> e <code className="bg-amber-900/30 px-1 rounded">next_step</code> antes de prosseguir. Corre o SQL da migration primeiro.
        </p>
      </div>

      {/* Progress */}
      {status !== 'idle' && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/50">{progress} / {total} registos</span>
            <span className="text-xs font-bold text-gold">{pct}%</span>
          </div>
          <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gold/60 to-gold rounded-full transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
          {status === 'running' && (
            <p className="text-xs text-white/30 mt-2 text-center">A importar em lotes de {BATCH_SIZE}…</p>
          )}
        </div>
      )}

      {/* Result messages */}
      {status === 'done' && (
        <div className="flex items-center gap-3 bg-green-900/20 border border-green-500/30 rounded-xl px-4 py-4 mb-6">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
          <div>
            <p className="text-green-300 font-bold text-sm">{inserted} registos importados com sucesso!</p>
            <p className="text-green-300/60 text-xs mt-0.5">Podes ver todos os leads no Dashboard.</p>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-start gap-3 bg-red-900/20 border border-red-500/30 rounded-xl px-4 py-4 mb-6">
          <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-300 font-bold text-sm">Erro durante a importação</p>
            <p className="text-red-300/60 text-xs mt-0.5 font-mono">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col gap-3">
        {status !== 'done' && (
          <button
            onClick={runImport}
            disabled={status === 'running'}
            className="w-full h-14 bg-gradient-to-r from-gold to-[#d4c57b] text-[#12121e] font-black text-base rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Upload className="w-5 h-5" />
            {status === 'running' ? `A importar… (${pct}%)` : `Importar ${total} Registos`}
          </button>
        )}
        {status === 'done' && (
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="w-full h-14 bg-gradient-to-r from-gold to-[#d4c57b] text-[#12121e] font-black text-base rounded-xl hover:opacity-90 transition-opacity"
          >
            Ver no Dashboard
          </button>
        )}
        {status === 'error' && (
          <button
            onClick={runImport}
            className="w-full h-12 border border-gold/30 text-gold rounded-xl hover:bg-gold/10 transition-colors font-bold text-sm"
          >
            Tentar novamente
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminImport;
