"""
Smart Food Waste Prediction & Dynamic Discount Recommendation System
Machine Learning Inference Service
====================================================================
Loads the trained Random Forest Pipeline from disk and provides real-time
inference with physical constraint enforcement:
    0 <= predicted_unsold <= stock_quantity
"""

import os
import json
import joblib
import numpy as np
import pandas as pd

MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'ml', 'models', 'waste_predictor.joblib')
METRICS_PATH = os.path.join(os.path.dirname(__file__), '..', 'ml', 'models', 'metrics.json')

class MLWastePredictor:
    def __init__(self, model_path=MODEL_PATH, metrics_path=METRICS_PATH):
        self.model_path = model_path
        self.metrics_path = metrics_path
        self.model = None
        self.metrics = None
        self.load_model()
        
    def load_model(self):
        try:
            if os.path.exists(self.model_path):
                self.model = joblib.load(self.model_path)
                print(f"[ML Service] Successfully loaded trained model from {self.model_path}")
            else:
                print(f"[ML Service] Warning: Model file {self.model_path} not found. Retrain needed.")
                self.model = None
                
            if os.path.exists(self.metrics_path):
                with open(self.metrics_path, 'r') as f:
                    self.metrics = json.load(f)
            else:
                self.metrics = None
        except Exception as e:
            print(f"[ML Service] Error loading model: {e}")
            self.model = None

    def predict_unsold(self, item_dict):
        """
        Executes prediction using the trained Scikit-learn Pipeline.
        Guarantees: 0 <= predicted_unsold <= stock_quantity
        """
        stock_quantity = float(item_dict.get('stock_quantity', 10.0))
        cost_price = float(item_dict.get('cost_price', 2.0))
        selling_price = float(item_dict.get('selling_price', 3.5))
        days_until_expiry = int(item_dict.get('days_until_expiry', 3))
        avg_daily_sales = float(item_dict.get('avg_daily_sales', 5.0))
        category = str(item_dict.get('category', 'Produce'))
        historical_demand = str(item_dict.get('historical_demand', 'Medium'))
        seasonality = str(item_dict.get('seasonality', 'Summer'))
        day_of_week = str(item_dict.get('day_of_week', 'Friday'))
        freshness_score = float(item_dict.get('freshness_score', 50.0))
        
        # Prepare dataframe matching exact schema expected by ColumnTransformer
        input_data = pd.DataFrame([{
            'category': category,
            'historical_demand': historical_demand,
            'seasonality': seasonality,
            'day_of_week': day_of_week,
            'stock_quantity': stock_quantity,
            'avg_daily_sales': avg_daily_sales,
            'days_until_expiry': days_until_expiry,
            'selling_price': selling_price,
            'cost_price': cost_price,
            'freshness_score': freshness_score
        }])
        
        if self.model is not None:
            raw_prediction = float(self.model.predict(input_data)[0])
        else:
            # Fallback heuristic if model is not loaded yet
            expected_velocity = avg_daily_sales * max(1, days_until_expiry)
            raw_prediction = stock_quantity - expected_velocity
            
        # Physical boundary constraints: strictly bounded between 0 and available stock
        predicted_unsold = float(np.clip(raw_prediction, 0.0, stock_quantity))
        predicted_unsold = round(predicted_unsold, 1)
        
        # Derived Waste KPIs
        waste_percentage = round((predicted_unsold / max(1.0, stock_quantity)) * 100.0, 1)
        waste_percentage = min(100.0, max(0.0, waste_percentage))
        waste_value = round(predicted_unsold * cost_price, 2)
        
        # Risk Categorization
        if waste_percentage >= 40.0:
            risk_category = 'High'
        elif waste_percentage >= 15.0:
            risk_category = 'Medium'
        else:
            risk_category = 'Low'
            
        return {
            'predicted_unsold_quantity': predicted_unsold,
            'expected_waste_percentage': waste_percentage,
            'estimated_waste_value': waste_value,
            'risk_category': risk_category,
            'expected_sales_quantity': round(stock_quantity - predicted_unsold, 1),
            'model_used': 'Random Forest Regressor (Trained Pipeline)' if self.model is not None else 'Heuristic Fallback'
        }
        
    def get_metrics(self):
        if self.metrics:
            return self.metrics
        return {
            'model_name': 'Random Forest Regressor',
            'status': 'Model metrics not loaded'
        }

# Global singleton instance
predictor = MLWastePredictor()
