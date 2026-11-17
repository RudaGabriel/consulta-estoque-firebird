# treinar_rede.py
#
# @author Ruda Gabriel
# @version 1.0.0
# @changelog
#   1.0.0 - 2026-11-17 - Primeira versão (treino do leitor de códigos por foto).
# Histórico completo das versões: CHANGELOG.md no repositório.
#
# Definição da rede (igual à inferência do ocr-digitos.js), aumento e exportação.
# Requer: Python 3, numpy, Pillow e (para treinar) PyTorch. Não é usado pelo sistema em funcionamento.

import numpy as np, torch, torch.nn as nn, torch.nn.functional as F, json, base64
class Rede(nn.Module):
    def __init__(s):
        super().__init__()
        s.c1=nn.Conv2d(1,16,3); s.c2=nn.Conv2d(16,32,3); s.d1=nn.Linear(800,64); s.d2=nn.Linear(64,11)
    def forward(s,x):
        x=F.max_pool2d(F.relu(s.c1(x)),2); x=F.max_pool2d(F.relu(s.c2(x)),2)
        x=x.flatten(1); x=F.relu(s.d1(F.dropout(x,0.25,s.training))); return s.d2(F.dropout(x,0.2,s.training))
def aum(x):
    dx,dy=np.random.randint(-2,3,2); x=torch.roll(x,(int(dy),int(dx)),(2,3))
    return (x + 0.05*torch.randn_like(x)*(torch.rand(x.shape[0],1,1,1)<0.3)).clamp(0,1)
def exportar(m, saida):
    tens=[]; dados=bytearray()
    for nome,tt in [('c1w',m.c1.weight),('c1b',m.c1.bias),('c2w',m.c2.weight),('c2b',m.c2.bias),('d1w',m.d1.weight),('d1b',m.d1.bias),('d2w',m.d2.weight),('d2b',m.d2.bias)]:
        a=tt.detach().numpy().astype(np.float64).ravel(); esc=float(np.abs(a).max()/127) or 1e-8
        q=np.clip(np.round(a/esc),-127,127).astype(np.int8); dados+=q.tobytes(); tens.append({'nome':nome,'n':int(a.size),'escala':esc})
    json.dump({'tensores':tens,'dados':base64.b64encode(bytes(dados)).decode()},open(saida,'w'))
    torch.save(m.state_dict(), saida+'.pt'); print('exportado', saida)
