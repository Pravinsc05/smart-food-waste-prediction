"""
Smart Food Waste Prediction & Dynamic Discount Recommendation System
Machine Learning Training Pipeline
====================================================================
Trains a Random Forest Regressor to predict expected unsold food quantities
prior to expiry, benchmarked against a Baseline model.
Exports trained pipeline and evaluation metrics via Joblib and JSON.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score

FEATURE_COLUMNS_CATEGORICAL = ['category', 'historical_demand', 'seasonality', 'day_of_week']
FEATURE_COLUMNS_NUMERIC = ['stock_quantity', 'avg_daily_sales', 'days_until_expiry', 'selling_price', 'cost_price', 'freshness_score']
ALL_FEATURES = FEATURE_COLUMNS_CATEGORICAL + FEATURE_COLUMNS_NUMERIC
TARGET_COLUMN = 'unsold_quantity'

def train_and_evaluate(
    data_path='ml/data/food_waste_dataset.csv',
    model_dir='ml/models',
    random_state=42
):
    os.makedirs(model_dir, exist_ok=True)
    
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Dataset not found at {data_path}. Run generate_dataset.py first.")
        
    print(f"Loading training data from {data_path}...")
    df = pd.read_csv(data_path)
    
    # Verify no missing values in feature set
    df = df.dropna(subset=ALL_FEATURES + [TARGET_COLUMN])
    
    X = df[ALL_FEATURES]
    y = df[TARGET_COLUMN]
    
    # Split train/test (80/20) with seed
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=random_state
    )
    print(f"Training set: {len(X_train)} samples | Test set: {len(X_test)} samples")
    
    # Build Preprocessing Transformer
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), FEATURE_COLUMNS_CATEGORICAL),
            ('num', StandardScaler(), FEATURE_COLUMNS_NUMERIC)
        ],
        remainder='drop'
    )
    
    # 1. Baseline Model (Linear Regression)
    baseline_pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('regressor', LinearRegression())
    ])
    baseline_pipeline.fit(X_train, y_train)
    y_pred_base = np.clip(baseline_pipeline.predict(X_test), 0, None)
    
    base_mae = mean_absolute_error(y_test, y_pred_base)
    base_rmse = root_mean_squared_error(y_test, y_pred_base)
    base_r2 = r2_score(y_test, y_pred_base)
    
    # 2. Random Forest Regressor (Ensemble Model)
    rf_regressor = RandomForestRegressor(
        n_estimators=120,
        max_depth=14,
        min_samples_split=4,
        min_samples_leaf=2,
        random_state=random_state,
        n_jobs=1
    )
    
    rf_pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('regressor', rf_regressor)
    ])
    
    print("Fitting Random Forest Regressor pipeline...")
    rf_pipeline.fit(X_train, y_train)
    y_pred_rf = np.clip(rf_pipeline.predict(X_test), 0, None)
    
    rf_mae = mean_absolute_error(y_test, y_pred_rf)
    rf_rmse = root_mean_squared_error(y_test, y_pred_rf)
    rf_r2 = r2_score(y_test, y_pred_rf)
    
    print("\n--- MODEL PERFORMANCE EVALUATION ---")
    print(f"Baseline (Linear Regression): MAE = {base_mae:.2f} | RMSE = {base_rmse:.2f} | R² = {base_r2:.4f}")
    print(f"Random Forest Regressor:     MAE = {rf_mae:.2f} | RMSE = {rf_rmse:.2f} | R² = {rf_r2:.4f}")
    improvement_mae = ((base_mae - rf_mae) / base_mae) * 100.0
    print(f"Random Forest MAE Error Reduction: {improvement_mae:.1f}%")
    
    # Extract Feature Importances
    preprocessor_fitted = rf_pipeline.named_steps['preprocessor']
    cat_feature_names = preprocessor_fitted.named_transformers_['cat'].get_feature_names_out(FEATURE_COLUMNS_CATEGORICAL).tolist()
    all_feature_names = cat_feature_names + FEATURE_COLUMNS_NUMERIC
    importances = rf_pipeline.named_steps['regressor'].feature_importances_
    
    feature_importance_list = [
        {'feature': name, 'importance': round(float(imp) * 100.0, 2)}
        for name, imp in zip(all_feature_names, importances)
    ]
    feature_importance_list.sort(key=lambda x: x['importance'], reverse=True)
    
    # Save Pipeline to Disk
    model_path = os.path.join(model_dir, 'waste_predictor.joblib')
    joblib.dump(rf_pipeline, model_path)
    print(f"\nModel pipeline saved to: {model_path}")
    
    # Save Evaluation Metrics & Metadata to JSON
    metrics_data = {
        'model_name': 'Random Forest Regressor',
        'baseline_model_name': 'Linear Regression Baseline',
        'train_samples': len(X_train),
        'test_samples': len(X_test),
        'metrics': {
            'random_forest': {
                'mae': round(float(rf_mae), 2),
                'rmse': round(float(rf_rmse), 2),
                'r2_score': round(float(rf_r2), 4)
            },
            'baseline': {
                'mae': round(float(base_mae), 2),
                'rmse': round(float(base_rmse), 2),
                'r2_score': round(float(base_r2), 4)
            },
            'improvement_percent': round(float(improvement_mae), 1)
        },
        'hyperparameters': {
            'n_estimators': 120,
            'max_depth': 14,
            'min_samples_split': 4,
            'min_samples_leaf': 2,
            'random_state': random_state
        },
        'feature_columns': {
            'categorical': FEATURE_COLUMNS_CATEGORICAL,
            'numeric': FEATURE_COLUMNS_NUMERIC
        },
        'feature_importances': feature_importance_list[:12], # top 12 for dashboard
        'last_trained': pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    
    metrics_path = os.path.join(model_dir, 'metrics.json')
    with open(metrics_path, 'w') as f:
        json.dump(metrics_data, f, indent=2)
    print(f"Metrics metadata saved to: {metrics_path}")
    
    return rf_pipeline, metrics_data

if __name__ == '__main__':
    train_and_evaluate()
