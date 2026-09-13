import fs from 'node:fs';
import path from 'node:path';
const failures=[];
const manifest=JSON.parse(fs.readFileSync('dist/.vite/manifest.json','utf8'));
const pageFiles=new Set(Object.values(manifest).filter(entry=>entry.isDynamicEntry).map(entry=>entry.name));
let checked=0;
for(const file of fs.readdirSync('dist').filter(file=>file.endsWith('.html'))){
 const html=fs.readFileSync(path.join('dist',file),'utf8');
 const page=html.match(/name="kyro-route-page" content="([^"]+)"/)?.[1];
 if(page){checked++;if(!pageFiles.has(page))failures.push(`${file}: unknown page ${page}`);}
 if(file!=='index.html'&&/rel="preload" as="image" href="\/images\/hero-sofa/.test(html))failures.push(`${file}: unrelated homepage preload`);
 for(const match of html.matchAll(/<link[^>]+rel="(?:modulepreload|preload)"[^>]+href="(\/[^\"]+)"/g)){
  if(!fs.existsSync(path.join('dist',decodeURIComponent(match[1]))))failures.push(`${file}: missing preload ${match[1]}`);
 }
 if(/<script[^>]+src="https:\/\/www.googletagmanager.com/.test(html))failures.push(`${file}: analytics loaded before consent`);
}
for(const file of fs.readdirSync('dist/assets').filter(file=>file.endsWith('.js'))){
 const js=fs.readFileSync(path.join('dist/assets',file),'utf8');
 if(/(?:quote-sofa-sizes|quote-mattress-sizes|quote-furniture|sofa-cleaning-process-guide)\.png/.test(js))failures.push(`${file}: original PNG in runtime`);
}
console.log(JSON.stringify({checked,failures,totalFailures:failures.length},null,2));
if(failures.length)process.exitCode=1;
