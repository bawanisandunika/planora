import json

nb_path = 'PLANORA-Model/PlanoraNotebook.ipynb'

with open(nb_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

# Create a new markdown/code cell to install matplotlib and seaborn
new_cell = {
    "cell_type": "code",
    "execution_count": None,
    "id": "install_dependencies_cell",
    "metadata": {},
    "outputs": [],
    "source": [
        "!pip install matplotlib seaborn joblib scikit-learn pandas numpy\n"
    ]
}

# Insert at the top
nb['cells'].insert(0, new_cell)

with open(nb_path, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)

print("Successfully injected dependency installation cell to the top of the notebook.")
