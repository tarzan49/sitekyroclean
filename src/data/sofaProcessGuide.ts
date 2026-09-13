import { DRYING_PROMISE } from '../constants/commercialPolicy';
export const SOFA_PROCESS_IMAGE = '/images/services/sofa-cleaning-process-guide.png';
export const SOFA_PROCESS_STEPS = [
  { label: 'Avaliação', title: 'Primeiro, conhecemos o tecido.', description: 'Observamos o material, as manchas e o estado do sofá para escolher o tratamento adequado.', y: 170, height: 210, alt: 'Inspeção do tecido e das costuras do sofá' },
  { label: 'Aplicação', title: 'O produto certo, no sítio certo.', description: 'Aplicamos o produto adequado ao tecido e às zonas que precisam de tratamento.', y: 395, height: 222, alt: 'Aplicação de produto no tecido com um pulverizador' },
  { label: 'Escovação', title: 'Soltamos a sujidade das fibras.', description: 'Escovamos o tecido para distribuir o produto e ajudar a desprender a sujidade.', y: 632, height: 225, alt: 'Escovação suave do tecido do sofá' },
  { label: 'Extração', title: 'Retiramos a sujidade e a água.', description: 'O equipamento de extração aspira a sujidade e a água do tecido, reduzindo a humidade que fica no sofá.', y: 875, height: 230, alt: 'Extração da água e sujidade com um bocal de estofos' },
  { label: 'Secagem', title: 'Depois, é deixar o tecido secar.', description: `${DRYING_PROMISE} Use o sofá apenas quando estiver completamente seco.`, y: 1124, height: 270, alt: 'Sofá junto de uma janela aberta durante a secagem' },
];
