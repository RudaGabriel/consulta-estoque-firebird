# ajustar.py
#
# @author Ruda Gabriel
# @version 1.0.0
# @changelog
#   1.0.0 - 2026-11-17 - Primeira versão (treino do leitor de códigos por foto).
# Histórico completo das versões: CHANGELOG.md no repositório.
#
# Ajuste fino de uma rede com dígitos reais. Uso: python3 ajustar.py treino.npz reais.npz modelo.json.pt <semente> saida.json <épocas>
# Requer: Python 3, numpy, Pillow e (para treinar) PyTorch. Não é usado pelo sistema em funcionamento.

# Ajuste fino: parte do modelo base e treina com mistura base + reais.
import numpy as np, torch, torch.nn.functional as F, sys, json, base64, importlib.util
spec = importlib.util.spec_from_file_location('t', sys.argv[0].replace('ajustar.py','treinar_rede.py')); t = importlib.util.module_from_spec(spec); spec.loader.exec_module(t)
torch.manual_seed(int(sys.argv[4])); np.random.seed(int(sys.argv[4]))
base = np.load(sys.argv[1]); reais = np.load(sys.argv[2])
Xb = torch.tensor(base['X'].astype(np.float32)).unsqueeze(1); Yb = torch.tensor(base['Y'])
Xr = torch.tensor(reais['X'].astype(np.float32)).unsqueeze(1); Yr = torch.tensor(reais['Y'])
m = t.Rede(); m.load_state_dict(torch.load(sys.argv[3])); opt = torch.optim.Adam(m.parameters(), 4e-4)
for ep in range(int(sys.argv[6])):
    m.train(); ib = torch.randperm(len(Yb))[:len(Yr)*2]
    X = torch.cat([Xb[ib], Xr]); Y = torch.cat([Yb[ib], Yr]); perm = torch.randperm(len(Y))
    for i in range(0, len(Y), 256):
        b = perm[i:i+256]; opt.zero_grad(); F.cross_entropy(m(t.aum(X[b])), Y[b], label_smoothing=0.05).backward(); opt.step()
    print('época', ep+1, flush=True)
t.exportar(m, sys.argv[5])
