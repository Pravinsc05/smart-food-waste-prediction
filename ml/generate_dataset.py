"""
Smart Food Waste Prediction & Dynamic Discount Recommendation System
Synthetic Dataset Generator
====================================================================
Generates a realistic dataset of perishable retail food inventory records
simulating real-world grocery store dynamics, perishability rates, sales velocity,
and unsold waste quantities before expiry.

Limitations Notice:
This dataset is synthetically generated using calibrated retail econometric
formulas and stochastic noise. Real store data may be imported via CSV.
"""

import os
import random
import numpy as np
import pandas as pd

# Set reproducible random seed
RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)
random.seed(RANDOM_SEED)

CATEGORIES = {
    'Produce': {
        'items': ['Bananas', 'Organic Strawberries', 'Baby Spinach', 'Roma Tomatoes', 'Hass Avocados', 'Gala Apples', 'Crisp Romaine Lettuce', 'Carrots', 'Bell Peppers'],
        'price_range': (1.20, 6.50),
        'margin_range': (0.35, 0.55),
        'shelf_life_days': (1, 7),
        'typical_daily_sales': (8, 35),
        'emissions_factor_kg_co2_per_kg': 1.4  # FAO/EPA food footprint
    },
    'Dairy': {
        'items': ['Whole Milk 1L', 'Greek Yogurt 500g', 'Cheddar Cheese Block', 'Salted Butter 250g', 'Heavy Cream 250ml', 'Organic Cottage Cheese', 'Almond Milk 1L'],
        'price_range': (2.10, 8.50),
        'margin_range': (0.28, 0.45),
        'shelf_life_days': (2, 12),
        'typical_daily_sales': (10, 45),
        'emissions_factor_kg_co2_per_kg': 3.2
    },
    'Bakery': {
        'items': ['Artisan Sourdough', 'Butter Croissants 4-Pack', 'Sesame Bagels 6-Pack', 'Whole Wheat Loaf', 'Blueberry Muffins', 'French Brioche', 'Ciabatta Rolls'],
        'price_range': (2.50, 6.99),
        'margin_range': (0.45, 0.65),
        'shelf_life_days': (1, 4),
        'typical_daily_sales': (12, 50),
        'emissions_factor_kg_co2_per_kg': 1.1
    },
    'Meat & Seafood': {
        'items': ['Boneless Chicken Breast', 'Lean Ground Beef 500g', 'Fresh Atlantic Salmon', 'Pork Chops 400g', 'Roasted Turkey Slices', 'Tiger Prawns 300g'],
        'price_range': (5.99, 24.99),
        'margin_range': (0.22, 0.38),
        'shelf_life_days': (1, 6),
        'typical_daily_sales': (5, 25),
        'emissions_factor_kg_co2_per_kg': 12.5
    },
    'Packaged Food': {
        'items': ['Fresh Egg Pasta 250g', 'Organic Firm Tofu 400g', 'Classic Hummus Dip', 'Fresh Tomato Salsa', 'Basil Pesto 190g', 'Stir Fry Vegetable Mix'],
        'price_range': (2.49, 7.99),
        'margin_range': (0.30, 0.50),
        'shelf_life_days': (3, 15),
        'typical_daily_sales': (6, 30),
        'emissions_factor_kg_co2_per_kg': 2.1
    },
    'Deli & Prepared': {
        'items': ['Rotisserie Chicken', 'Smoked Turkey Club Wrap', 'Fresh Salmon Sushi Box', 'Caesar Salad Bowl', 'Creamy Tomato Soup Tub', 'Quiche Lorraine'],
        'price_range': (4.50, 14.50),
        'margin_range': (0.40, 0.60),
        'shelf_life_days': (1, 3),
        'typical_daily_sales': (8, 35),
        'emissions_factor_kg_co2_per_kg': 4.8
    }
}

DEMAND_LEVELS = ['Low', 'Medium', 'High']
DEMAND_MULTIPLIERS = {'Low': 0.75, 'Medium': 1.0, 'High': 1.28}

SEASONS = ['Spring', 'Summer', 'Fall', 'Winter']
SEASON_MULTIPLIERS = {
    'Produce': {'Spring': 1.1, 'Summer': 1.25, 'Fall': 1.0, 'Winter': 0.85},
    'Dairy': {'Spring': 1.0, 'Summer': 0.95, 'Fall': 1.0, 'Winter': 1.05},
    'Bakery': {'Spring': 0.95, 'Summer': 0.90, 'Fall': 1.1, 'Winter': 1.2},
    'Meat & Seafood': {'Spring': 1.0, 'Summer': 1.2, 'Fall': 1.05, 'Winter': 1.15},
    'Packaged Food': {'Spring': 1.0, 'Summer': 1.0, 'Fall': 1.0, 'Winter': 1.0},
    'Deli & Prepared': {'Spring': 1.05, 'Summer': 1.2, 'Fall': 1.0, 'Winter': 0.95}
}

DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
DOW_MULTIPLIERS = {
    'Monday': 0.88,
    'Tuesday': 0.85,
    'Wednesday': 0.92,
    'Thursday': 0.98,
    'Friday': 1.22,
    'Saturday': 1.38,
    'Sunday': 1.30
}

def generate_inventory_record():
    category = random.choice(list(CATEGORIES.keys()))
    cat_spec = CATEGORIES[category]
    product_name = random.choice(cat_spec['items'])
    
    # Prices
    selling_price = round(random.uniform(*cat_spec['price_range']), 2)
    margin = random.uniform(*cat_spec['margin_range'])
    cost_price = round(selling_price * (1.0 - margin), 2)
    
    # Shelf life & Expiry
    days_until_expiry = random.randint(*cat_spec['shelf_life_days'])
    
    # Daily sales velocity
    avg_daily_sales = round(random.uniform(*cat_spec['typical_daily_sales']), 1)
    
    # Overstock scenario generation:
    # Some items are normally stocked, some moderately overstocked, some severely overstocked
    stock_ratio = random.choices(
        [0.8, 1.2, 1.8, 2.5, 3.2],
        weights=[0.20, 0.35, 0.25, 0.12, 0.08]
    )[0]
    
    expected_sales_until_expiry_raw = avg_daily_sales * days_until_expiry
    stock_quantity = max(5, int(round(expected_sales_until_expiry_raw * stock_ratio + random.uniform(-2, 8))))
    
    # Environmental / Context features
    historical_demand = random.choices(DEMAND_LEVELS, weights=[0.25, 0.50, 0.25])[0]
    season = random.choice(SEASONS)
    day_of_week = random.choice(DAYS_OF_WEEK)
    
    # Freshness index (0 to 100, where 100 is freshly delivered)
    # Higher freshness for products with more days left
    freshness_base = min(100.0, max(10.0, (days_until_expiry / cat_spec['shelf_life_days'][1]) * 100.0))
    freshness_score = round(freshness_base + random.uniform(-8, 8), 1)
    freshness_score = min(100.0, max(5.0, freshness_score))
    
    # Calculate physics-based expected sales under standard conditions (NO future discount leakage)
    demand_mult = DEMAND_MULTIPLIERS[historical_demand]
    season_mult = SEASON_MULTIPLIERS[category][season]
    dow_mult = DOW_MULTIPLIERS[day_of_week]
    
    # Price elasticity relative impact: if item is pricier than median in category, slightly lower velocity
    cat_median_price = (cat_spec['price_range'][0] + cat_spec['price_range'][1]) / 2.0
    price_sensitivity = 1.0 - (selling_price - cat_median_price) / (cat_median_price * 4.0)
    price_sensitivity = max(0.75, min(1.25, price_sensitivity))
    
    effective_daily_velocity = avg_daily_sales * demand_mult * season_mult * dow_mult * price_sensitivity
    expected_total_sales = effective_daily_velocity * days_until_expiry
    
    # Stochastic realistic sales variation (+/- 12% standard noise)
    noise_factor = np.random.normal(1.0, 0.12)
    actual_realized_sales = expected_total_sales * noise_factor
    
    # Physical conservation of inventory constraint:
    # 0 <= unsold_quantity <= stock_quantity
    unsold_quantity = max(0.0, min(float(stock_quantity), float(stock_quantity - actual_realized_sales)))
    unsold_quantity = round(unsold_quantity, 1)
    
    waste_percentage = round((unsold_quantity / stock_quantity) * 100.0, 1)
    waste_value = round(unsold_quantity * cost_price, 2)
    
    # Risk categorization
    if waste_percentage >= 40.0:
        risk_category = 'High'
    elif waste_percentage >= 15.0:
        risk_category = 'Medium'
    else:
        risk_category = 'Low'

    return {
        'product_name': product_name,
        'category': category,
        'stock_quantity': stock_quantity,
        'avg_daily_sales': avg_daily_sales,
        'days_until_expiry': days_until_expiry,
        'selling_price': selling_price,
        'cost_price': cost_price,
        'historical_demand': historical_demand,
        'seasonality': season,
        'day_of_week': day_of_week,
        'freshness_score': freshness_score,
        'unsold_quantity': unsold_quantity,
        'waste_percentage': waste_percentage,
        'waste_value': waste_value,
        'risk_category': risk_category
    }

def generate_dataset(num_records=2500, output_path='ml/data/food_waste_dataset.csv'):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    records = [generate_inventory_record() for _ in range(num_records)]
    df = pd.DataFrame(records)
    
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} synthetic records saved to: {output_path}")
    print("\nDataset Summary:")
    print(df[['stock_quantity', 'avg_daily_sales', 'days_until_expiry', 'unsold_quantity', 'waste_percentage']].describe().round(2))
    print("\nWaste Risk Distribution:")
    print(df['risk_category'].value_counts(normalize=True).round(3) * 100)
    return df

def generate_sample_inventory_csv(output_path='ml/data/sample_inventory.csv'):
    """Generates an initial sample CSV ready for user import or live inventory demo."""
    sample_items = [
        {'product_name': 'Organic Strawberries', 'category': 'Produce', 'stock_quantity': 45, 'avg_daily_sales': 12.0, 'days_until_expiry': 2, 'selling_price': 4.99, 'cost_price': 2.50, 'historical_demand': 'Medium', 'seasonality': 'Summer', 'day_of_week': 'Friday', 'freshness_score': 45.0},
        {'product_name': 'Artisan Sourdough', 'category': 'Bakery', 'stock_quantity': 38, 'avg_daily_sales': 14.0, 'days_until_expiry': 1, 'selling_price': 5.50, 'cost_price': 2.10, 'historical_demand': 'High', 'seasonality': 'Fall', 'day_of_week': 'Saturday', 'freshness_score': 30.0},
        {'product_name': 'Whole Milk 1L', 'category': 'Dairy', 'stock_quantity': 75, 'avg_daily_sales': 22.0, 'days_until_expiry': 3, 'selling_price': 2.80, 'cost_price': 1.70, 'historical_demand': 'Medium', 'seasonality': 'Winter', 'day_of_week': 'Tuesday', 'freshness_score': 65.0},
        {'product_name': 'Fresh Atlantic Salmon', 'category': 'Meat & Seafood', 'stock_quantity': 28, 'avg_daily_sales': 6.5, 'days_until_expiry': 2, 'selling_price': 18.99, 'cost_price': 12.50, 'historical_demand': 'Low', 'seasonality': 'Spring', 'day_of_week': 'Wednesday', 'freshness_score': 50.0},
        {'product_name': 'Baby Spinach 200g', 'category': 'Produce', 'stock_quantity': 50, 'avg_daily_sales': 15.0, 'days_until_expiry': 1, 'selling_price': 3.20, 'cost_price': 1.40, 'historical_demand': 'Medium', 'seasonality': 'Spring', 'day_of_week': 'Thursday', 'freshness_score': 25.0},
        {'product_name': 'Greek Yogurt 500g', 'category': 'Dairy', 'stock_quantity': 40, 'avg_daily_sales': 11.0, 'days_until_expiry': 5, 'selling_price': 4.50, 'cost_price': 2.60, 'historical_demand': 'High', 'seasonality': 'Summer', 'day_of_week': 'Sunday', 'freshness_score': 75.0},
        {'product_name': 'Butter Croissants 4-Pack', 'category': 'Bakery', 'stock_quantity': 30, 'avg_daily_sales': 10.0, 'days_until_expiry': 1, 'selling_price': 4.99, 'cost_price': 1.80, 'historical_demand': 'Medium', 'seasonality': 'Winter', 'day_of_week': 'Saturday', 'freshness_score': 35.0},
        {'product_name': 'Boneless Chicken Breast', 'category': 'Meat & Seafood', 'stock_quantity': 35, 'avg_daily_sales': 9.0, 'days_until_expiry': 2, 'selling_price': 9.99, 'cost_price': 6.20, 'historical_demand': 'High', 'seasonality': 'Fall', 'day_of_week': 'Friday', 'freshness_score': 55.0},
        {'product_name': 'Rotisserie Chicken', 'category': 'Deli & Prepared', 'stock_quantity': 22, 'avg_daily_sales': 12.0, 'days_until_expiry': 1, 'selling_price': 8.99, 'cost_price': 4.50, 'historical_demand': 'High', 'seasonality': 'Summer', 'day_of_week': 'Sunday', 'freshness_score': 40.0},
        {'product_name': 'Fresh Egg Pasta 250g', 'category': 'Packaged Food', 'stock_quantity': 60, 'avg_daily_sales': 10.0, 'days_until_expiry': 6, 'selling_price': 3.99, 'cost_price': 2.10, 'historical_demand': 'Medium', 'seasonality': 'Fall', 'day_of_week': 'Monday', 'freshness_score': 85.0},
        {'product_name': 'Hass Avocados', 'category': 'Produce', 'stock_quantity': 65, 'avg_daily_sales': 18.0, 'days_until_expiry': 3, 'selling_price': 1.99, 'cost_price': 0.95, 'historical_demand': 'High', 'seasonality': 'Summer', 'day_of_week': 'Saturday', 'freshness_score': 60.0},
        {'product_name': 'Cheddar Cheese Block', 'category': 'Dairy', 'stock_quantity': 30, 'avg_daily_sales': 5.0, 'days_until_expiry': 9, 'selling_price': 6.50, 'cost_price': 3.90, 'historical_demand': 'Low', 'seasonality': 'Winter', 'day_of_week': 'Wednesday', 'freshness_score': 90.0}
    ]
    df_sample = pd.DataFrame(sample_items)
    df_sample.to_csv(output_path, index=False)
    print(f"Generated sample inventory CSV saved to: {output_path}")

if __name__ == '__main__':
    generate_dataset()
    generate_sample_inventory_csv()
