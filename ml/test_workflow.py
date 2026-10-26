"""
End-to-End Workflow Verification Test
"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.app import app

def test_full_workflow():
    client = app.test_client()

    # 1. Health check
    res = client.get('/api/health')
    assert res.status_code == 200, f"Health failed: {res.status_code}"
    print("1. Health check: PASSED")

    # 2. Add product
    new_item = {
        'product_name': 'Test Fresh Strawberries',
        'category': 'Produce',
        'stock_quantity': 50.0,
        'selling_price': 5.00,
        'cost_price': 2.50,
        'days_until_expiry': 2,
        'avg_daily_sales': 12.0,
        'freshness_score': 50.0,
        'historical_demand': 'Medium',
        'seasonality': 'Summer',
        'day_of_week': 'Saturday'
    }
    res = client.post('/api/inventory', json=new_item)
    assert res.status_code == 201, f"Create product failed: {res.status_code}"
    data = res.get_json()
    product_id = data['id']
    print(f"2. Add product: PASSED (id={product_id})")

    # 3. Predict unsold waste
    res = client.post('/api/predict', json=new_item)
    assert res.status_code == 200
    pred = res.get_json()
    print(f"3. ML Prediction: PASSED (unsold={pred['predicted_unsold_quantity']} kg, risk={pred['risk_category']})")

    # 4. Generate discount recommendations & scenarios
    res = client.post('/api/recommend-discount', json=new_item)
    assert res.status_code == 200
    rec = res.get_json()
    print(f"4. Discount Scenarios: PASSED (recommended={rec['recommended']['discount_percent']}%, price=${rec['recommended']['discounted_price']})")

    # 5. Run simulation
    sim_req = {
        'stock_quantity': 50.0,
        'days_until_expiry': 2,
        'avg_daily_sales': 12.0,
        'selling_price': 5.00,
        'discount_percent': 20.0,
        'category': 'Produce'
    }
    res = client.post('/api/simulate', json=sim_req)
    assert res.status_code == 200
    sim = res.get_json()
    print(f"5. What-If Simulator: PASSED (simulated revenue=${sim['simulated_outcomes']['simulated_revenue']})")

    # 6. Check updated dashboard stats
    res = client.get('/api/dashboard')
    assert res.status_code == 200
    dash = res.get_json()
    print(f"6. Dashboard Aggregation: PASSED (total products={dash['total_products']}, predicted waste={dash['predicted_waste_kg']} kg)")

    # 7. Delete test product
    res = client.delete(f'/api/inventory/{product_id}')
    assert res.status_code == 200
    print("7. Delete product: PASSED")

    print("\n==========================================")
    print(" ALL END-TO-END WORKFLOW TESTS PASSED! ")
    print("==========================================")

if __name__ == '__main__':
    test_full_workflow()
