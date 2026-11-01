"""Monta os 15 vídeos 9:16 (sem som) a partir dos pares aprovados do site.
Uso: python3 docs/social/montar-videos.py   (precisa de ffmpeg)"""
import os, subprocess, tempfile, textwrap
R = os.path.dirname(os.path.abspath(__file__))
P = os.path.join(R, '..', '..', 'src', 'assets', 'before-after-pool')
OUT = os.path.join(R, 'videos'); os.makedirs(OUT, exist_ok=True)
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
if not os.path.exists(FONT): FONT = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'
CTA = 'Peça o preço no WhatsApp\nlink na bio'
def a(n): return f'{P}/{n}-antes.webp'
def d(n): return f'{P}/{n}-depois.webp'
V = {
 1: [(a('sofa-01'),'Isto saiu de um sofá\ncom 3 anos.',3),(a('sofa-01'),'Pulverização',3),(a('sofa-01'),'Escovação',3),(d('sofa-01'),'Extração profissional',4),(d('sofa-01'),'Seca em 2 a 5 h',4)],
 2: [(a('sofa-02'),'Espere pela\nsegunda passagem.',3),(a('sofa-02'),'Antes',3),(d('sofa-02'),'Depois',4),(d('sofa-02'),'A cor original voltou',3)],
 3: [(f'{P}/impermeabilizacao-video.mp4','Sofá impermeabilizado',8),(f'{P}/impermeabilizacao-video.mp4','Essencial desde 39€\nPremium desde 79€',7)],
 4: [(f'{P}/impermeabilizacao-video-pepsi.mp4','Isto é tecido.\nNão é plástico.',6),(f'{P}/impermeabilizacao-video-pepsi.mp4','Ideal com crianças\ne animais',5)],
 5: [(a('sofa-04'),'Pare. Já.',2),(a('sofa-04'),'Mito: bicarbonato +\nvinagre limpa o sofá',5),(d('sofa-04'),'Espuma não é limpeza',4),(d('sofa-04'),'Veja primeiro\na etiqueta',3)],
 6: [(a('sofa-05'),'Esta letra\ndecide tudo.',2),(a('sofa-05'),'W  água',3),(a('sofa-05'),'S  solvente',3),(d('sofa-05'),'WS  os dois',3),(d('sofa-05'),'X  sem líquidos',3)],
 7: [(a('sofa-07'),'Limpou e ficou pior?',3),(a('sofa-07'),'Tecido molhado demais\nseca devagar',5),(d('sofa-07'),'A extração tira\na água e a sujidade',5),(d('sofa-07'),'Seca em 2 a 5 h',4)],
 8: [(a('sofa-08'),'Quanto custa limpar\num sofá no Porto?',3),(d('sofa-08'),'1 lugar  49€',3),(d('sofa-08'),'2 lugares  69€',3),(d('sofa-08'),'3 lugares  79€',3),(d('sofa-08'),'Deslocação desde 10€',3)],
 9: [(a('colchao-01'),'Há quanto tempo não\nlimpa o seu colchão?',3),(d('colchao-01'),'Solteiro  59€',3),(d('colchao-01'),'Casal  69€',3),(d('colchao-01'),'King  79€',3),(d('colchao-01'),'Seca em 2 a 5 h',4)],
 10:[(d('sofa-13'),'4.9★  180 avaliações\nGoogle',3),(d('sofa-13'),'"O meu sofá ficou como novo!!\nCom um cheirinho incrível."\nRita',4),(d('colchao-02'),'"O colchão estava muito manchado\ne ficou irreconhecível. Recomendo."\nSofia',4),(d('sofa-14'),'"Ótimo serviço e disponibilidade\ntotal, o sofá além de limpo\nficou como novo"\nSandra',4)],
 11:[(a('cadeiras-01'),'Qual é a que\njá limpámos?',3),(a('cadeiras-01'),'Antes',3),(d('cadeiras-01'),'Depois',3),(d('cadeiras-01'),'Cadeiras desde 12,50€',3)],
 12:[(a('sofa-09'),'Testámos o\ntruque viral.',3),(a('sofa-09'),'Tampa + pano molhado?',4),(a('sofa-09'),'Deixa água no tecido',4),(d('sofa-09'),'Para o resto: extração',5)],
 13:[(a('sofa-10'),'Um dia connosco\nem Braga.',3),(d('sofa-10'),'9h  sofá 3 lugares',3),(d('colchao-03'),'11h  colchão casal',3),(d('cadeiras-02'),'15h  cadeiras',3),(d('cadeiras-02'),'Resposta em menos\nde 5 minutos',3)],
 14:[(a('sofa-11'),'Fim de época\nno Algarve.',3),(a('sofa-11'),'Areia, protetor solar,\nbebidas',5),(d('sofa-11'),'Sofás e colchões\nem todo o Algarve',4),(d('sofa-11'),'Seca em 2 a 5 h',4)],
 15:[(a('sofa-14'),'Limpar e proteger,\nna mesma visita.',3),(d('sofa-14'),'Limpeza + impermeabilização\nEssencial desde 79€',6),(d('sofa-14'),'Limpo hoje,\nfácil de manter amanhã',5)],
}
W,H=1080,1920
def seg(src,text,sec,out,tmp):
    tf=os.path.join(tmp,'t.txt'); open(tf,'w').write(text)
    vid=src.endswith('.mp4')
    inp=(['-stream_loop','-1','-i',src] if vid else ['-loop','1','-i',src])
    zoom='' if vid else f",zoompan=z='min(zoom+0.0008,1.08)':d={sec*30}:s={W}x{H}:fps=30"
    fc=(f"[0:v]split[a][b];[a]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},boxblur=30[bg];"
        f"[b]scale={W}:-2[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2{zoom},"
        f"drawtext=fontfile='{FONT}':textfile='{tf}':fontsize=64:fontcolor=white:line_spacing=14:"
        f"box=1:boxcolor=black@0.55:boxborderw=28:x=(w-text_w)/2:y=h*0.16,"
        f"drawtext=fontfile='{FONT}':text='KYRO CLEAN':fontsize=40:fontcolor=0xD4AF37:x=(w-text_w)/2:y=h-180,format=yuv420p[v]")
    subprocess.run(['ffmpeg','-y','-loglevel','error',*inp,'-t',str(sec),'-filter_complex',fc,'-map','[v]','-r','30','-c:v','libx264','-preset','veryfast','-crf','22',out],check=True)
for n,parts in V.items():
    with tempfile.TemporaryDirectory() as tmp:
        parts=parts+[(parts[-1][0],CTA,3)]
        files=[]
        for i,(s,t,sec) in enumerate(parts):
            f=os.path.join(tmp,f'{i}.mp4'); seg(s,t,sec,f,tmp); files.append(f)
        lst=os.path.join(tmp,'l.txt'); open(lst,'w').write(''.join(f"file '{f}'\n" for f in files))
        o=os.path.join(OUT,f'{n:02d}.mp4')
        subprocess.run(['ffmpeg','-y','-loglevel','error','-f','concat','-safe','0','-i',lst,'-c','copy',o],check=True)
        print('feito',o)
