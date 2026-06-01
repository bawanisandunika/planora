"""Run training and then launch the Flask app in one command."""
import sys
from pathlib import Path

# Ensure local PLANORA-Model imports work when call from project root
MODEL_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(MODEL_DIR))

from run_train import train_app_model

if __name__ == '__main__':
    print('Training category prediction model for app...')
    train_app_model()
    print('\nStarting Flask app...')
    import app as flask_app_module

    flask_app_module.app.run(host='0.0.0.0', port=5001, debug=False, use_reloader=False)
