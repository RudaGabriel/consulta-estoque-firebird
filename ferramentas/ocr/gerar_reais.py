# gerar_reais.py
#
# @author Ruda Gabriel
# @version 1.0.0
# @changelog
#   1.0.0 - 2026-11-17 - Primeira versão (treino do leitor de códigos por foto).
# Histórico completo das versões: CHANGELOG.md no repositório.
#
# Aumenta os dígitos reais rotulados (saída do rotular.js). Uso: python3 gerar_reais.py reais.json <colunas> <cópias> saida.npz
# Requer: Python 3, numpy, Pillow e (para treinar) PyTorch. Não é usado pelo sistema em funcionamento.

import json, numpy as np, random, sys
from PIL import Image
from multiprocessing import Pool
sys.path.insert(0, '.')
from gerar import recorte28, caixa
def aum(args):
    m, rot, seed = args
    r = random.Random(seed); m = np.array(m, np.uint8)
    if m.sum() < 6: return None
    H = max(m.shape) + 16
    im = Image.new('L', (H*2, H*2), 0); im.paste(Image.fromarray(m*255), (H//2, H//2))
    sh = r.uniform(-0.25, 0.25); im = im.transform(im.size, Image.AFFINE, (1, sh, -sh*H, 0, 1, 0), Image.BILINEAR)
    im = im.rotate(r.uniform(-12, 12), Image.BILINEAR)
    sc = r.uniform(0.75, 1.3); im = im.resize((max(4,int(im.size[0]*sc)), max(4,int(im.size[1]*sc*r.uniform(0.9,1.1)))), Image.BILINEAR)
    a = (np.asarray(im) > r.uniform(90, 170)).astype(np.uint8)
    if r.random() < 0.3:
        q = np.pad(a, 1); acc = np.zeros_like(a)
        for dy in (-1,0,1):
            for dx in (-1,0,1): acc |= q[1+dy:1+dy+a.shape[0], 1+dx:1+dx+a.shape[1]]
        a = acc
    a = caixa(a)
    return None if a is None else (recorte28(a), rot)
if __name__ == '__main__':
    amostras = json.load(open(sys.argv[1])); cols = set(int(c) for c in sys.argv[2].split(',')); copias = int(sys.argv[3])
    sel = [s for s in amostras if s['col'] in cols]
    tarefas = [(s['m'], s['rot'], i*1000+k) for i, s in enumerate(sel) for k in range(copias)]
    with Pool(4) as p: res = [x for x in p.map(aum, tarefas, chunksize=200) if x is not None]
    X = np.stack([x for x,_ in res]).astype(np.float16); Y = np.array([y for _,y in res], np.int64)
    np.savez_compressed(sys.argv[4], X=X, Y=Y); print('reais aumentados', len(Y), np.bincount(Y, minlength=11))
