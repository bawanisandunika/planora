from flask import Flask, request, jsonify
from flask_cors import CORS
from pathlib import Path
import pandas as pd
import numpy as np
import joblib
import json
import urllib.request
from urllib.error import HTTPError, URLError
from datetime import datetime

# Initialize Flask app
app = Flask(__name__)
BASE_DIR = Path(__file__).resolve().parent

# Configure CORS
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# Load saved objects — matching exactly what the notebook saves
try:
    model = joblib.load(BASE_DIR / 'best_category_model.pkl')
    preprocessor = joblib.load(BASE_DIR / 'preprocessor.pkl')        # ColumnTransformer (StandardScaler + OneHotEncoder)
    selector = joblib.load(BASE_DIR / 'feature_selector.pkl')        # SelectKBest
    label_encoder = joblib.load(BASE_DIR / 'label_encoder.pkl')      # LabelEncoder for target categories
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


def fetch_external_json(url: str, timeout: int = 8):
    try:
        request_obj = urllib.request.Request(url, headers={"Accept": "application/json"})
        with urllib.request.urlopen(request_obj, timeout=timeout) as response:
            return json.loads(response.read().decode('utf-8'))
    except HTTPError as e:
        raise Exception(f"HTTP error fetching {url}: {e.code} {e.reason}")
    except URLError as e:
        raise Exception(f"URL error fetching {url}: {e.reason}")
    except Exception as e:
        raise Exception(f"Error fetching {url}: {str(e)}")

def get_events_from_main_api():
    events = fetch_external_json('http://localhost:5000/api/events')
    if isinstance(events, dict) and 'data' in events:
        events = events['data']
    return events or []

def get_user_data(user_id):
    if not user_id:
        return None
    try:
        return fetch_external_json(f'http://localhost:5000/api/users/rec/{user_id}')
    except Exception as e:
        print(f"⚠️ Could not fetch user {user_id}: {e}")
        return None

def build_profile_probabilities(profile):
    if not profile:
        return {}

    required_fields = ['age', 'gender', 'tech_spend', 'music_freq', 'sports_hours',
                       'business_interest', 'edu_freq', 'food_interest', 'health_priority']
    if not all(field in profile for field in required_fields):
        return {}

    try:
        input_df = pd.DataFrame([{
            'age': float(profile['age']),
            'gender': profile['gender'],
            'tech_spend': float(profile['tech_spend']),
            'music_freq': float(profile['music_freq']),
            'sports_hours': float(profile['sports_hours']),
            'business_interest': float(profile['business_interest']),
            'edu_freq': float(profile['edu_freq']),
            'food_interest': float(profile['food_interest']),
            'health_priority': float(profile['health_priority'])
        }])
        input_preprocessed = preprocessor.transform(input_df)
        input_selected = selector.transform(input_preprocessed)
        probabilities = model.predict_proba(input_selected)[0]
        return dict(zip(label_encoder.classes_, probabilities.tolist()))
    except Exception as e:
        print(f"⚠️ Could not compute profile probabilities: {e}")
        return {}

def score_recommendations(events, preference=None, category_probabilities=None):
    if not events:
        return []

    max_capacity = max((float(event.get('capacity') or 0) for event in events), default=1.0) or 1.0
    now = datetime.utcnow().date()
    scored = []

    for event in events:
        category = (event.get('category') or '').strip()
        if not category:
            continue

        score = 0.0
        if preference and category.lower() == preference.strip().lower():
            score += 2.2

        category_prob = float(category_probabilities.get(category, 0.0)) if category_probabilities else 0.0
        score += category_prob * 1.4

        score += (float(event.get('capacity') or 0) / max_capacity) * 0.7

        date_str = event.get('date')
        if date_str:
            try:
                event_date = datetime.fromisoformat(date_str).date()
            except ValueError:
                try:
                    event_date = datetime.strptime(date_str, '%Y-%m-%d').date()
                except ValueError:
                    event_date = None

            if event_date:
                delta_days = (event_date - now).days
                if delta_days >= 0:
                    score += 0.8 / (1 + delta_days)
                else:
                    score -= 0.3

        scored.append((score, event))

    scored.sort(key=lambda item: item[0], reverse=True)
    return [event for _, event in scored]


@app.route('/recommendations', methods=['POST', 'OPTIONS'])
def recommendations():
    if request.method == 'OPTIONS':
        return '', 204

    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400

        user_id = data.get('userId')
        preference = data.get('preference')
        profile = data.get('profile') or {}

        user_data = get_user_data(user_id)
        if not preference and user_data:
            preference = user_data.get('preference')

        if not profile and user_data:
            profile = {key: user_data.get(key) for key in ['age', 'gender', 'tech_spend', 'music_freq',
                                                           'sports_hours', 'business_interest', 'edu_freq',
                                                           'food_interest', 'health_priority'] if key in user_data}

        category_probabilities = build_profile_probabilities(profile)
        events = get_events_from_main_api()

        recommendations_list = score_recommendations(events, preference=preference, category_probabilities=category_probabilities)
        top_recommendations = recommendations_list[:6]

        return jsonify({
            'recommendations': top_recommendations,
            'preference': preference,
            'probabilities': category_probabilities
        })
    except Exception as e:
        print(f"❌ Recommendation error: {e}")
        return jsonify({'error': str(e)}), 500


def get_all_users_for_analytics(token: str = None):
    """Fetch all users from the Node API for analytics processing."""
    try:
        url = 'http://localhost:5000/api/users/analytics'
        req_obj = urllib.request.Request(
            url,
            headers={
                'Accept': 'application/json',
                'Authorization': f'Bearer {token}' if token else ''
            }
        )
        with urllib.request.urlopen(req_obj, timeout=10) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"⚠️ Could not fetch users for analytics: {e}")
        return []


def get_events_for_analytics():
    """Fetch all events from the Node API for analytics."""
    try:
        events = fetch_external_json('http://localhost:5000/api/events/admin')
        if isinstance(events, dict) and 'data' in events:
            events = events['data']
        return events or []
    except Exception as e:
        print(f"⚠️ Could not fetch events for analytics: {e}")
        return []


@app.route('/analytics/segmentation', methods=['GET', 'OPTIONS'])
def analytics_segmentation():
    """
    ML-powered admin analytics endpoint.
    Fetches all users, runs batch predictions, and returns:
      - Category distribution across all users
      - Engagement risk scores
      - Monthly join trends
      - Event category breakdown
      - Top predicted categories
    """
    if request.method == 'OPTIONS':
        return '', 204

    try:
        # Forward the admin's JWT token to the Node API
        auth_header = request.headers.get('Authorization', '')
        token = auth_header.replace('Bearer ', '').strip() if auth_header else None

        users = get_all_users_for_analytics(token=token)
        events = get_events_for_analytics()

        CATEGORIES = ['Tech', 'Music', 'Sports', 'Business', 'Education', 'Art', 'Food', 'Health']

        # --- Category distribution via ML model predictions ---
        category_counts = {cat: 0 for cat in CATEGORIES}
        engagement_risk = {'low': 0, 'medium': 0, 'high': 0}
        predicted_users_count = 0
        preference_set_count = 0
        gender_distribution = {'Male': 0, 'Female': 0, 'Other': 0, 'Unknown': 0}
        age_groups = {'18-25': 0, '26-35': 0, '36-45': 0, '46-55': 0, '56+': 0}

        profile_fields = ['age', 'gender', 'tech_spend', 'music_freq', 'sports_hours',
                          'business_interest', 'edu_freq', 'food_interest', 'health_priority']

        for user in users:
            # Gender distribution
            gender = user.get('gender', 'Unknown') or 'Unknown'
            if gender in gender_distribution:
                gender_distribution[gender] += 1
            else:
                gender_distribution['Unknown'] += 1

            # Age group distribution
            age = user.get('age')
            if age is not None:
                try:
                    age = int(age)
                    if 18 <= age <= 25:
                        age_groups['18-25'] += 1
                    elif 26 <= age <= 35:
                        age_groups['26-35'] += 1
                    elif 36 <= age <= 45:
                        age_groups['36-45'] += 1
                    elif 46 <= age <= 55:
                        age_groups['46-55'] += 1
                    else:
                        age_groups['56+'] += 1
                except (ValueError, TypeError):
                    pass

            # Preference set
            if user.get('preference'):
                preference_set_count += 1
                pref = user['preference']
                if pref in category_counts:
                    category_counts[pref] += 1

            # ML prediction for users with full profile
            has_full_profile = all(
                user.get(field) is not None and user.get(field) != ''
                for field in profile_fields
            )

            if has_full_profile:
                try:
                    input_df = pd.DataFrame([{
                        'age': float(user['age']),
                        'gender': str(user['gender']),
                        'tech_spend': float(user['tech_spend']),
                        'music_freq': float(user['music_freq']),
                        'sports_hours': float(user['sports_hours']),
                        'business_interest': float(user['business_interest']),
                        'edu_freq': float(user['edu_freq']),
                        'food_interest': float(user['food_interest']),
                        'health_priority': float(user['health_priority'])
                    }])

                    input_preprocessed = preprocessor.transform(input_df)
                    input_selected = selector.transform(input_preprocessed)
                    probabilities = model.predict_proba(input_selected)[0]
                    prob_dict = dict(zip(label_encoder.classes_, probabilities.tolist()))

                    predicted_cat = max(prob_dict, key=prob_dict.get)
                    max_prob = prob_dict[predicted_cat]

                    # Count category from ML if no explicit preference set
                    if not user.get('preference'):
                        if predicted_cat in category_counts:
                            category_counts[predicted_cat] += 1

                    predicted_users_count += 1

                    # Engagement risk: spread of probabilities indicates certainty
                    # High spread = clear interest = low risk; low spread = confused = high risk
                    prob_values = sorted(probabilities, reverse=True)
                    top_gap = prob_values[0] - prob_values[1] if len(prob_values) > 1 else 0
                    if max_prob >= 0.40 and top_gap >= 0.15:
                        engagement_risk['low'] += 1
                    elif max_prob >= 0.25:
                        engagement_risk['medium'] += 1
                    else:
                        engagement_risk['high'] += 1

                except Exception as e:
                    print(f"⚠️ Prediction failed for user {user.get('id')}: {e}")

        # --- Monthly join trends (last 6 months) ---
        from collections import defaultdict
        import calendar

        monthly_joins = defaultdict(int)
        now = datetime.utcnow()
        months_back = 6

        for user in users:
            created_at = user.get('created_at')
            if created_at:
                try:
                    dt = datetime.fromisoformat(str(created_at).replace('Z', '+00:00'))
                    month_key = dt.strftime('%Y-%m')
                    monthly_joins[month_key] += 1
                except (ValueError, TypeError):
                    pass

        # Build last 6 months timeline
        monthly_trend = []
        for i in range(months_back - 1, -1, -1):
            month_dt = datetime(now.year, now.month, 1) - pd.DateOffset(months=i)
            month_key = month_dt.strftime('%Y-%m')
            month_label = month_dt.strftime('%b %Y')
            monthly_trend.append({
                'month': month_label,
                'users': monthly_joins.get(month_key, 0)
            })

        # --- Event category breakdown ---
        event_category_counts = {cat: 0 for cat in CATEGORIES}
        event_registrations = {}

        for event in events:
            cat = event.get('category', '')
            if cat in event_category_counts:
                event_category_counts[cat] += 1

        # --- Build top predicted categories chart data ---
        category_chart = [
            {'category': cat, 'users': count, 'percentage': round((count / max(len(users), 1)) * 100, 1)}
            for cat, count in sorted(category_counts.items(), key=lambda x: x[1], reverse=True)
            if count > 0
        ]

        # --- Engagement risk chart data ---
        total_risk_users = sum(engagement_risk.values())
        engagement_chart = [
            {
                'level': 'Low Risk',
                'count': engagement_risk['low'],
                'percentage': round((engagement_risk['low'] / max(total_risk_users, 1)) * 100, 1),
                'color': '#10B981'
            },
            {
                'level': 'Medium Risk',
                'count': engagement_risk['medium'],
                'percentage': round((engagement_risk['medium'] / max(total_risk_users, 1)) * 100, 1),
                'color': '#F59E0B'
            },
            {
                'level': 'High Risk',
                'count': engagement_risk['high'],
                'percentage': round((engagement_risk['high'] / max(total_risk_users, 1)) * 100, 1),
                'color': '#EF4444'
            }
        ]

        # --- Age group chart ---
        age_chart = [
            {'group': group, 'count': count}
            for group, count in age_groups.items()
        ]

        # --- Gender chart ---
        gender_chart = [
            {'gender': g, 'count': c}
            for g, c in gender_distribution.items()
            if c > 0
        ]

        # --- Event vs User category match ---
        category_match = []
        for cat in CATEGORIES:
            user_count = category_counts.get(cat, 0)
            event_count = event_category_counts.get(cat, 0)
            if user_count > 0 or event_count > 0:
                category_match.append({
                    'category': cat,
                    'users': user_count,
                    'events': event_count
                })

        return jsonify({
            'summary': {
                'total_users_analyzed': len(users),
                'users_with_ml_prediction': predicted_users_count,
                'users_with_preference_set': preference_set_count,
                'total_events': len(events)
            },
            'category_distribution': category_chart,
            'engagement_risk': engagement_chart,
            'monthly_trend': monthly_trend,
            'age_distribution': age_chart,
            'gender_distribution': gender_chart,
            'category_match': category_match
        })

    except Exception as e:
        print(f"❌ Analytics error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
