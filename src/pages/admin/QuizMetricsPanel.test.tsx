import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import QuizMetricsPanel from './QuizMetricsPanel';
const fixtures=vi.hoisted(()=>({events:[] as Record<string,unknown>[],leads:[] as Record<string,unknown>[]}));
vi.mock('./TrackingHealth',()=>({TrackingHealth:()=>null}));
vi.mock('@/integrations/supabase/client',()=>({supabase:{from:(table:string)=>{
 const rows=table==='quiz_events'?fixtures.events:fixtures.leads;
 const query={select:()=>query,gte:()=>query,lt:()=>query,order:()=>query,range:(from:number,to:number)=>Promise.resolve({data:rows.slice(from,to+1),count:rows.length,error:null})};return query;
}}}));
afterEach(cleanup);
it('renders seven submissions rather than twenty-seven completed steps',async()=>{
 const event=(id:string,action:string,step:number,session_id:string)=>({id,action,step,session_id,created_at:new Date().toISOString(),value:59,service:'sofa',city:'Porto',page_path:'/',device:'mobile'});
 fixtures.events=Array.from({length:56},(_,i)=>event(`s${i}`,'start',0,`old${i}`));
 fixtures.events.push(...Array.from({length:20},(_,i)=>event(`q${i}`,'complete',3,`old${i}`)),...Array.from({length:7},(_,i)=>event(`c${i}`,'complete',4,`old${i}`)));
 fixtures.leads=Array.from({length:7},(_,i)=>({id:`lead${i}`,created_at:new Date().toISOString(),service:'Sofás',location:'Porto',source:'Website'}));
 render(<QuizMetricsPanel/>);
 await waitFor(()=>expect(screen.getByText('Submissões registadas').parentElement!.textContent).toContain('7'));
 expect(screen.getByText('Taxa de submissão').parentElement!.textContent).toContain('12.5%');
 expect(screen.getByText('Pedidos recebidos').parentElement!.textContent).toContain('7');
 expect(screen.queryByText('48.2%')).toBeNull();
 expect(screen.getByText(/Esta semana inclui dados anteriores/)).toBeTruthy();
});
