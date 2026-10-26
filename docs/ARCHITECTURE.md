# System Architecture Documentation

**Project Name:** Smart Food Waste Prediction & Dynamic Discount Recommendation System  
**Category:** Full-Stack Machine Learning Mini-Project  
**Domain:** Retail Analytics, Econometrics & Food Sustainability  

---

## 1. High-Level Architecture Overview

The system operates as a decoupled, responsive two-tier full-stack application with an asynchronous ML offline training pipeline and a real-time online inference and dynamic discounting engine.

```
+-----------------------------------------------------------------------------------+
|                                 USER INTERFACE                                    |
|              React 19 + Vite + Tailwind CSS v4 + Recharts Visualization           |
|                                                                                   |
|  [Dashboard] [Inventory CRUD] [ML Predictor] [Discount Engine] [Simulator] [Impact] |
+------------------------------------------+----------------------------------------+
                                           | HTTP REST API (JSON)
                                           v
+-----------------------------------------------------------------------------------+
|                                FLASK BACKEND API                                  |
|                                                                                   |
|   /api/dashboard        /api/inventory (GET/POST/PUT/DEL)      /api/predict       |
|   /api/recommend-discount     /api/simulate       /api/analytics     /api/model   |
+----------------------+--------------------+---------------------------------------+
                       |                    |
        +--------------v-------------+      |
        |     SQLite Database        |      |
        |      (inventory.db)        |      |
        |  Persistent retail items   |      |
        +----------------------------+      |
                                            v
+-----------------------------------------------------------------------------------+
|                        MACHINE LEARNING & OPTIMIZATION TIER                       |
|                                                                                   |
|  1. Preprocessing: OneHotEncoder (Categoricals) + StandardScaler (Numerics)       |
|  2. Regression Pipeline: Random Forest Regressor (120 Trees, Max Depth 14)        |
|  3. Physics Conservation Guard: np.clip(y_pred, 0, stock_quantity)                |
|  4. Econometric Discount Engine: Price Elasticity Uplift + Profit Margin Floor    |
|  5. Model Persistence: Joblib serialized pipeline (waste_predictor.joblib)        |
+-----------------------------------------------------------------------------------+
```

---

## 2. Directory Structure

```
ML/
├── backend/
│   ├── app.py                      # Flask REST API server & CORS routes
│   ├── database.py                 # SQLite schema, persistent CRUD & seed demo
│   ├── inventory.db                # SQLite database file
│   ├── ml_service.py               # ML inference service & physical boundary clipping
│   └── discount_engine.py          # Microeconomic elasticity markdown optimizer
├── ml/
│   ├── generate_dataset.py         # Realistic synthetic dataset generator (2,500 records)
│   ├── train_model.py              # ML training, baseline comparison, metrics export
│   ├── data/
│   │   ├── food_waste_dataset.csv  # Synthetic training dataset
│   │   └── sample_inventory.csv    # Sample CSV for user bulk import
│   └── models/
│       ├── waste_predictor.joblib  # Trained scikit-learn pipeline
│       └── metrics.json            # MAE, RMSE, R2, feature importances
├── frontend/
│   ├── src/
│   │   ├── components/             # Reusable UI cards, badges, modals, sidebar, header
│   │   ├── pages/                  # 8 Core application pages
│   │   ├── services/api.js         # API client with fallback simulation capabilities
│   │   ├── App.jsx                 # Main stateful application component
│   │   ├── index.css               # Tailwind v4 styles, custom scrollbars, animations
│   │   └── main.jsx                # React DOM entry point
│   ├── package.json
│   └── vite.config.js
├── docs/
│   ├── ARCHITECTURE.md
│   ├── PRESENTATION_GUIDE.md
│   └── ML_METHODOLOGY.md
├── requirements.txt
├── README.md
└── run_project.bat                 # 1-click Windows startup batch script
```

---

## 3. Data Flow Workflow

1. **Inventory Ingestion:** User adds an item or imports CSV.
2. **Feature Vector Assembly:** The system extracts:
   - `category`, `stock_quantity`, `days_until_expiry`, `avg_daily_sales`, `selling_price`, `cost_price`, `freshness_score`, `historical_demand`, `seasonality`, `day_of_week`.
3. **ML Prediction:** The feature vector passes through the `ColumnTransformer` into the `RandomForestRegressor`.
4. **Physical Clipping:** Raw predictions are bounded strictly between `0.0` and `stock_quantity`.
5. **Scenario Matrix Simulation:** The optimization engine simulates discount tiers `[0%, 10%, 20%, 30%, 40%]`, computing:
   - Elasticity uplift: $\Delta Q = Q_{\text{sold,base}} \times |\epsilon| \times \text{Discount} \times \left(1 + \frac{1}{\text{days}}\right)$
   - Remaining unsold waste post-discount
   - Gross profit margin and cost floor compliance
   - Objective score balancing revenue recovery and waste diversion
6. **Persistence & Presentation:** Metrics and recommendations are rendered across interactive charts and persisted to SQLite.
