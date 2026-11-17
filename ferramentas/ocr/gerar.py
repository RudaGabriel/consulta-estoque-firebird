# gerar.py
#
# @author Ruda Gabriel
# @version 1.0.0
# @changelog
#   1.0.0 - 2026-11-17 - Primeira versão (treino do leitor de códigos por foto).
# Histórico completo das versões: CHANGELOG.md no repositório.
#
# Gera o conjunto de treino: MNIST com aumento, "1" em forma de J sintético e exemplos de "não é dígito". Uso: python3 gerar.py <pasta-do-mnist> [cópias]
# Requer: Python 3, numpy, Pillow e (para treinar) PyTorch. Não é usado pelo sistema em funcionamento.

# Gera o conjunto de treino: MNIST (com aumento) + "1" em forma de J + lixo.
# Normalização IDÊNTICA a _recorte28 do ocr-digitos.js.
import numpy as np, sys, math, random
from PIL import Image, ImageDraw
from multiprocessing import Pool

def recorte28(m):
    """m: máscara binária (uint8 0/1) já recortada na caixa do glifo."""
    gh, gw = m.shape
    area = int(m.sum())
    if area == 0: return np.zeros((28,28),np.float32)
    p = np.pad(m,1)
    viz = p[1:-1,:-2] & p[1:-1,2:] & p[:-2,1:-1] & p[2:,1:-1]
    borda = int((m & (1-viz)).sum())
    # bordas da caixa contam como borda (igual ao JS)
    lado = max(gw, gh); esc = 20.0/lado
    esp = (2*area/borda)*esc if borda else 2
    dil = max(0, min(3, int(round((2.3-esp)/(2*esc)))))
    if dil > 0:
        q = np.pad(m, dil); acc = np.zeros_like(m)
        for dy in range(-dil, dil+1):
            for dx in range(-dil, dil+1):
                acc |= q[dil+dy:dil+dy+gh, dil+dx:dil+dx+gw]
        m = acc
    nw = max(1, int(round(gw*esc))); nh = max(1, int(round(gh*esc)))
    peq = np.zeros((nh,nw),np.float32)
    for y in range(nh):
        y0=int(math.floor(y/esc)); y1=int(math.ceil((y+1)/esc))
        for x in range(nw):
            x0=int(math.floor(x/esc)); x1=int(math.ceil((x+1)/esc))
            blk = m[y0:min(y1,gh), x0:min(x1,gw)]
            cnt = (y1-y0)*(x1-x0)
            peq[y,x] = blk.sum()/cnt if cnt else 0
    tot = peq.sum()
    ys, xs = np.mgrid[0:nh,0:nw]
    cx = (peq*xs).sum()/tot if tot else nw/2; cy=(peq*ys).sum()/tot if tot else nh/2
    ox = int(round(14-cx)); oy=int(round(14-cy))
    ox = max(0,min(28-nw,ox)); oy=max(0,min(28-nh,oy))
    out = np.zeros((28,28),np.float32); out[oy:oy+nh, ox:ox+nw] = np.minimum(1,peq)
    return out

def caixa(m):
    ys, xs = np.nonzero(m)
    if not len(ys): return None
    return m[ys.min():ys.max()+1, xs.min():xs.max()+1]

def aumentar_mnist(args):
    img, seed = args
    rng = random.Random(seed)
    H = rng.randint(34, 64)                           # altura "nativa" como na foto
    im = Image.fromarray(img).resize((84,84), Image.BILINEAR)
    ang = rng.uniform(-14,14); sh = rng.uniform(-0.3,0.3); sc = rng.uniform(0.85,1.12)
    im = im.transform((84,84), Image.AFFINE, (1, sh, -sh*42, 0, 1, 0), Image.BILINEAR)
    im = im.rotate(ang, Image.BILINEAR)
    a = np.asarray(im)
    m = (a > rng.uniform(70,150)).astype(np.uint8)
    m = caixa(m)
    if m is None: return None
    f = H / m.shape[0] * sc
    nw = max(2, int(round(m.shape[1]*f))); nh = max(2,int(round(m.shape[0]*f)))
    m = (np.asarray(Image.fromarray(m*255).resize((nw,nh), Image.BILINEAR)) > 127).astype(np.uint8)
    # espessura variável (caneta fina/grossa)
    if rng.random() < 0.35:
        k = rng.choice([1,2]); q=np.pad(m,k); acc=np.zeros_like(m)
        for dy in range(-k,k+1):
            for dx in range(-k,k+1): acc |= q[k+dy:k+dy+m.shape[0], k+dx:k+dx+m.shape[1]]
        m = acc
    m = caixa(m)
    if m is None: return None
    return recorte28(m)

def tracar(pts_list, W, H, larg):
    im = Image.new('L',(W,H),0); d=ImageDraw.Draw(im)
    for pts in pts_list: d.line(pts, fill=255, width=larg, joint='curve')
    return (np.asarray(im)>127).astype(np.uint8)

def um_em_j(seed):
    """'1' manuscrito com gancho embaixo (J) e às vezes bandeirinha em cima."""
    r = random.Random(seed); H = r.randint(36,62); W = int(H*0.9); larg = r.randint(2,5)
    x = W*r.uniform(0.45,0.7); top = H*r.uniform(0.02,0.1); bot = H*r.uniform(0.88,0.98)
    incl = r.uniform(-0.12,0.12)*H
    pts = []
    if r.random() < 0.6:                                   # bandeira no topo
        pts.append([(x - H*r.uniform(0.12,0.3), top + H*r.uniform(0.08,0.2)), (x, top)])
    corpo = [(x, top), (x - incl*0.5, (top+bot)/2), (x - incl, bot - H*0.12)]
    tipo = r.random()
    if tipo < 0.55:                                        # J curvo
        raio = H*r.uniform(0.12,0.25)
        for t in np.linspace(0, math.pi*r.uniform(0.5,0.95), 8):
            corpo.append((x - incl - raio + raio*math.cos(t), bot - H*0.12 + raio*0.8*math.sin(t)))
    elif tipo < 0.85:                                      # pé reto para a esquerda (⅃)
        corpo += [(x - incl, bot), (x - incl - H*r.uniform(0.18,0.35), bot + r.uniform(-2,2))]
    else:                                                  # base dos dois lados
        corpo += [(x - incl, bot)]
        pts.append([(x - incl - H*r.uniform(0.12,0.25), bot), (x - incl + H*r.uniform(0.08,0.2), bot)])
    pts.append(corpo)
    m = caixa(tracar(pts, W, H+4, larg))
    return None if m is None else recorte28(m)

def lixo(seed):
    r = random.Random(seed); H = r.randint(30,60); W=int(H*r.uniform(0.6,1.4)); larg=r.randint(2,5)
    t = r.random(); pts=[]
    if t < 0.25:                                           # traço curto horizontal/diagonal
        y=H*r.uniform(0.3,0.7); pts=[[(W*0.1,y),(W*r.uniform(0.6,0.95), y+r.uniform(-H*0.2,H*0.2))]]
        H2=int(H*0.4)
    elif t < 0.5:                                          # rabisco (número riscado)
        p=[(r.uniform(0,W),r.uniform(0,H)) for _ in range(r.randint(8,18))]; pts=[p]
    elif t < 0.65:                                         # hachura
        for k in range(r.randint(3,7)):
            x0=r.uniform(0,W); pts.append([(x0,0),(x0+r.uniform(-W*0.5,W*0.5),H)])
    elif t < 0.8:                                          # x
        pts=[[(0,0),(W,H)],[(W,0),(0,H)]]
    else:                                                  # mancha / pingo grande
        im=Image.new('L',(W,H),0); d=ImageDraw.Draw(im); d.ellipse([0,0,W-1,H-1],fill=255)
        m=caixa((np.asarray(im)>127).astype(np.uint8)); return None if m is None else recorte28(m)
    m = caixa(tracar(pts, W+6, H+6, larg))
    return None if m is None else recorte28(m)

def ler_idx(caminho, offset):
    return np.fromfile(caminho, dtype=np.uint8)[offset:]

if __name__ == '__main__':
    base = sys.argv[1]; copias = int(sys.argv[2]) if len(sys.argv)>2 else 2
    xi = ler_idx(base+'/train-images-idx3-ubyte',16).reshape(-1,28,28)
    yi = ler_idx(base+'/train-labels-idx1-ubyte',8)
    tarefas = [(xi[i], i*7+c) for c in range(copias) for i in range(len(xi))]
    rot = [int(yi[i]) for c in range(copias) for i in range(len(xi))]
    with Pool(4) as p:
        X = p.map(aumentar_mnist, tarefas, chunksize=500)
        J = p.map(um_em_j, range(1000000, 1000000+18000), chunksize=500)
        L = p.map(lixo, range(2000000, 2000000+22000), chunksize=500)
    xs=[];ys=[]
    for a,l in zip(X,rot):
        if a is not None: xs.append(a); ys.append(l)
    for a in J:
        if a is not None: xs.append(a); ys.append(1)
    for a in L:
        if a is not None: xs.append(a); ys.append(10)
    X=np.stack(xs).astype(np.float16); Y=np.array(ys,np.int64)
    np.savez_compressed(base+'/treino.npz', X=X, Y=Y)
    print('amostras', len(Y), 'por classe', np.bincount(Y))
