# College Exhibition & Viva Presentation Guide

**Project Title:** Smart Food Waste Prediction & Dynamic Discount Recommendation System  
**Presentation Time:** 5–10 minutes  
**Target Audience:** Professors, Viva Examiners, Industry Evaluators  

---

## 1. 60-Second Elevator Pitch

> *"Supermarkets lose billions of dollars annually discarding edible perishable food, while contributing heavily to greenhouse gas emissions. Traditional stores apply rigid, last-minute manual discounts on the expiry date, which is often too late.*
> 
> *Our project introduces a complete full-stack machine learning solution: it uses a trained Random Forest Regressor to forecast expected unsold quantities days ahead of expiry. It then couples this forecast with a price-elasticity optimization engine to recommend optimal, profit-protecting markdown tiers (10%, 20%, 30%, 40%) that incentivize rapid clearance, salvaging up to 70% of potential food waste while protecting merchant profit margins."*

---

## 2. Recommended Live Demonstration Flow

1. **Overview Dashboard:**
   - Show the 6 core KPI cards: Tracked SKUs, Nearing Expiry items, Predicted Waste (kg), Revenue Saved ($), Waste Reduction (%), and Immediate Actions.
   - Point out the real-time CO₂ emissions avoided counter and meals saved.
   - Show the "Products Requiring Immediate Action" cards.
2. **Inventory Management:**
   - Demonstrate the interactive table with search, category filtering, and risk sorting.
   - Click **"New Product"** and add a test item (e.g. "Fresh Berries", 40 kg, 2 days expiry).
   - Show that the table automatically computes live ML predicted unsold kg and recommended discount.
3. **ML Waste Prediction Page:**
   - Load the test product or enter custom sliders.
   - Show how the Random Forest pipeline calculates unsold quantity, waste percentage, waste value ($), and risk tier.
   - Emphasize the **physical conservation boundary** ($0 \le \text{unsold} \le \text{stock}$).
4. **Dynamic Discount Advisor:**
   - Show the 5-scenario matrix comparison (0%, 10%, 20%, 30%, 40%).
   - Explain why the system recommended a specific discount tier (e.g., 20% vs 30%), showing the explainable reason, units sold boost, and profit margin preservation.
5. **Interactive What-If Simulator:**
   - Move the sliders for stock, days left, and discount %.
   - Highlight the side-by-side distinction between the **ML Model Baseline** and the **User Simulation Outcome**.
6. **Model Performance & Retraining:**
   - Display the MAE, RMSE, and $R^2$ comparison table against the baseline.
   - Show the feature importance ranking (Stock Quantity, Daily Sales Velocity, Days Until Expiry).
   - Click the **"Retrain Model Pipeline"** button to show live end-to-end retraining and Joblib serialization.

---

## 3. High-Probability Viva Questions & Model Answers

### Q1: Why did you choose Random Forest Regressor?
**Answer:** Random Forest is an ensemble of decision trees trained on bootstrap samples with random feature subsampling. Retail perishable demand exhibits non-linear interactions: sales velocity drops abruptly in the final 24-48 hours. Linear models assume smooth linear additive relationships, while Random Forest excels at capturing piecewise interactions between category, shelf life, and sales velocity without overfitting.

### Q2: Did you use Machine Learning for the discount recommendation itself?
**Answer:** No, and we are academically transparent about this. The waste prediction is machine learning (Random Forest). The discount recommendation is an Econometric Price Elasticity Optimization Engine. We simulate 10%, 20%, 30%, and 40% markdown tiers using empirical price elasticity coefficients and pick the optimal policy using a transparent multi-objective score balancing revenue and waste avoidance while honoring cost-price margin constraints.

### Q3: How did you prevent target leakage in the dataset?
**Answer:** Target leakage occurs if future outcomes (such as post-discount sales or realized clearance revenue) are fed as input features during training. In our pipeline, only features known at the time of prediction (current inventory, shelf life remaining, baseline sales velocity, standard price, day of week) are fed into the model.

### Q4: How is data persisted?
**Answer:** We use an SQLite database (`inventory.db`) with an automated initialization and sample seeding schema. All added, updated, and deleted products persist across application restarts.
