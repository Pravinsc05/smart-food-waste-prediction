"""
Smart Food Waste Prediction & Dynamic Discount Recommendation System
Flask Backend REST API Server
====================================================================
"""

import os
import sys
import io
import csv

# Ensure backend and root directories are on Python search path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(CURRENT_DIR, '..'))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from flask import Flask, request, jsonify, make_response
from database import (
    init_db, get_all_products, get_product_by_id,
    add_product, update_product, delete_product,
    bulk_insert, reset_to_defaults
)
from ml_service import predictor
from discount_engine import evaluate_discount_scenarios
from ml.train_model import train_and_evaluate

app = Flask(__name__)

# Native Cross-Origin Resource Sharing (CORS) handler for robust browser integration
@app.before_request
def handle_preflight():
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS'
        return response

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS'
    return response

# Initialize Database on startup
init_db()

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'Food Waste & Dynamic Discount API',
        'model_loaded': predictor.model is not None,
        'model_name': 'Random Forest Regressor'
    }), 200

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard_stats():
    products = get_all_products()
    
    total_products = len(products)
    nearing_expiry_count = 0
    total_stock_kg = 0.0
    total_predicted_waste_kg = 0.0
    total_waste_value_dollars = 0.0
    total_revenue_potential = 0.0
    total_revenue_saved_estimate = 0.0
    immediate_action_count = 0
    
    category_summary = {}
    high_risk_alerts = []
    
    for p in products:
        stock = float(p['stock_quantity'])
        cost = float(p['cost_price'])
        price = float(p['selling_price'])
        days = int(p['days_until_expiry'])
        cat = p['category']
        
        total_stock_kg += stock
        total_revenue_potential += stock * price
        
        if days <= 2:
            nearing_expiry_count += 1
            
        # Run ML prediction for this product
        pred = predictor.predict_unsold(p)
        unsold_qty = pred['predicted_unsold_quantity']
        waste_pct = pred['expected_waste_percentage']
        waste_val = pred['estimated_waste_value']
        risk = pred['risk_category']
        
        total_predicted_waste_kg += unsold_qty
        total_waste_value_dollars += waste_val
        
        # Calculate dynamic discount impact
        discount_result = evaluate_discount_scenarios(
            p['product_name'], cat, stock, price, cost, days, unsold_qty, p.get('historical_demand', 'Medium')
        )
        rec = discount_result['recommended']
        total_revenue_saved_estimate += (rec['waste_avoided_kg'] * rec['discounted_price'])
        
        if risk == 'High' or days <= 1:
            immediate_action_count += 1
            high_risk_alerts.append({
                'id': p['id'],
                'product_name': p['product_name'],
                'category': cat,
                'stock_quantity': stock,
                'days_until_expiry': days,
                'predicted_unsold': unsold_qty,
                'waste_percentage': waste_pct,
                'waste_value': waste_val,
                'risk_category': risk,
                'recommended_discount': rec['discount_percent'],
                'reason': rec['reason']
            })
            
        if cat not in category_summary:
            category_summary[cat] = {
                'category': cat,
                'product_count': 0,
                'total_stock': 0.0,
                'predicted_waste_kg': 0.0,
                'waste_value': 0.0
            }
        category_summary[cat]['product_count'] += 1
        category_summary[cat]['total_stock'] += stock
        category_summary[cat]['predicted_waste_kg'] += unsold_qty
        category_summary[cat]['waste_value'] += waste_val

    # Overall waste reduction potential through recommendations
    waste_reduction_pct = round(
        ((total_stock_kg - total_predicted_waste_kg) / max(1.0, total_stock_kg)) * 100.0, 1
    ) if total_stock_kg > 0 else 0.0

    return jsonify({
        'total_products': total_products,
        'nearing_expiry_count': nearing_expiry_count,
        'total_stock_kg': round(total_stock_kg, 1),
        'predicted_waste_kg': round(total_predicted_waste_kg, 1),
        'waste_value_dollars': round(total_waste_value_dollars, 2),
        'estimated_revenue_saved': round(total_revenue_saved_estimate, 2),
        'waste_reduction_percentage': waste_reduction_pct,
        'immediate_action_count': immediate_action_count,
        'category_breakdown': list(category_summary.values()),
        'high_risk_alerts': high_risk_alerts[:6],
        'co2_saved_kg': round(total_predicted_waste_kg * 0.7 * 2.5, 1) # Estimated assuming 70% recoverable
    }), 200

@app.route('/api/inventory', methods=['GET'])
def get_inventory():
    category = request.args.get('category', 'All')
    products = get_all_products(category_filter=category)
    
    enriched = []
    for p in products:
        pred = predictor.predict_unsold(p)
        rec = evaluate_discount_scenarios(
            p['product_name'], p['category'], float(p['stock_quantity']),
            float(p['selling_price']), float(p['cost_price']),
            int(p['days_until_expiry']), pred['predicted_unsold_quantity'],
            p.get('historical_demand', 'Medium')
        )
        item = dict(p)
        item['prediction'] = pred
        item['recommendation'] = rec['recommended']
        enriched.append(item)
        
    return jsonify(enriched), 200

@app.route('/api/inventory', methods=['POST'])
def create_inventory_item():
    data = request.get_json()
    if not data or 'product_name' not in data:
        return jsonify({'error': 'Missing product_name or payload'}), 400
        
    try:
        new_item = add_product(data)
        # Compute ML prediction and recommendation for returned item
        pred = predictor.predict_unsold(new_item)
        rec = evaluate_discount_scenarios(
            new_item['product_name'], new_item['category'], float(new_item['stock_quantity']),
            float(new_item['selling_price']), float(new_item['cost_price']),
            int(new_item['days_until_expiry']), pred['predicted_unsold_quantity']
        )
        item_dict = dict(new_item)
        item_dict['prediction'] = pred
        item_dict['recommendation'] = rec['recommended']
        return jsonify(item_dict), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/inventory/<int:item_id>', methods=['PUT'])
def update_inventory_item(item_id):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No update payload provided'}), 400
        
    updated = update_product(item_id, data)
    if not updated:
        return jsonify({'error': 'Product not found'}), 404
        
    pred = predictor.predict_unsold(updated)
    rec = evaluate_discount_scenarios(
        updated['product_name'], updated['category'], float(updated['stock_quantity']),
        float(updated['selling_price']), float(updated['cost_price']),
        int(updated['days_until_expiry']), pred['predicted_unsold_quantity']
    )
    res = dict(updated)
    res['prediction'] = pred
    res['recommendation'] = rec['recommended']
    return jsonify(res), 200

@app.route('/api/inventory/<int:item_id>', methods=['DELETE'])
def delete_inventory_item(item_id):
    success = delete_product(item_id)
    if success:
        return jsonify({'message': f'Product {item_id} deleted successfully'}), 200
    return jsonify({'error': 'Product not found'}), 404

@app.route('/api/inventory/reset', methods=['POST'])
def reset_inventory():
    reset_to_defaults()
    return jsonify({'message': 'Inventory successfully reset to default demo dataset'}), 200

@app.route('/api/inventory/import-csv', methods=['POST'])
def import_csv():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    try:
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        reader = csv.DictReader(stream)
        items = []
        for row in reader:
            items.append({
                'product_name': row.get('product_name', 'Imported Item'),
                'category': row.get('category', 'Produce'),
                'stock_quantity': float(row.get('stock_quantity', 10)),
                'selling_price': float(row.get('selling_price', 3.99)),
                'cost_price': float(row.get('cost_price', 2.00)),
                'days_until_expiry': int(row.get('days_until_expiry', 3)),
                'avg_daily_sales': float(row.get('avg_daily_sales', 5.0)),
                'freshness_score': float(row.get('freshness_score', 70.0)),
                'historical_demand': row.get('historical_demand', 'Medium'),
                'seasonality': row.get('seasonality', 'Summer'),
                'day_of_week': row.get('day_of_week', 'Friday')
            })
            
        inserted_count = bulk_insert(items)
        return jsonify({'message': f'Successfully imported {inserted_count} products'}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to parse CSV: {str(e)}'}), 400

@app.route('/api/predict', methods=['POST'])
def predict_endpoint():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid request: JSON body required'}), 400
        
    prediction = predictor.predict_unsold(data)
    return jsonify(prediction), 200

@app.route('/api/recommend-discount', methods=['POST'])
def recommend_discount_endpoint():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid request: JSON body required'}), 400
        
    stock = float(data.get('stock_quantity', 20.0))
    price = float(data.get('selling_price', 5.0))
    cost = float(data.get('cost_price', 2.5))
    days = int(data.get('days_until_expiry', 2))
    cat = str(data.get('category', 'Produce'))
    product_name = str(data.get('product_name', 'Item'))
    demand = str(data.get('historical_demand', 'Medium'))
    
    # Check if predicted unsold was provided, or run prediction
    if 'predicted_unsold' in data:
        predicted_unsold = float(data['predicted_unsold'])
    else:
        pred = predictor.predict_unsold(data)
        predicted_unsold = pred['predicted_unsold_quantity']
        
    result = evaluate_discount_scenarios(
        product_name, cat, stock, price, cost, days, predicted_unsold, demand
    )
    return jsonify(result), 200

@app.route('/api/simulate', methods=['POST'])
def simulate_endpoint():
    """
    Dedicated What-If Simulator:
    Clearly distinguishes between ML Model Predicted baseline
    and user-controlled simulation scenario parameters.
    """
    data = request.get_json() or {}
    stock = float(data.get('stock_quantity', 50.0))
    days = int(data.get('days_until_expiry', 2))
    demand_rate = float(data.get('avg_daily_sales', 12.0))
    price = float(data.get('selling_price', 4.50))
    cost = float(data.get('cost_price', price * 0.55))
    discount_pct = float(data.get('discount_percent', 20.0))
    category = str(data.get('category', 'Produce'))
    
    # 1. Run ML model for unmitigated (0% discount) prediction
    ml_input = {
        'category': category,
        'stock_quantity': stock,
        'days_until_expiry': days,
        'avg_daily_sales': demand_rate,
        'selling_price': price,
        'cost_price': cost,
        'historical_demand': 'Medium',
        'seasonality': 'Summer',
        'day_of_week': 'Saturday',
        'freshness_score': 50.0
    }
    ml_pred = predictor.predict_unsold(ml_input)
    baseline_unsold_ml = ml_pred['predicted_unsold_quantity']
    
    # 2. Run simulation with user's selected discount percentage
    discount_rate = discount_pct / 100.0
    discounted_price = round(price * (1.0 - discount_rate), 2)
    
    # Elasticity uplift calculation
    from discount_engine import CATEGORY_ELASTICITY
    elasticity = abs(CATEGORY_ELASTICITY.get(category, -1.5))
    urgency_boost = 1.0 + (1.0 / max(1, days)) * 0.35
    
    base_sold = max(0.0, stock - baseline_unsold_ml)
    uplift = base_sold * (discount_rate * elasticity * urgency_boost)
    if uplift < (stock * discount_rate * 0.4):
        uplift = stock * discount_rate * 0.4
        
    additional_sold = min(baseline_unsold_ml, uplift)
    simulated_sold = min(stock, base_sold + additional_sold)
    simulated_unsold = max(0.0, stock - simulated_sold)
    
    simulated_revenue = round(simulated_sold * discounted_price, 2)
    baseline_revenue = round(base_sold * price, 2)
    waste_avoided = round(baseline_unsold_ml - simulated_unsold, 1)
    revenue_delta = round(simulated_revenue - baseline_revenue, 2)
    profit = round(simulated_revenue - (stock * cost), 2)
    
    return jsonify({
        'ml_model_baseline': {
            'predicted_unsold_quantity': baseline_unsold_ml,
            'waste_percentage': ml_pred['expected_waste_percentage'],
            'waste_value': ml_pred['estimated_waste_value'],
            'risk_category': ml_pred['risk_category'],
            'base_revenue': baseline_revenue
        },
        'simulation_assumptions': {
            'stock_quantity': stock,
            'days_until_expiry': days,
            'avg_daily_sales': demand_rate,
            'selling_price': price,
            'cost_price': cost,
            'discount_percent': discount_pct,
            'discounted_price': discounted_price,
            'category_elasticity': elasticity
        },
        'simulated_outcomes': {
            'expected_total_sold': round(simulated_sold, 1),
            'additional_units_sold': round(additional_sold, 1),
            'remaining_unsold': round(simulated_unsold, 1),
            'simulated_waste_pct': round((simulated_unsold / max(1, stock)) * 100.0, 1),
            'simulated_revenue': simulated_revenue,
            'revenue_delta': revenue_delta,
            'waste_avoided_kg': waste_avoided,
            'co2_saved_kg': round(waste_avoided * 2.5, 2),
            'gross_profit': profit
        }
    }), 200

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    products = get_all_products()
    
    # 1. Category waste comparison
    cat_stats = {}
    # 2. Expiry Countdown vs Waste curve
    expiry_buckets = {1: {'day': '1 Day', 'waste': 0.0, 'stock': 0.0},
                      2: {'day': '2 Days', 'waste': 0.0, 'stock': 0.0},
                      3: {'day': '3 Days', 'waste': 0.0, 'stock': 0.0},
                      4: {'day': '4-5 Days', 'waste': 0.0, 'stock': 0.0},
                      6: {'day': '6+ Days', 'waste': 0.0, 'stock': 0.0}}
                      
    for p in products:
        cat = p['category']
        stock = float(p['stock_quantity'])
        days = int(p['days_until_expiry'])
        pred = predictor.predict_unsold(p)
        unsold = pred['predicted_unsold_quantity']
        
        if cat not in cat_stats:
            cat_stats[cat] = {
                'category': cat,
                'total_stock': 0.0,
                'predicted_waste': 0.0,
                'waste_avoided': 0.0,
                'base_revenue': 0.0,
                'optimized_revenue': 0.0
            }
        cat_stats[cat]['total_stock'] += stock
        cat_stats[cat]['predicted_waste'] += unsold
        
        # Scenarios
        rec = evaluate_discount_scenarios(p['product_name'], cat, stock, float(p['selling_price']), float(p['cost_price']), days, unsold)
        cat_stats[cat]['waste_avoided'] += rec['recommended']['waste_avoided_kg']
        cat_stats[cat]['base_revenue'] += (stock - unsold) * float(p['selling_price'])
        cat_stats[cat]['optimized_revenue'] += rec['recommended']['estimated_revenue']
        
        # Expiry buckets
        b_key = 1 if days <= 1 else (2 if days == 2 else (3 if days == 3 else (4 if days <= 5 else 6)))
        expiry_buckets[b_key]['waste'] += unsold
        expiry_buckets[b_key]['stock'] += stock
        
    category_chart_data = []
    for k, v in cat_stats.items():
        category_chart_data.append({
            'category': k,
            'total_stock': round(v['total_stock'], 1),
            'predicted_waste': round(v['predicted_waste'], 1),
            'waste_avoided': round(v['waste_avoided'], 1),
            'base_revenue': round(v['base_revenue'], 2),
            'optimized_revenue': round(v['optimized_revenue'], 2)
        })
        
    expiry_trend_data = [
        {
            'shelf_life': v['day'],
            'predicted_waste_kg': round(v['waste'], 1),
            'total_stock_kg': round(v['stock'], 1),
            'waste_rate_pct': round((v['waste'] / max(1.0, v['stock'])) * 100.0, 1)
        }
        for v in expiry_buckets.values()
    ]
    
    # Elasticity demand curve simulation for presentation
    elasticity_curve = [
        {'discount': '0%', 'discount_pct': 0, 'Bakery_Demand_Index': 100, 'Produce_Demand_Index': 100, 'Meat_Demand_Index': 100},
        {'discount': '10%', 'discount_pct': 10, 'Bakery_Demand_Index': 118, 'Produce_Demand_Index': 114, 'Meat_Demand_Index': 116},
        {'discount': '20%', 'discount_pct': 20, 'Bakery_Demand_Index': 137, 'Produce_Demand_Index': 129, 'Meat_Demand_Index': 132},
        {'discount': '30%', 'discount_pct': 30, 'Bakery_Demand_Index': 155, 'Produce_Demand_Index': 143, 'Meat_Demand_Index': 148},
        {'discount': '40%', 'discount_pct': 40, 'Bakery_Demand_Index': 174, 'Produce_Demand_Index': 158, 'Meat_Demand_Index': 164}
    ]
    
    return jsonify({
        'category_comparison': category_chart_data,
        'expiry_trends': expiry_trend_data,
        'elasticity_curve': elasticity_curve,
        'sustainability_metrics': {
            'emissions_factor_kg_co2_per_kg_food': 2.5,
            'water_factor_liters_per_kg_food': 1000,
            'meal_equivalent_kg': 0.42
        }
    }), 200

@app.route('/api/model/metrics', methods=['GET'])
def get_metrics_endpoint():
    metrics = predictor.get_metrics()
    return jsonify(metrics), 200

@app.route('/api/model/retrain', methods=['POST'])
def retrain_model_endpoint():
    try:
        pipeline, metrics = train_and_evaluate()
        predictor.load_model()
        return jsonify({
            'message': 'Model pipeline successfully retrained and reloaded into memory',
            'metrics': metrics
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("[Flask App] Starting server on http://localhost:5000 ...")
    app.run(host='0.0.0.0', port=5000, debug=False)
