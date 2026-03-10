import json

with open('PLANORA-Model/PlanoraNotebook.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

new_code = """# PLANORA User Category Preference Prediction

# Import Libraries
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
import joblib
import os
import matplotlib.pyplot as plt
import seaborn as sns

# Set random seed for reproducibility
np.random.seed(42)

# Step 2: Load or Generate Data
def generate_synthetic_dataset(n_samples=250):
    categories = ['Tech', 'Music', 'Sports', 'Business', 'Education', 'Art', 'Food', 'Health']
    data = {
        'age': np.random.randint(18, 66, n_samples),
        'gender': np.random.choice(['Male', 'Female', 'Other'], n_samples),
        'tech_spend': np.random.randint(1, 6, n_samples),
        'music_freq': np.random.randint(1, 6, n_samples),
        'sports_hours': np.random.randint(1, 6, n_samples),
        'business_interest': np.random.randint(1, 6, n_samples),
        'edu_freq': np.random.randint(1, 6, n_samples),
        'food_interest': np.random.randint(1, 6, n_samples),
        'health_priority': np.random.randint(1, 6, n_samples),
        'preferred_category': np.random.choice(categories, n_samples)
    }
    for i in range(n_samples):
        category = data['preferred_category'][i]
        if category == 'Tech':
            data['tech_spend'][i] = np.random.randint(4, 6)
        elif category == 'Music':
            data['music_freq'][i] = np.random.randint(4, 6)
        elif category == 'Sports':
            data['sports_hours'][i] = np.random.randint(4, 6)
        elif category == 'Business':
            data['business_interest'][i] = np.random.randint(4, 6)
        elif category == 'Education':
            data['edu_freq'][i] = np.random.randint(4, 6)
        elif category == 'Food':
            data['food_interest'][i] = np.random.randint(4, 6)
        elif category == 'Health':
            data['health_priority'][i] = np.random.randint(4, 6)
        elif category == 'Art':
            data['food_interest'][i] = np.random.randint(3, 6)
    return pd.DataFrame(data)

dataset_path = 'user_preferences_dataset.csv'
required_columns = ['age', 'gender', 'tech_spend', 'music_freq', 'sports_hours', 
                    'business_interest', 'edu_freq', 'food_interest', 'health_priority', 
                    'preferred_category']

if os.path.exists(dataset_path):
    df = pd.read_csv(dataset_path)
    missing_cols = [col for col in required_columns if col not in df.columns]
    if missing_cols:
        print(f"Missing columns: {missing_cols}. Generating synthetic dataset.")
        df = generate_synthetic_dataset()
else:
    print("Dataset not found. Generating synthetic dataset.")
    df = generate_synthetic_dataset()

df.to_csv('user_preferences_dataset.csv', index=False)

print("First 5 rows of the dataset:")
print(df.head())
print("\\nMissing values:")
print(df.isnull().sum())

# Step 3: Preprocess Data
X = df.drop('preferred_category', axis=1)
y = df['preferred_category']

le_gender = LabelEncoder()
X['gender'] = le_gender.fit_transform(X['gender'])

le_category = LabelEncoder()
y = le_category.fit_transform(y)

numerical_cols = ['age', 'tech_spend', 'music_freq', 'sports_hours', 
                  'business_interest', 'edu_freq', 'food_interest', 'health_priority']
scaler = StandardScaler()
X[numerical_cols] = scaler.fit_transform(X[numerical_cols])

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("\\nShape of training set:", X_train.shape)
print("Shape of test set:", X_test.shape)

# Step 4: Train Initial Models
model_scores = {}

# Algorithm 1: Random Forest
rf = RandomForestClassifier(random_state=42)
rf.fit(X_train, y_train)
y_pred_rf = rf.predict(X_test)
model_scores['Random Forest'] = accuracy_score(y_test, y_pred_rf)

# Algorithm 2: Gradient Boosting
gb = GradientBoostingClassifier(random_state=42)
gb.fit(X_train, y_train)
y_pred_gb = gb.predict(X_test)
model_scores['Gradient Boosting'] = accuracy_score(y_test, y_pred_gb)

# Visualize Baseline Model Accuracies
plt.figure(figsize=(8, 5))
sns.barplot(x=list(model_scores.keys()), y=list(model_scores.values()), palette='viridis')
plt.title('Baseline Model Accuracies')
plt.ylabel('Accuracy')
plt.ylim(0, 1)
for i, v in enumerate(model_scores.values()):
    plt.text(i, v + 0.02, f"{v:.4f}", ha='center')
plt.show()

# Step 5: Hyperparameter Tuning
rf_params = {
    'n_estimators': [50, 100],
    'max_depth': [None, 10],
    'min_samples_split': [2, 5],
    'min_samples_leaf': [1, 2]
}
rf_grid = GridSearchCV(RandomForestClassifier(random_state=42), rf_params, cv=5, scoring='accuracy')
rf_grid.fit(X_train, y_train)
model_scores['Tuned Random Forest'] = rf_grid.best_score_
print("\\nBest Random Forest Parameters:", rf_grid.best_params_)
print("Best Random Forest CV Accuracy:", rf_grid.best_score_)

gb_params = {
    'n_estimators': [50, 100],
    'learning_rate': [0.01, 0.1],
    'max_depth': [3, 5]
}
gb_grid = GridSearchCV(GradientBoostingClassifier(random_state=42), gb_params, cv=5, scoring='accuracy')
gb_grid.fit(X_train, y_train)
model_scores['Tuned Gradient Boosting'] = gb_grid.best_score_
print("\\nBest Gradient Boosting Parameters:", gb_grid.best_params_)
print("Best Gradient Boosting CV Accuracy:", gb_grid.best_score_)

# Visualize Tuning Impact
tuning_labels = ['Random Forest Baseline', 'Tuned Random Forest', 'GB Baseline', 'Tuned GB']
tuning_scores = [model_scores['Random Forest'], model_scores['Tuned Random Forest'], 
                 model_scores['Gradient Boosting'], model_scores['Tuned Gradient Boosting']]

plt.figure(figsize=(10, 6))
sns.barplot(x=tuning_labels, y=tuning_scores, palette='coolwarm')
plt.title('Model Accuracies: Baseline vs Tuned')
plt.ylabel('Accuracy')
plt.ylim(0, 1)
plt.xticks(rotation=45)
for i, v in enumerate(tuning_scores):
    plt.text(i, v + 0.02, f"{v:.4f}", ha='center')
plt.tight_layout()
plt.show()

# Step 6: Evaluate Best Model
best_model_name = max(model_scores, key=model_scores.get)
print(f"\\nBest Model: {best_model_name} with CV Accuracy: {model_scores[best_model_name]:.4f}")

if best_model_name.startswith('Tuned Random') or best_model_name == 'Random Forest':
    best_model = rf_grid.best_estimator_
else:
    best_model = gb_grid.best_estimator_

y_pred_best = best_model.predict(X_test)

# Confusion Matrix Heatmap
cm = confusion_matrix(y_test, y_pred_best)
plt.figure(figsize=(10, 8))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=le_category.classes_, yticklabels=le_category.classes_)
plt.title(f'Confusion Matrix: {best_model_name}')
plt.xlabel('Predicted')
plt.ylabel('Actual')
plt.show()

print("\\nClassification Report:\\n", classification_report(y_test, y_pred_best, target_names=le_category.classes_))

# Feature Importance Chart
if hasattr(best_model, 'feature_importances_'):
    importances = best_model.feature_importances_
    indices = np.argsort(importances)[::-1]
    features = X.columns
    
    plt.figure(figsize=(10, 6))
    sns.barplot(x=importances[indices], y=[features[i] for i in indices], palette='magma')
    plt.title(f'Feature Importances: {best_model_name}')
    plt.xlabel('Relative Importance')
    plt.tight_layout()
    plt.show()

# Step 7: Save and Predict
joblib.dump(best_model, 'best_category_model.pkl')
joblib.dump(scaler, 'scaler.pkl')
joblib.dump(le_gender, 'le_gender.pkl')
joblib.dump(le_category, 'le_category.pkl')
print("\\nModel and preprocessing objects saved securely for future usages.")

# Scatter Plot Demo
plt.figure(figsize=(8, 6))
sns.scatterplot(x=df['age'], y=df['tech_spend'], hue=df['preferred_category'], palette='Set1', alpha=0.7)
plt.title('Scatter Plot: Age vs Tech Spend by Preferred Category')
plt.show()
"""

lines = [line + '\\n' for line in new_code.split('\\n')]
lines[-1] = lines[-1][:-1]  # remove trailing newline from last line

nb['cells'][0]['source'] = lines
nb['cells'][0]['outputs'] = [] # Clear outputs

with open('PLANORA-Model/PlanoraNotebook.ipynb', 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)
