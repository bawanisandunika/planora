import json

with open('d:/CINEC/project/Planora/PLANORA-Model/PlanoraNotebook.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

for i, cell in enumerate(nb.get('cells', [])):
    if cell['cell_type'] == 'code':
        source = "".join(cell['source'])
        print(f"--- Cell {i} ---")
        try:
            compile(source, f"<cell {i}>", "exec")
        except SyntaxError as e:
            print(f"SyntaxError in cell {i}: {e}")
            print(f"Line {e.lineno}: {e.text}")
            print(f"Offset: {e.offset}")
