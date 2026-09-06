import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto('http://localhost:8081/');
await page.waitForLoadState('networkidle');
try { await page.getByText('Aceitar').click({ timeout: 2000 }); } catch {}

const openBtn = page.locator('button', { hasText: 'Agendar limpeza' }).first();
await openBtn.click();
await page.waitForTimeout(500);

await page.getByPlaceholder('A sua cidade...').fill('Porto');
await page.waitForTimeout(600);
await page.getByText('+10€').first().click();
await page.waitForTimeout(500);

// Click "Tapete" service card (4th card, bottom-right of the 2x2 grid)
await page.mouse.click(750, 730);
await page.waitForTimeout(600);

await page.screenshot({ path: '/Users/antoniopeixoto49/Projects/sitekyroclean/.claude/worktrees/kyro-minorder-emdash/.tmp-carpet-empty.png' });

// Fill first carpet row
const numberInputs = page.locator('input[type="number"]');
await numberInputs.nth(0).fill('3');
await numberInputs.nth(1).fill('2');
await page.waitForTimeout(300);

// Add another carpet
await page.getByText('Adicionar outro tapete').click();
await page.waitForTimeout(300);
await numberInputs.nth(2).fill('1.5');
await numberInputs.nth(3).fill('4');
await page.waitForTimeout(300);

await page.screenshot({ path: '/Users/antoniopeixoto49/Projects/sitekyroclean/.claude/worktrees/kyro-minorder-emdash/.tmp-carpet-two-rows.png', fullPage: true });
console.log('done');
await browser.close();
