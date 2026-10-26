# Smart Food Waste Prediction & Dynamic Discount Recommendation System

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.1-black.svg)](https://flask.palletsprojects.com/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.8-orange.svg)](https://scikit-learn.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003b57.svg)](https://www.sqlite.org/)

An end-to-end intelligent web application designed for supermarkets, grocery stores, and food retailers to forecast perishable food waste before expiry and recommend dynamic, profit-protecting markdown discounts.

---

## 🌟 Key Features

1. **Executive Overview Dashboard:** Real-time KPI counters (Tracked SKUs, Spoilage Alerts, Predicted Waste in kg, Revenue Saved, Rescued Stock %), urgent alert cards, and dynamic category charts.
2. **Persistent Inventory Management:** Full CRUD operations backed by SQLite (`inventory.db`), CSV bulk import & export, category/risk filtering, and search.
3. **ML Food Waste Prediction:** Random Forest Regressor predicting expected unsold quantities before expiry with strict physical boundary guarantees ($0 \le \text{unsold} \le \text{stock}$) and zero target leakage.
4. **Dynamic Discount Recommendation Engine:** Simulates 10%, 20%, 30%, and 40% markdown tiers using microeconomic Price Elasticity of Demand ($\epsilon$), selecting the optimal scenario that preserves merchant profit margins.
5. **Interactive What-If Simulator:** Real-time sandbox sliders to test hypotheses across stock, days left, sales velocity, and discount rates, with clear visual separation between ML predictions and simulation assumptions.
6. **Visual Analytics & Sustainability:** Recharts graphs displaying food waste avoided, category distributions, expiry countdown curves, and CO₂ emissions avoided (EPA/FAO conversion factors).
7. **Model Performance & Retraining:** Evaluation metrics (MAE, RMSE, $R^2$), benchmark comparison against Linear Regression, feature importance rankings, and one-click model retraining.
8. **College Viva & Exhibition Guide:** Complete presentation slides outline, architectural flowcharts, and high-probability viva defense questions.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, Recharts, Lucide Icons |
| **Backend** | Python Flask 3.1, SQLite 3, CORS integration |
| **Machine Learning** | Scikit-learn (Random Forest Pipeline, OneHotEncoder, StandardScaler) |
| **Data Processing** | Pandas, NumPy |
| **Model Persistence** | Joblib (`waste_predictor.joblib`, `metrics.json`) |

---

## 🚀 Exact Windows Installation & Execution Guide

Follow these exact steps in **VS Code Terminal** or **Windows PowerShell**.

### Prerequisites:
- Python 3.11, 3.12, or 3.13 installed
- Node.js (v18+ or v24+) & npm installed

---

### Step 1: Open the Project Directory
```powershell
cd c:\Users\pravi\Downloads\ML
```

### Step 2: Install Python Dependencies
```powershell
python -m pip install -r requirements.txt
```
*(If multiple Python versions exist, you can invoke your desired Python interpreter, e.g. `py -3.13 -m pip install -r requirements.txt`)*

### Step 3: Install Frontend Dependencies
```powershell
cd frontend
npm install
cd ..
```

### Step 4: Generate Synthetic Dataset & Train ML Pipeline (Optional - Pre-trained files included)
The model and datasets are already pre-generated and trained in `ml/models/`. If you want to regenerate from scratch:
```powershell
python ml/generate_dataset.py
python ml/train_model.py
```

---

### Step 5: Run the Project (Two Terminals)

#### Terminal 1 — Start the Flask Backend Server:
```powershell
cd c:\Users\pravi\Downloads\ML
python backend/app.py
```
> The backend server will start on: **`http://127.0.0.1:5000`**  
> Output will confirm: `[ML Service] Successfully loaded trained model` & `[Database] Connected to existing database with records`.

#### Terminal 2 — Start the React + Vite Frontend:
Open a second terminal window in VS Code:
```powershell
cd c:\Users\pravi\Downloads\ML\frontend
npm run dev
```
> The frontend application will start on: **`http://localhost:5173`**  
> Open your web browser and navigate to `http://localhost:5173` to explore the application!

---

### Convenient 1-Click Startup for Windows

Alternatively, simply double-click or execute the provided batch script:
```powershell
.\run_project.bat
```
This automatically launches both backend and frontend servers in separate windows.

---

## 📊 Example Input & Expected Output Format

### Input Example (JSON payload to `/api/predict` or `/api/recommend-discount`):
```json
{
  "product_name": "Organic Strawberries 400g",
  "category": "Produce",
  "stock_quantity": 48.0,
  "selling_price": 4.99,
  "cost_price": 2.50,
  "days_until_expiry": 2,
  "avg_daily_sales": 14.0,
  "historical_demand": "Medium",
  "seasonality": "Summer",
  "day_of_week": "Friday",
  "freshness_score": 45.0
}
```

### Expected Output Example:
```json
{
  "predicted_unsold_quantity": 20.0,
  "expected_waste_percentage": 41.7,
  "estimated_waste_value": 50.00,
  "risk_category": "High",
  "recommended": {
    "discount_percent": 25,
    "discounted_price": 3.74,
    "expected_additional_units_sold": 14.5,
    "estimated_revenue": 158.95,
    "waste_avoided_kg": 14.5,
    "waste_reduction_pct": 72.5,
    "unit_margin": 1.24,
    "margin_percent": 33.2,
    "reason": "With 2 days remaining and 20.0 kg at risk, a 25% discount optimizes trade-off: boosts sales by 14.5 units, recovers $158.95 revenue, and preserves 33.2% profit margin."
  }
}
```

---

## 📁 Sample CSV Inventory File

A sample CSV ready for testing bulk import is included at:
`ml/data/sample_inventory.csv`

To test bulk import:
1. Navigate to the **Inventory Management** page.
2. Click **"Import CSV"**.
3. Select `ml/data/sample_inventory.csv`.
4. The inventory table immediately populates with live ML predictions for all imported items!

---

## 🔧 Troubleshooting Guide

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **"Failed to load /api/..." or yellow banner** | Flask backend is not running on port 5000 | Open a separate terminal and run `python backend/app.py`. |
| **"ModuleNotFoundError: No module named 'flask'"** | Dependencies installed in different Python environment | Run `python -m pip install -r requirements.txt` using the active Python executable. |
| **Port 5000 already in use** | Another service is using port 5000 | Run `Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process` in PowerShell or change the port in `backend/app.py` and `frontend/vite.config.js`. |
| **Port 5173 already in use** | Another Vite dev server is running | Vite will automatically switch to port 5174 or close previous node processes. |

---

## 🎓 Academic Viva & College Presentation Summary

- **Problem:** Supermarket food waste accounts for substantial financial loss and greenhouse gas emissions.
- **Machine Learning Solution:** Random Forest Regressor models complex non-linear perishability interactions, outperforming linear baseline models.
- **Econometric Markdown Engine:** Uses price elasticity of demand ($\epsilon$) to select the optimal discount tier, preventing stock dumping below cost.
- **Sustainability:** Quantifies environmental diversion in terms of avoided carbon dioxide equivalents (CO₂e) using EPA/FAO metrics.

---

## 📄 License
MIT License. Built for academic presentation and educational demonstration.
