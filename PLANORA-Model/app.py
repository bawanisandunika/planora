from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib

# Initialize Flask app
app = Flask(__name__)

# Configure CORS
CORS(app, resources={
    r"/predict": {
        "origins": ["http://localhost:5173"],
        "methods": ["POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    },
    r"/": {
        "origins": ["http://localhost:5173"],
        "methods": ["GET", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Load saved objects — matching exactly what the notebook saves
try:
    model = joblib.load('best_category_model.pkl')
    preprocessor = joblib.load('preprocessor.pkl')        # ColumnTransformer (StandardScaler + OneHotEncoder)
    selector = joblib.load('feature_selector.pkl')        # SelectKBest
    label_encoder = joblib.load('label_encoder.pkl')      # LabelEncoder for target categories
    print("✅ All model files loaded successfully!")
except Exception as e:
    print(f"❌ Error loading model files: {e}")
    exit(1)

# Logging for debugging
@app.before_request
def log_request():
    print(f"[{request.method}] {request.url} from {request.headers.get('Origin')}")

@app.route('/')
def home():
    return jsonify({'message': 'Flask Prediction API'})

@app.route('/predict', methods=['POST', 'OPTIONS'])
def predict():
    if request.method == 'OPTIONS':
        print("Handling OPTIONS request for /predict")
        return '', 204

    try:
        # Get JSON data
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400

        # Validate required fields
        required_fields = ['age', 'gender', 'tech_spend', 'music_freq', 'sports_hours',
                           'business_interest', 'edu_freq', 'food_interest', 'health_priority']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing field: {field}'}), 400

        # Validate gender value
        valid_genders = ['Male', 'Female', 'Other']
        if data['gender'] not in valid_genders:
            return jsonify({'error': f"Invalid gender. Must be one of: {valid_genders}"}), 400

        # Build input DataFrame — column order must match the notebook exactly
        # numerical_cols first, then categorical_cols (matches ColumnTransformer order)
        input_df = pd.DataFrame([{
            'age': float(data['age']),
            'gender': data['gender'],
            'tech_spend': float(data['tech_spend']),
            'music_freq': float(data['music_freq']),
            'sports_hours': float(data['sports_hours']),
            'business_interest': float(data['business_interest']),
            'edu_freq': float(data['edu_freq']),
            'food_interest': float(data['food_interest']),
            'health_priority': float(data['health_priority'])
        }])

        # Step 1: Apply preprocessor (StandardScaler + OneHotEncoder)
        # This expands 9 raw features → 10 features (8 numerical + 2 from OneHotEncoder on gender with drop='first')
        input_preprocessed = preprocessor.transform(input_df)

        # Step 2: Apply feature selector (SelectKBest)
        input_selected = selector.transform(input_preprocessed)

        # Step 3: Predict
        prediction = model.predict(input_selected)[0]
        probabilities = model.predict_proba(input_selected)[0]

        # Step 4: Decode prediction
        predicted_category = label_encoder.inverse_transform([prediction])[0]
        prob_dict = dict(zip(label_encoder.classes_, probabilities.tolist()))

        # Sort probabilities descending
        sorted_probs = dict(sorted(prob_dict.items(), key=lambda x: x[1], reverse=True))

        return jsonify({
            'prediction': predicted_category,
            'probabilities': sorted_probs
        })

    except KeyError as e:
        return jsonify({'error': f'Missing field: {str(e)}'}), 400
    except Exception as e:
        print(f"❌ Prediction error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)