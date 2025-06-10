import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
import lightgbm as lgb
import joblib

# Load data
data = pd.read_csv(r'C:\Users\Prakhyath R\Desktop\employee_burnout_analysis-AI.csv')

# Drop rows with missing target
data = data.dropna(subset=['Burn Rate'])

# Create binary target
threshold = data['Burn Rate'].median()
data['Burnout_Binary'] = (data['Burn Rate'] >= threshold).astype(int)

# Standardize column names (remove spaces)
data.columns = data.columns.str.replace(" ", "_")

# Define features
categorical_cols = ['Gender', 'Company_Type', 'WFH_Setup_Available']
numerical_cols = ['Designation', 'Resource_Allocation', 'Mental_Fatigue_Score']
target_col = 'Burnout_Binary'

# Filter features and target
X = data[categorical_cols + numerical_cols]
y = data[target_col]

# Define preprocessing pipeline
preprocessor = ColumnTransformer(
    transformers=[
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_cols),
        ('num', StandardScaler(), numerical_cols)
    ]
)

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Fit preprocessor
preprocessor.fit(X_train)

# Transform features
X_train_transformed = preprocessor.transform(X_train)
X_test_transformed = preprocessor.transform(X_test)

# Train LightGBM
train_data = lgb.Dataset(X_train_transformed, label=y_train)
valid_data = lgb.Dataset(X_test_transformed, label=y_test)

params = {
    'objective': 'binary',
    'boosting_type': 'gbdt',
    'metric': 'binary_logloss',
    'learning_rate': 0.05,
    'num_leaves': 31,
    'verbose': -1
}

model = lgb.train(
    params,
    train_data,
    num_boost_round=1000,
    valid_sets=[valid_data],
    callbacks=[lgb.log_evaluation(100)]
)

# Save model and preprocessor
model.save_model('employee_burnout_model.txt')
joblib.dump(preprocessor, 'preprocessor.pkl')

print("✅ Model and preprocessor saved!")
