import json

with open('d:/CINEC/project/Planora/PLANORA-Model/PlanoraNotebook.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

for i, line in enumerate(nb['cells'][0]['source'][:10]):
    print(f"Line {i+1}: {repr(line)}")
    print([hex(ord(c)) for c in line])
