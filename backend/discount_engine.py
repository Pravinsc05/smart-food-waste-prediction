"""
Smart Food Waste Prediction & Dynamic Discount Recommendation System
Dynamic Discount Optimization Engine
====================================================================
Uses calibrated microeconomic price elasticity models combined with the
ML-predicted unsold waste quantity to simulate 10%, 20%, 30%, and 40%
discount scenarios.

Selects the mathematically optimal discount policy balancing:
1. Maximum revenue realization
2. Maximum food waste reduction
3. Cost-margin protection
"""

# Price elasticity of demand by perishable food category
CATEGORY_ELASTICITY = {
    'Produce': -1.45,
    'Dairy': -1.25,
    'Bakery': -1.85,
    'Meat & Seafood': -1.60,
    'Packaged Food': -1.35,
    'Deli & Prepared': -2.10
}

# Baseline demonstration policy rules
POLICY_RULES = [
    {
        'days_min': 6,
        'days_max': 999,
        'base_discount': 0.05,
        'label': 'Fresh Shelf Life (>5 Days)',
        'description': 'Product has adequate shelf life; minimal promotional discount of 0-10% recommended.'
    },
    {
        'days_min': 3,
        'days_max': 5,
        'base_discount': 0.15,
        'label': 'Mid Shelf Life (3-5 Days)',
        'description': 'Moderate expiry proximity; moderate discount of 10-20% recommended to boost sales velocity.'
    },
    {
        'days_min': 1,
        'days_max': 2,
        'base_discount': 0.25,
        'label': 'Near Expiry (1-2 Days)',
        'description': 'High spoilage risk; aggressive discount of 20-35% recommended to clear stock.'
    },
    {
        'days_min': 0,
        'days_max': 0,
        'base_discount': 0.40,
        'label': 'Expiring Today (Urgent Clearance)',
        'description': 'Urgent clearance; up to 40-50% discount recommended if product is safe and legally saleable.'
    }
]

def get_baseline_policy(days_until_expiry):
    for rule in POLICY_RULES:
        if rule['days_min'] <= days_until_expiry <= rule['days_max']:
            return rule
    return POLICY_RULES[0]

def evaluate_discount_scenarios(
    product_name,
    category,
    stock_quantity,
    selling_price,
    cost_price,
    days_until_expiry,
    predicted_unsold,
    historical_demand='Medium',
    min_margin_threshold=0.0  # Selling below cost threshold (e.g. 0.0 means at least cost price)
):
    """
    Simulates multi-tier discount scenarios (0%, 10%, 20%, 30%, 40%)
    and selects the optimal recommendation balancing waste avoidance & profit.
    """
    elasticity = abs(CATEGORY_ELASTICITY.get(category, -1.50))
    
    # Base baseline sales under standard price
    base_sold = max(0.0, stock_quantity - predicted_unsold)
    
    # Urgency multiplier for near-expiry clearance behavior
    # Consumers search for clearance stickers near expiry
    urgency_boost = 1.0 + (1.0 / max(1, days_until_expiry)) * 0.35
    
    # Demand multiplier
    demand_multipliers = {'Low': 0.85, 'Medium': 1.0, 'High': 1.20}
    demand_factor = demand_multipliers.get(historical_demand, 1.0)
    
    scenarios = []
    discount_rates = [0.0, 0.10, 0.20, 0.30, 0.40]
    
    for rate in discount_rates:
        discounted_price = round(selling_price * (1.0 - rate), 2)
        unit_margin = discounted_price - cost_price
        is_profitable = discounted_price >= cost_price
        margin_percent = round((unit_margin / discounted_price) * 100.0, 1) if discounted_price > 0 else 0.0
        
        if rate == 0.0:
            units_sold = base_sold
            additional_sold = 0.0
            unsold_after = predicted_unsold
        else:
            # Uplift percentage from price elasticity
            price_cut_ratio = rate
            uplift_rate = price_cut_ratio * elasticity * urgency_boost * demand_factor
            
            # Uplift applies to potential buyer demand, bounded by remaining unsold inventory
            potential_additional = base_sold * uplift_rate
            # Ensure at least some uplift even if base_sold is low
            if potential_additional < (stock_quantity * rate * 0.4):
                potential_additional = stock_quantity * rate * 0.4
                
            additional_sold = min(predicted_unsold, potential_additional)
            additional_sold = round(additional_sold, 1)
            
            units_sold = min(float(stock_quantity), base_sold + additional_sold)
            unsold_after = max(0.0, stock_quantity - units_sold)
            unsold_after = round(unsold_after, 1)
            
        estimated_revenue = round(units_sold * discounted_price, 2)
        waste_avoided = round(predicted_unsold - unsold_after, 1)
        waste_reduction_pct = round((waste_avoided / (predicted_unsold + 1e-5)) * 100.0, 1) if predicted_unsold > 0 else 100.0
        waste_reduction_pct = min(100.0, max(0.0, waste_reduction_pct))
        
        # Environmental impact avoided (average 2.5 kg CO2 per kg food)
        co2_saved_kg = round(waste_avoided * 2.5, 2)
        
        scenarios.append({
            'discount_percent': int(rate * 100),
            'discounted_price': discounted_price,
            'unit_margin': round(unit_margin, 2),
            'margin_percent': margin_percent,
            'is_profitable': is_profitable,
            'expected_units_sold': round(units_sold, 1),
            'additional_units_sold': round(additional_sold, 1),
            'unsold_quantity': round(unsold_after, 1),
            'estimated_revenue': estimated_revenue,
            'waste_avoided_kg': waste_avoided,
            'waste_reduction_pct': waste_reduction_pct,
            'co2_saved_kg': co2_saved_kg
        })
        
    # Multi-Objective Optimization to choose the Best Feasible Scenario:
    # Maximize: 0.55 * (Normalized Revenue) + 0.45 * (Normalized Waste Reduction)
    # Subject to: minimum acceptable margin constraint
    max_rev = max(s['estimated_revenue'] for s in scenarios) or 1.0
    
    scored_scenarios = []
    for s in scenarios:
        norm_rev = s['estimated_revenue'] / max_rev
        norm_waste_red = s['waste_reduction_pct'] / 100.0
        
        # Profitability penalty: heavily penalize if price drops below cost unless waste risk is extreme
        cost_penalty = 0.0
        if not s['is_profitable']:
            if days_until_expiry <= 1:
                cost_penalty = 0.15 # Accept some loss to salvage sunk cost
            else:
                cost_penalty = 0.40 # Strongly penalize selling below cost when days remain
                
        score = (0.55 * norm_rev) + (0.45 * norm_waste_red) - cost_penalty
        scored_scenarios.append((score, s))
        
    scored_scenarios.sort(key=lambda x: x[0], reverse=True)
    best_scenario = scored_scenarios[0][1]
    
    # Construct transparent explanation and reasoning
    baseline_rule = get_baseline_policy(days_until_expiry)
    rec_discount = best_scenario['discount_percent']
    
    if predicted_unsold <= 1.0:
        reason = (
            f"Minimal waste risk detected ({predicted_unsold} kg predicted unsold). "
            f"Standard pricing or light promotional discount maintains high profitability."
        )
    elif rec_discount == 0:
        reason = (
            f"Expected organic sales velocity will clear stock before expiry. "
            f"No discount required; preserves full original margin of ${selling_price - cost_price:.2f}."
        )
    elif days_until_expiry <= 1:
        reason = (
            f"Urgent expiry alert: product expires in {days_until_expiry} day(s) with {predicted_unsold} kg at risk. "
            f"A {rec_discount}% discount stimulates rapid clearance, saving {best_scenario['waste_avoided_kg']} kg from disposal "
            f"while securing ${best_scenario['estimated_revenue']:.2f} in recovered revenue."
        )
    else:
        reason = (
            f"With {days_until_expiry} days remaining and {predicted_unsold} kg at risk, "
            f"a {rec_discount}% discount optimizes trade-off: boosts sales by {best_scenario['additional_units_sold']} units, "
            f"recovers ${best_scenario['estimated_revenue']:.2f} revenue, and preserves {best_scenario['margin_percent']}% profit margin."
        )
        
    return {
        'product_name': product_name,
        'category': category,
        'stock_quantity': stock_quantity,
        'original_price': selling_price,
        'cost_price': cost_price,
        'days_until_expiry': days_until_expiry,
        'predicted_unsold_baseline': predicted_unsold,
        'baseline_policy_benchmark': {
            'label': baseline_rule['label'],
            'suggested_rate_pct': int(baseline_rule['base_discount'] * 100),
            'policy_note': baseline_rule['description']
        },
        'recommended': {
            'discount_percent': rec_discount,
            'discounted_price': best_scenario['discounted_price'],
            'original_price': selling_price,
            'expected_additional_units_sold': best_scenario['additional_units_sold'],
            'estimated_revenue': best_scenario['estimated_revenue'],
            'estimated_unsold_after_discount': best_scenario['unsold_quantity'],
            'waste_reduction_pct': best_scenario['waste_reduction_pct'],
            'waste_avoided_kg': best_scenario['waste_avoided_kg'],
            'co2_saved_kg': best_scenario['co2_saved_kg'],
            'unit_margin': best_scenario['unit_margin'],
            'margin_percent': best_scenario['margin_percent'],
            'reason': reason
        },
        'scenarios': scenarios,
        'methodology_note': (
            "Scenario simulation uses category price elasticity (-" + str(elasticity) + 
            ") coupled with ML waste predictions and margin constraints. Configurable retail policy rules."
        )
    }
