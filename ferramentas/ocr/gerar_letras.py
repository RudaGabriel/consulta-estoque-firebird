# gerar_letras.py
#
# @author Ruda Gabriel
# @version 1.0.0
# @changelog
#   1.0.0 - 2026-11-17 - Primeira versão: letras (em pé e deitadas) como classe "não é número".
# Histórico completo das versões: CHANGELOG.md no repositório.
#
# Uso: python3 gerar_letras.py saida.npz <quantidade>
# Requer: Python 3, numpy e Pillow, e fontes .ttf em /usr/share/fonts. Não é usado pelo sistema em funcionamento.

# Gera exemplos de LETRAS (classe 10, "não é número"), em pé e deitadas, com
# deformações que imitam escrita à mão. Letras parecidas com números ficam de fora.
import numpy as np, random, sys, glob
from PIL import Image, ImageDraw, ImageFont
from multiprocessing import Pool
sys.path.insert(0, '.')
from gerar import recorte28, caixa
EM_PE = list("ACEFHKMNPRUVWXYacefhkmnprtuvwxy")
DEITADAS = list("AEHKMWXFRY")           # girar estas não forma número
FONTES = [f for f in glob.glob('/usr/share/fonts/**/*.ttf', recursive=True) if 'Emoji' not in f and 'IPA' not in f]
def letra(seed):
    r = random.Random(seed)
    ch = r.choice(EM_PE + DEITADAS * 2)
    fonte = ImageFont.truetype(r.choice(FONTES), r.randint(40, 70))
    im = Image.new('L', (140, 140), 0); d = ImageDraw.Draw(im)
    d.text((30, 20), ch, fill=255, font=fonte, stroke_width=r.choice([0, 0, 1, 2]), stroke_fill=255)
    if ch in DEITADAS and r.random() < 0.6: im = im.rotate(r.choice([90, -90, 180]), expand=False)
    sh = r.uniform(-0.3, 0.3); im = im.transform(im.size, Image.AFFINE, (1, sh, -sh * 70, 0, 1, 0), Image.BILINEAR)
    im = im.rotate(r.uniform(-12, 12), Image.BILINEAR)
    a = (np.asarray(im) > r.uniform(80, 170)).astype(np.uint8)
    a = caixa(a)
    return None if a is None or a.sum() < 15 else recorte28(a)
if __name__ == '__main__':
    n = int(sys.argv[2])
    with Pool(4) as p: X = [x for x in p.map(letra, range(5000000, 5000000 + n), chunksize=300) if x is not None]
    X = np.stack(X).astype(np.float16); Y = np.full(len(X), 10, np.int64)
    np.savez_compressed(sys.argv[1], X=X, Y=Y); print('letras', len(X))
