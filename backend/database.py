"""
Smart Food Waste Prediction & Dynamic Discount Recommendation System
Database Management (SQLite)
====================================================================
Manages persistent inventory storage, CRUD operations, bulk import,
and initial demo sample seeding.
"""

import os
import sqlite3
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), 'inventory.db')

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS inventory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_name TEXT NOT NULL,
            category TEXT NOT NULL,
            stock_quantity REAL NOT NULL,
            selling_price REAL NOT NULL,
            cost_price REAL NOT NULL,
            days_until_expiry INTEGER NOT NULL,
            avg_daily_sales REAL NOT NULL,
            freshness_score REAL DEFAULT 70.0,
            historical_demand TEXT DEFAULT 'Medium',
            seasonality TEXT DEFAULT 'Summer',
            day_of_week TEXT DEFAULT 'Friday',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    
    # Check if empty, if so, seed sample products
    cursor.execute('SELECT COUNT(*) FROM inventory')
    count = cursor.fetchone()[0]
    if count == 0:
        seed_sample_products(cursor)
        conn.commit()
        print(f"[Database] Initialized new database with sample products at {DB_PATH}")
    else:
        print(f"[Database] Connected to existing database with {count} records.")
    conn.close()

def seed_sample_products(cursor=None):
    close_at_end = False
    if cursor is None:
        conn = get_connection()
        cursor = conn.cursor()
        close_at_end = True
        
    sample_products = [
        ('Organic Strawberries 400g', 'Produce', 48.0, 4.99, 2.50, 2, 14.0, 40.0, 'Medium', 'Summer', 'Friday'),
        ('Artisan Sourdough Loaf', 'Bakery', 35.0, 5.50, 2.10, 1, 15.0, 30.0, 'High', 'Fall', 'Saturday'),
        ('Whole Fresh Milk 1L', 'Dairy', 65.0, 2.80, 1.70, 3, 22.0, 65.0, 'Medium', 'Winter', 'Tuesday'),
        ('Fresh Atlantic Salmon Fillet', 'Meat & Seafood', 24.0, 18.99, 12.50, 2, 6.0, 50.0, 'Low', 'Spring', 'Wednesday'),
        ('Baby Spinach Tub 250g', 'Produce', 42.0, 3.20, 1.40, 1, 12.0, 25.0, 'Medium', 'Spring', 'Thursday'),
        ('Authentic Greek Yogurt 500g', 'Dairy', 38.0, 4.50, 2.60, 5, 11.0, 75.0, 'High', 'Summer', 'Sunday'),
        ('Butter Croissants (4-Pack)', 'Bakery', 28.0, 4.99, 1.80, 1, 9.5, 35.0, 'Medium', 'Winter', 'Saturday'),
        ('Boneless Chicken Breast (kg)', 'Meat & Seafood', 36.0, 9.99, 6.20, 2, 10.0, 55.0, 'High', 'Fall', 'Friday'),
        ('Golden Rotisserie Chicken', 'Deli & Prepared', 20.0, 8.99, 4.50, 1, 13.0, 40.0, 'High', 'Summer', 'Sunday'),
        ('Fresh Egg Tagliatelle 250g', 'Packaged Food', 55.0, 3.99, 2.10, 6, 9.0, 85.0, 'Medium', 'Fall', 'Monday'),
        ('Ripe Hass Avocados (3-Pack)', 'Produce', 52.0, 2.99, 1.40, 2, 16.0, 50.0, 'High', 'Summer', 'Saturday'),
        ('Aged White Cheddar Block', 'Dairy', 26.0, 6.50, 3.90, 8, 4.5, 90.0, 'Low', 'Winter', 'Wednesday'),
        ('Crisp Caesar Salad Bowl', 'Deli & Prepared', 18.0, 5.99, 2.80, 1, 8.0, 30.0, 'Medium', 'Summer', 'Friday'),
        ('Organic Extra Firm Tofu', 'Packaged Food', 32.0, 3.49, 1.80, 7, 6.0, 80.0, 'Medium', 'Spring', 'Thursday'),
        ('Fresh Tiger Prawns 300g', 'Meat & Seafood', 16.0, 14.50, 9.20, 1, 5.0, 45.0, 'High', 'Summer', 'Saturday')
    ]
    
    cursor.executemany('''
        INSERT INTO inventory (
            product_name, category, stock_quantity, selling_price, cost_price,
            days_until_expiry, avg_daily_sales, freshness_score,
            historical_demand, seasonality, day_of_week
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', sample_products)
    
    if close_at_end:
        conn.commit()
        conn.close()

def get_all_products(category_filter=None, risk_filter=None):
    conn = get_connection()
    cursor = conn.cursor()
    if category_filter and category_filter != 'All':
        cursor.execute('SELECT * FROM inventory WHERE category = ? ORDER BY days_until_expiry ASC, id DESC', (category_filter,))
    else:
        cursor.execute('SELECT * FROM inventory ORDER BY days_until_expiry ASC, id DESC')
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_product_by_id(product_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM inventory WHERE id = ?', (product_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def add_product(item):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO inventory (
            product_name, category, stock_quantity, selling_price, cost_price,
            days_until_expiry, avg_daily_sales, freshness_score,
            historical_demand, seasonality, day_of_week
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        item.get('product_name', 'Unnamed Food Item'),
        item.get('category', 'Produce'),
        float(item.get('stock_quantity', 10)),
        float(item.get('selling_price', 4.99)),
        float(item.get('cost_price', 2.50)),
        int(item.get('days_until_expiry', 3)),
        float(item.get('avg_daily_sales', 5.0)),
        float(item.get('freshness_score', 70.0)),
        item.get('historical_demand', 'Medium'),
        item.get('seasonality', 'Summer'),
        item.get('day_of_week', 'Friday')
    ))
    new_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return get_product_by_id(new_id)

def update_product(product_id, item):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE inventory SET
            product_name = ?,
            category = ?,
            stock_quantity = ?,
            selling_price = ?,
            cost_price = ?,
            days_until_expiry = ?,
            avg_daily_sales = ?,
            freshness_score = ?,
            historical_demand = ?,
            seasonality = ?,
            day_of_week = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    ''', (
        item.get('product_name'),
        item.get('category'),
        float(item.get('stock_quantity')),
        float(item.get('selling_price')),
        float(item.get('cost_price')),
        int(item.get('days_until_expiry')),
        float(item.get('avg_daily_sales')),
        float(item.get('freshness_score', 70.0)),
        item.get('historical_demand', 'Medium'),
        item.get('seasonality', 'Summer'),
        item.get('day_of_week', 'Friday'),
        product_id
    ))
    conn.commit()
    conn.close()
    return get_product_by_id(product_id)

def delete_product(product_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM inventory WHERE id = ?', (product_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted

def bulk_insert(items):
    conn = get_connection()
    cursor = conn.cursor()
    for item in items:
        cursor.execute('''
            INSERT INTO inventory (
                product_name, category, stock_quantity, selling_price, cost_price,
                days_until_expiry, avg_daily_sales, freshness_score,
                historical_demand, seasonality, day_of_week
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            item.get('product_name', 'Imported Item'),
            item.get('category', 'Produce'),
            float(item.get('stock_quantity', 10)),
            float(item.get('selling_price', 3.99)),
            float(item.get('cost_price', 2.00)),
            int(item.get('days_until_expiry', 3)),
            float(item.get('avg_daily_sales', 4.0)),
            float(item.get('freshness_score', 60.0)),
            item.get('historical_demand', 'Medium'),
            item.get('seasonality', 'Summer'),
            item.get('day_of_week', 'Friday')
        ))
    conn.commit()
    conn.close()
    return len(items)

def reset_to_defaults():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM inventory')
    seed_sample_products(cursor)
    conn.commit()
    conn.close()
