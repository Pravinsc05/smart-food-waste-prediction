import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  DollarSign, 
  Trash2, 
  ShoppingBag,
  TrendingDown,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import CategoryBadge from '../components/CategoryBadge';
import RiskBadge from '../components/RiskBadge';

const CATEGORIES = ['Produce', 'Dairy', 'Bakery', 'Meat & Seafood', 'Packaged Food', 'Deli & Prepared'];
const DEMAND_LEVELS = ['Low', 'Medium', 'High'];
const SEASONS = ['Spring', 'Summer', 'Fall', 'Winter'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function WastePrediction({ inventory = [] }) {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [formData, setFormData] = useState({
    product_name: 'Custom Trial Product',
    category: 'Produce',
    stock_quantity: 45,
    avg_daily_sales: 10.0,
    days_until_expiry: 2,
    selling_price: 4.50,
    cost_price: 2.20,
    historical_demand: 'Medium',
    seasonality: 'Summer',
    day_of_week: 'Friday',
    freshness_score: 60.0
  });

  const [predictionResult, setPredictionResult] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [error, setError] = useState(null);

  const handleSelectProduct = (e) => {
    const id = e.target.value;
    setSelectedProductId(id);
    if (!id) return;
    const item = inventory.find(i => String(i.id) === String(id));
    if (item) {
      setFormData({
        product_name: item.product_name,
        category: item.category,
        stock_quantity: item.stock_quantity,
        avg_daily_sales: item.avg_daily_sales,
        days_until_expiry: item.days_until_expiry,
        selling_price: item.selling_price,
        cost_price: item.cost_price,
        historical_demand: item.historical_demand || 'Medium',
        seasonality: item.seasonality || 'Summer',
        day_of_week: item.day_of_week || 'Friday',
        freshness_score: item.freshness_score || 70.0
      });
      if (item.prediction) {
        setPredictionResult(item.prediction);
      }
    }
  };

  const handleRunPrediction = async (e) => {
    e?.preventDefault();
    try {
      setIsPredicting(true);
      setError(null);
      const res = await api.predictWaste({
        ...formData,
        stock_quantity: Number(formData.stock_quantity),
        avg_daily_sales: Number(formData.avg_daily_sales),
        days_until_expiry: parseInt(formData.days_until_expiry, 10),
        selling_price: Number(formData.selling_price),
        cost_price: Number(formData.cost_price),
        freshness_score: Number(formData.freshness_score)
      });
      setPredictionResult(res);
    } catch (err) {
      setError(err.message || 'Failed to generate prediction');
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Introduction banner */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 mb-2">
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Random Forest Regression Pipeline</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Perishable Food Waste Prediction Tool
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
            Evaluates shelf-life decay velocity, sales velocity, day-of-week surges, and price elasticity to predict unsold food quantity. Constraints strictly guarantee 0 ≤ predicted unsold ≤ stock.
          </p>
        </div>

        {/* Existing product picker shortcut */}
        <div className="w-full md:w-72 bg-slate-900/90 border border-slate-700/80 p-3 rounded-xl">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Quick Load Existing SKU
          </label>
          <select
            value={selectedProductId}
            onChange={handleSelectProduct}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="">-- Choose from inventory --</option>
            {inventory.map(item => (
              <option key={item.id} value={item.id}>
                {item.product_name} ({item.stock_quantity} kg, {item.days_until_expiry}d left)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Form Inputs (Left) and Prediction Results (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Inputs */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-6 border border-slate-800">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <span>Feature Inputs for Model</span>
            <span className="text-xs font-normal text-slate-400">({formData.product_name})</span>
          </h3>

          <form onSubmit={handleRunPrediction} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Product Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Product Title</label>
                <input
                  type="text"
                  value={formData.product_name}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Stock Quantity */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Available Stock (kg / units)</label>
                <input
                  type="number"
                  step="any"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Days Until Expiry */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Days Remaining Until Expiry</label>
                <input
                  type="number"
                  value={formData.days_until_expiry}
                  onChange={(e) => setFormData({ ...formData, days_until_expiry: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Avg Daily Sales */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Historical Daily Sales (velocity)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.avg_daily_sales}
                  onChange={(e) => setFormData({ ...formData, avg_daily_sales: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Selling Price */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Selling Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.selling_price}
                  onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Cost Price */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Cost Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.cost_price}
                  onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Historical Demand */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Demand Level</label>
                <select
                  value={formData.historical_demand}
                  onChange={(e) => setFormData({ ...formData, historical_demand: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {DEMAND_LEVELS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              {/* Day of Week */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Day of Week</label>
                <select
                  value={formData.day_of_week}
                  onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isPredicting}
              className="w-full py-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-98 transition shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <BrainCircuit className={`w-4 h-4 ${isPredicting ? 'animate-spin' : ''}`} />
              <span>{isPredicting ? 'Running Random Forest Model...' : 'Calculate Food Waste Prediction'}</span>
            </button>
          </form>
        </div>

        {/* Prediction Results & Risk Gauge */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white">Prediction Results</h3>
                {predictionResult && (
                  <RiskBadge risk={predictionResult.risk_category} />
                )}
              </div>

              {predictionResult ? (
                <div className="space-y-5">
                  {/* Big Number Waste KPI */}
                  <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Predicted Unsold Food Quantity
                    </div>
                    <div className="text-4xl font-black text-rose-400 mt-2 tracking-tight">
                      {predictionResult.predicted_unsold_quantity} <span className="text-lg font-bold text-slate-400">kg</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1 font-medium">
                      ({predictionResult.expected_waste_percentage}% of {formData.stock_quantity} kg total stock)
                    </div>

                    {/* Progress Bar Gauge */}
                    <div className="w-full bg-slate-800 h-3 rounded-full mt-4 overflow-hidden p-0.5 border border-slate-700">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          predictionResult.expected_waste_percentage >= 40 
                            ? 'bg-rose-500' 
                            : predictionResult.expected_waste_percentage >= 15 
                            ? 'bg-amber-500' 
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, predictionResult.expected_waste_percentage)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Financial & Environmental Impact Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Estimated Waste Value</div>
                      <div className="text-lg font-extrabold text-white mt-0.5">
                        ${predictionResult.estimated_waste_value?.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-400">At ${formData.cost_price}/kg cost</div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Expected Sales</div>
                      <div className="text-lg font-extrabold text-emerald-400 mt-0.5">
                        {predictionResult.expected_sales_quantity} kg
                      </div>
                      <div className="text-[10px] text-slate-400">Standard sales before expiry</div>
                    </div>
                  </div>

                  {/* Model Assurance Notes */}
                  <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-300 space-y-1.5">
                    <div className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Bounded Model Prediction Guarantee</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Generated by: {predictionResult.model_used}. Bounded rigorously to available inventory (min: 0, max: {formData.stock_quantity} kg). Zero target leakage.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-slate-500 space-y-2">
                  <BrainCircuit className="w-12 h-12 mx-auto text-slate-600 stroke-[1.5]" />
                  <p className="text-xs">Click "Calculate Food Waste Prediction" or select a product above to run the ML model.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
