# treinar.py
#
# @author Ruda Gabriel
# @version 1.0.0
# @changelog
#   1.0.0 - 2026-11-17 - Primeira versão (treino do leitor de códigos por foto).
# Histórico completo das versões: CHANGELOG.md no repositório.
#
# Treina uma rede do zero e exporta em int8. Uso: python3 treinar.py treino.npz <semente> modelo.json [épocas]
# Requer: Python 3, numpy, Pillow e (para treinar) PyTorch. Não é usado pelo sistema em funcionamento.

import numpy as np, torch, torch.nn as nn, torch.nn.functional as F, sys, json, base64, time
torch.set_num_threads(4)
semente = int(sys.argv[2]); saida = sys.argv[3]; epocas = int(sys.argv[4]) if len(sys.argv)>4 else 8
torch.manual_seed(semente); np.random.seed(semente)
d = np.load(sys.argv[1]); X = torch.tensor(d['X'].astype(np.float32)).unsqueeze(1); Y = torch.tensor(d['Y'])
idx = torch.randperm(len(Y)); nval = 6000
Xv, Yv = X[idx[:nval]], Y[idx[:nval]]; Xt, Yt = X[idx[nval:]], Y[idx[nval:]]
class Rede(nn.Module):
    def __init__(s):
        super().__init__()
        s.c1=nn.Conv2d(1,16,3); s.c2=nn.Conv2d(16,32,3); s.d1=nn.Linear(800,64); s.d2=nn.Linear(64,11)
    def forward(s,x):
        x=F.max_pool2d(F.relu(s.c1(x)),2); x=F.max_pool2d(F.relu(s.c2(x)),2)
        x=x.flatten(1); x=F.relu(s.d1(F.dropout(x,0.25,s.training))); return s.d2(F.dropout(x,0.2,s.training))
m=Rede(); opt=torch.optim.Adam(m.parameters(),1e-3); sched=torch.optim.lr_scheduler.OneCycleLR(opt,3e-3,total_steps=epocas*(len(Yt)//256+1))
def aum(x):
    # deslocamento de até 2 px e um pouco de ruído
    dx,dy=np.random.randint(-2,3,2); x=torch.roll(x,(int(dy),int(dx)),(2,3))
    return (x + 0.05*torch.randn_like(x)*(torch.rand(x.shape[0],1,1,1)<0.3)).clamp(0,1)
for ep in range(epocas):
    m.train(); perm=torch.randperm(len(Yt)); t0=time.time()
    for i in range(0,len(Yt),256):
        b=perm[i:i+256]; opt.zero_grad(); loss=F.cross_entropy(m(aum(Xt[b])),Yt[b],label_smoothing=0.05); loss.backward(); opt.step(); sched.step()
    m.eval()
    with torch.no_grad(): acc=(m(Xv).argmax(1)==Yv).float().mean().item()
    print('época',ep+1,'val',round(acc*100,2),'%',round(time.time()-t0),'s', flush=True)
# MNIST teste (formato original) — referência
import os
try:
    pasta=os.path.dirname(os.path.abspath(sys.argv[1]))
    xt=np.fromfile(os.path.join(pasta,'t10k-images-idx3-ubyte'),dtype=np.uint8)[16:].reshape(-1,1,28,28)/255.
    yt=np.fromfile(os.path.join(pasta,'t10k-labels-idx1-ubyte'),dtype=np.uint8)[8:]
    with torch.no_grad(): p=m(torch.tensor(xt,dtype=torch.float32)).argmax(1).numpy()
    print('MNIST teste (original):', round((p==yt).mean()*100,2),'%')
except Exception as e:
    print('MNIST teste não avaliado:', e)
# Exporta em int8 por tensor
tens=[]; dados=bytearray()
for nome,t in [('c1w',m.c1.weight),('c1b',m.c1.bias),('c2w',m.c2.weight),('c2b',m.c2.bias),('d1w',m.d1.weight),('d1b',m.d1.bias),('d2w',m.d2.weight),('d2b',m.d2.bias)]:
    a=t.detach().numpy().astype(np.float64).ravel(); esc=float(np.abs(a).max()/127) or 1e-8
    q=np.clip(np.round(a/esc),-127,127).astype(np.int8); dados+=q.tobytes(); tens.append({'nome':nome,'n':int(a.size),'escala':esc})
json.dump({'tensores':tens,'dados':base64.b64encode(bytes(dados)).decode()},open(saida,'w'))
torch.save(m.state_dict(), saida+'.pt')
print('exportado', saida, len(dados),'bytes')
