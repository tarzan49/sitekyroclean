import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import MarketingPanel from './MarketingPanel';

const mocks = vi.hoisted(() => ({ failed: false, rpc: vi.fn() }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: {
  from(table: string) {
    const date = new Date().toISOString();
    const leads = ['google', 'meta', 'organic'].map(platform => ({id:platform, lead_id:`L-${platform}`,name:`Cliente ${platform}`,created_at:date,service:'Sofá',location:'Lisboa',funnel_status:'NEW'}));
    const attrs = ['google','meta','organic'].map(platform => ({lead_id:`L-${platform}`, lead_row_id:platform, last_source:platform === 'organic' ? 'facebook' : platform,last_medium:platform === 'organic' ? 'social' : 'cpc',is_paid:platform !== 'organic',channel:'form'}));
    const data = table === 'leads' ? leads : table === 'lead_attribution' ? attrs : [];
    const result = {data,error:mocks.failed ? {message:'Unavailable'} : null,count:data.length};
    const query: Record<string, unknown> = { then: (resolve: (r: unknown) => unknown) => Promise.resolve(result).then(resolve) };
    for (const method of ['select','gte','lte','eq','order','range','in']) query[method] = () => query;
    return query;
  }, rpc: mocks.rpc,
} }));
afterEach(() => { cleanup(); mocks.failed = false; });
describe('painéis de marketing', () => {
  it('Meta mostra apenas os pedidos Meta, sem ferramentas de exportação Google', async () => {
    render(<MarketingPanel platform="meta" />);
    await screen.findByRole('button',{name:'Cliente meta'});
    expect(screen.queryByRole('button',{name:'Cliente google'})).toBeNull();
    expect(screen.queryByRole('button',{name:'Cliente organic'})).toBeNull();
    expect(screen.queryByText(/Clientes por exportar/)).toBeNull();
    fireEvent.click(screen.getByRole('button',{name:'Registar pedido real'}));
    expect(screen.getByRole('dialog').textContent).toContain('Registar pedido de Meta Ads');
    expect(screen.getByRole('dialog').textContent).toContain('não envia conversões');
  });
  it('Google exclui Meta e mostra ferramentas Google', async () => {
    render(<MarketingPanel platform="google" />);
    await screen.findByRole('button',{name:'Cliente google'});
    expect(screen.queryByRole('button',{name:'Cliente meta'})).toBeNull();
    expect(screen.getByRole('button',{name:/Clientes por exportar/})).toBeTruthy();
  });
  it('uma leitura falhada é apresentada como dados incompletos', async () => {
    mocks.failed = true; render(<MarketingPanel platform="meta" />);
    await waitFor(() => expect(screen.getByText(/Leituras que falharam/)).toBeTruthy());
    expect(screen.queryByRole('button',{name:'Cliente meta'})).toBeNull();
  });
});
