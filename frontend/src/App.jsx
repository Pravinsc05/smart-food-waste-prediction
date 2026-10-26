import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ProductModal from './components/ProductModal';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import WastePrediction from './pages/WastePrediction';
import DiscountAdvisor from './pages/DiscountAdvisor';
import Simulator from './pages/Simulator';
import Analytics from './pages/Analytics';
import ModelPerformance from './pages/ModelPerformance';
import ProjectInfo from './pages/ProjectInfo';
import { api } from './services/api';
import { AlertCircle, WifiOff } from 'lucide-react';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedProductForDiscount, setSelectedProductForDiscount] = useState(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Loading & error state
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [backendOffline, setBackendOffline] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setBackendOffline(false);
      const [dash, inv] = await Promise.all([
        api.getDashboard(),
        api.getInventory()
      ]);
      setDashboardData(dash);
      setInventory(inv);
    } catch (err) {
      console.warn('Backend connection issue, falling back to simulated store data:', err.message);
      setBackendOffline(true);
      // Fallback robust local data if server not running yet
      loadFallbackData();
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const loadFallbackData = () => {
    const sampleItems = [
      {
        id: 1, product_name: 'Organic Strawberries 400g', category: 'Produce', stock_quantity: 48,
        selling_price: 4.99, cost_price: 2.50, days_until_expiry: 2, avg_daily_sales: 14,
        freshness_score: 40, historical_demand: 'Medium', seasonality: 'Summer', day_of_week: 'Friday',
        prediction: { predicted_unsold_quantity: 20.0, expected_waste_percentage: 41.7, estimated_waste_value: 50.0, risk_category: 'High' },
        recommendation: { discount_percent: 25, discounted_price: 3.74, waste_avoided_kg: 14.5, reason: 'Near expiry markdown clears stock rapidly.' }
      },
      {
        id: 2, product_name: 'Artisan Sourdough Loaf', category: 'Bakery', stock_quantity: 35,
        selling_price: 5.50, cost_price: 2.10, days_until_expiry: 1, avg_daily_sales: 15,
        freshness_score: 30, historical_demand: 'High', seasonality: 'Fall', day_of_week: 'Saturday',
        prediction: { predicted_unsold_quantity: 16.5, expected_waste_percentage: 47.1, estimated_waste_value: 34.65, risk_category: 'High' },
        recommendation: { discount_percent: 30, discounted_price: 3.85, waste_avoided_kg: 13.0, reason: 'Urgent final day clearance stimulates demand.' }
      },
      {
        id: 3, product_name: 'Whole Fresh Milk 1L', category: 'Dairy', stock_quantity: 65,
        selling_price: 2.80, cost_price: 1.70, days_until_expiry: 3, avg_daily_sales: 22,
        freshness_score: 65, historical_demand: 'Medium', seasonality: 'Winter', day_of_week: 'Tuesday',
        prediction: { predicted_unsold_quantity: 5.0, expected_waste_percentage: 7.7, estimated_waste_value: 8.50, risk_category: 'Low' },
        recommendation: { discount_percent: 10, discounted_price: 2.52, waste_avoided_kg: 4.0, reason: 'High velocity will clear stock naturally.' }
      },
      {
        id: 4, product_name: 'Fresh Atlantic Salmon Fillet', category: 'Meat & Seafood', stock_quantity: 24,
        selling_price: 18.99, cost_price: 12.50, days_until_expiry: 2, avg_daily_sales: 6,
        freshness_score: 50, historical_demand: 'Low', seasonality: 'Spring', day_of_week: 'Wednesday',
        prediction: { predicted_unsold_quantity: 11.2, expected_waste_percentage: 46.7, estimated_waste_value: 140.0, risk_category: 'High' },
        recommendation: { discount_percent: 20, discounted_price: 15.19, waste_avoided_kg: 7.5, reason: 'High item value salvage preserves capital.' }
      }
    ];

    setInventory(sampleItems);
    setDashboardData({
      total_products: 4,
      nearing_expiry_count: 3,
      total_stock_kg: 172.0,
      predicted_waste_kg: 52.7,
      waste_value_dollars: 233.15,
      estimated_revenue_saved: 185.40,
      waste_reduction_percentage: 69.4,
      immediate_action_count: 3,
      co2_saved_kg: 92.2,
      category_breakdown: [
        { category: 'Produce', total_stock: 48, predicted_waste_kg: 20.0, waste_value: 50.0 },
        { category: 'Bakery', total_stock: 35, predicted_waste_kg: 16.5, waste_value: 34.65 },
        { category: 'Dairy', total_stock: 65, predicted_waste_kg: 5.0, waste_value: 8.50 },
        { category: 'Meat & Seafood', total_stock: 24, predicted_waste_kg: 11.2, waste_value: 140.0 }
      ],
      high_risk_alerts: [
        {
          id: 1, product_name: 'Organic Strawberries 400g', category: 'Produce', stock_quantity: 48,
          days_until_expiry: 2, predicted_unsold: 20.0, waste_percentage: 41.7, waste_value: 50.0,
          risk_category: 'High', recommended_discount: 25, reason: 'High waste risk; urgent clearance recommended.'
        },
        {
          id: 2, product_name: 'Artisan Sourdough Loaf', category: 'Bakery', stock_quantity: 35,
          days_until_expiry: 1, predicted_unsold: 16.5, waste_percentage: 47.1, waste_value: 34.65,
          risk_category: 'High', recommended_discount: 30, reason: 'Expiring in 1 day; high sales boost with 30% discount.'
        }
      ]
    });
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const handleSaveProduct = async (productData) => {
    try {
      setIsSaving(true);
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, productData);
      } else {
        await api.addProduct(productData);
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      await loadData();
    } catch (err) {
      alert(`Save error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.deleteProduct(id);
      await loadData();
    } catch (err) {
      alert(`Delete error: ${err.message}`);
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm('Reset inventory database to default demonstration products?')) return;
    try {
      await api.resetInventory();
      await loadData();
    } catch (err) {
      alert(`Reset error: ${err.message}`);
    }
  };

  const handleImportCsv = async (file) => {
    await api.importCsv(file);
    await loadData();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Responsive Collapsible Sidebar */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          activePage={activePage}
          setIsMobileOpen={setIsMobileOpen}
          onOpenAddModal={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        {/* Backend offline warning banner if needed */}
        {backendOffline && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Backend disconnected: showing offline preview dataset. Run <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-200">python backend/app.py</code> to connect live Flask API.
              </span>
            </div>
            <button 
              onClick={handleRefresh}
              className="text-[11px] underline font-bold hover:text-white"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activePage === 'dashboard' && (
            <Dashboard
              dashboardData={dashboardData}
              onNavigate={setActivePage}
              onSelectProductForDiscount={setSelectedProductForDiscount}
              isLoading={isLoading}
            />
          )}

          {activePage === 'inventory' && (
            <Inventory
              inventory={inventory}
              onAddProduct={() => {
                setEditingProduct(null);
                setIsModalOpen(true);
              }}
              onEditProduct={(prod) => {
                setEditingProduct(prod);
                setIsModalOpen(true);
              }}
              onDeleteProduct={handleDeleteProduct}
              onResetDefault={handleResetDefaults}
              onImportCsv={handleImportCsv}
              onSelectForDiscount={setSelectedProductForDiscount}
              onNavigate={setActivePage}
              isLoading={isLoading}
            />
          )}

          {activePage === 'prediction' && (
            <WastePrediction inventory={inventory} />
          )}

          {activePage === 'discounts' && (
            <DiscountAdvisor
              inventory={inventory}
              selectedProduct={selectedProductForDiscount}
            />
          )}

          {activePage === 'simulator' && (
            <Simulator />
          )}

          {activePage === 'analytics' && (
            <Analytics />
          )}

          {activePage === 'model' && (
            <ModelPerformance />
          )}

          {activePage === 'info' && (
            <ProjectInfo />
          )}
        </main>
      </div>

      {/* Add / Edit Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        product={editingProduct}
        isSaving={isSaving}
      />
    </div>
  );
}
