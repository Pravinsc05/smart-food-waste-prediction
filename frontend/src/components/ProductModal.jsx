import React, { useState, useEffect } from 'react';
import { X, Save, Sparkles, AlertCircle } from 'lucide-react';

const CATEGORIES = ['Produce', 'Dairy', 'Bakery', 'Meat & Seafood', 'Packaged Food', 'Deli & Prepared'];
const DEMAND_LEVELS = ['Low', 'Medium', 'High'];
const SEASONS = ['Spring', 'Summer', 'Fall', 'Winter'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ProductModal({ isOpen, onClose, onSave, product = null, isSaving = false }) {
  const [formData, setFormData] = useState({
    product_name: '',
    category: 'Produce',
    stock_quantity: 25,
    selling_price: 3.99,
    cost_price: 2.10,
    days_until_expiry: 3,
    avg_daily_sales: 8.0,
    freshness_score: 75.0,
    historical_demand: 'Medium',
    seasonality: 'Summer',
    day_of_week: 'Friday'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setFormData({
        product_name: product.product_name || '',
        category: product.category || 'Produce',
        stock_quantity: product.stock_quantity ?? 25,
        selling_price: product.selling_price ?? 3.99,
        cost_price: product.cost_price ?? 2.10,
        days_until_expiry: product.days_until_expiry ?? 3,
        avg_daily_sales: product.avg_daily_sales ?? 8.0,
        freshness_score: product.freshness_score ?? 75.0,
        historical_demand: product.historical_demand || 'Medium',
        seasonality: product.seasonality || 'Summer',
        day_of_week: product.day_of_week || 'Friday'
      });
    } else {
      setFormData({
        product_name: '',
        category: 'Produce',
        stock_quantity: 25,
        selling_price: 3.99,
        cost_price: 2.10,
        days_until_expiry: 3,
        avg_daily_sales: 8.0,
        freshness_score: 75.0,
        historical_demand: 'Medium',
        seasonality: 'Summer',
        day_of_week: 'Friday'
      });
    }
    setErrors({});
  }, [product, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.product_name.trim()) errs.product_name = 'Product name is required';
    if (Number(formData.stock_quantity) <= 0) errs.stock_quantity = 'Stock quantity must be > 0';
    if (Number(formData.selling_price) <= 0) errs.selling_price = 'Selling price must be > 0';
    if (Number(formData.cost_price) <= 0) errs.cost_price = 'Cost price must be > 0';
    if (Number(formData.days_until_expiry) < 0) errs.days_until_expiry = 'Expiry days cannot be negative';
    if (Number(formData.avg_daily_sales) <= 0) errs.avg_daily_sales = 'Daily sales must be > 0';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave({
        ...formData,
        stock_quantity: Number(formData.stock_quantity),
        selling_price: Number(formData.selling_price),
        cost_price: Number(formData.cost_price),
        days_until_expiry: parseInt(formData.days_until_expiry, 10),
        avg_daily_sales: Number(formData.avg_daily_sales),
        freshness_score: Number(formData.freshness_score)
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {product ? 'Edit Inventory Product' : 'Add New Food Product'}
              </h2>
              <p className="text-xs text-slate-400">
                Machine learning model will automatically evaluate unsold waste risk
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.product_name}
                onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                placeholder="e.g. Organic Strawberries 400g"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
              />
              {errors.product_name && (
                <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.product_name}
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 text-sm"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Stock Quantity */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Stock Quantity (kg / units) *
              </label>
              <input
                type="number"
                step="any"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 text-sm"
              />
              {errors.stock_quantity && <p className="text-xs text-rose-400 mt-1">{errors.stock_quantity}</p>}
            </div>

            {/* Selling Price */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Selling Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.selling_price}
                onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 text-sm"
              />
              {errors.selling_price && <p className="text-xs text-rose-400 mt-1">{errors.selling_price}</p>}
            </div>

            {/* Cost Price */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Cost Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.cost_price}
                onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 text-sm"
              />
              {errors.cost_price && <p className="text-xs text-rose-400 mt-1">{errors.cost_price}</p>}
            </div>

            {/* Days to Expiry */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Days Remaining Until Expiry *
              </label>
              <input
                type="number"
                value={formData.days_until_expiry}
                onChange={(e) => setFormData({ ...formData, days_until_expiry: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 text-sm"
              />
              {errors.days_until_expiry && <p className="text-xs text-rose-400 mt-1">{errors.days_until_expiry}</p>}
            </div>

            {/* Avg Daily Sales */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Historical Avg Daily Sales *
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.avg_daily_sales}
                onChange={(e) => setFormData({ ...formData, avg_daily_sales: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 text-sm"
              />
              {errors.avg_daily_sales && <p className="text-xs text-rose-400 mt-1">{errors.avg_daily_sales}</p>}
            </div>

            {/* Demand Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Demand Level
              </label>
              <select
                value={formData.historical_demand}
                onChange={(e) => setFormData({ ...formData, historical_demand: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 text-sm"
              >
                {DEMAND_LEVELS.map(d => <option key={d} value={d}>{d} Demand</option>)}
              </select>
            </div>

            {/* Freshness Score */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Freshness Level (0-100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.freshness_score}
                onChange={(e) => setFormData({ ...formData, freshness_score: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>

            {/* Seasonality */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Season
              </label>
              <select
                value={formData.seasonality}
                onChange={(e) => setFormData({ ...formData, seasonality: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 text-sm"
              >
                {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Day of Week */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Day of the Week
              </label>
              <select
                value={formData.day_of_week}
                onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 text-sm"
              >
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition shadow-lg shadow-emerald-900/30 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Processing...' : (product ? 'Save Changes' : 'Add to Inventory')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
