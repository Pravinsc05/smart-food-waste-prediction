import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Upload, 
  Download, 
  RotateCcw,
  Sparkles,
  ArrowUpDown,
  Tag
} from 'lucide-react';
import CategoryBadge from '../components/CategoryBadge';
import RiskBadge from '../components/RiskBadge';

const CATEGORIES = ['All', 'Produce', 'Dairy', 'Bakery', 'Meat & Seafood', 'Packaged Food', 'Deli & Prepared'];
const RISK_FILTERS = ['All Risks', 'High Risk', 'Medium Risk', 'Low Risk'];

export default function Inventory({ 
  inventory = [], 
  onAddProduct, 
  onEditProduct, 
  onDeleteProduct, 
  onResetDefault, 
  onImportCsv,
  onSelectForDiscount,
  onNavigate,
  isLoading 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRisk, setSelectedRisk] = useState('All Risks');
  const [sortField, setSortField] = useState('days_until_expiry');
  const [sortAsc, setSortAsc] = useState(true);
  const [isImporting, setIsImporting] = useState(false);

  // Filter & Sort
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = item.product_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const risk = item.prediction?.risk_category || 'Low';
      const matchesRisk = 
        selectedRisk === 'All Risks' || 
        (selectedRisk === 'High Risk' && risk === 'High') ||
        (selectedRisk === 'Medium Risk' && risk === 'Medium') ||
        (selectedRisk === 'Low Risk' && risk === 'Low');

      return matchesSearch && matchesCategory && matchesRisk;
    }).sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (typeof aVal === 'string') {
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortAsc ? aVal - bVal : bVal - aVal;
    });
  }, [inventory, searchTerm, selectedCategory, selectedRisk, sortField, sortAsc]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsImporting(true);
      await onImportCsv(file);
    } catch (err) {
      alert(`Import error: ${err.message}`);
    } finally {
      setIsImporting(false);
      e.target.value = '';
    }
  };

  const handleExportCsv = () => {
    if (inventory.length === 0) return;
    const headers = [
      'product_name', 'category', 'stock_quantity', 'selling_price', 'cost_price',
      'days_until_expiry', 'avg_daily_sales', 'freshness_score', 'historical_demand',
      'seasonality', 'day_of_week', 'predicted_unsold', 'recommended_discount_pct'
    ];
    const rows = inventory.map(item => [
      `"${item.product_name}"`,
      `"${item.category}"`,
      item.stock_quantity,
      item.selling_price,
      item.cost_price,
      item.days_until_expiry,
      item.avg_daily_sales,
      item.freshness_score,
      `"${item.historical_demand}"`,
      `"${item.seasonality}"`,
      `"${item.day_of_week}"`,
      item.prediction?.predicted_unsold_quantity || 0,
      item.recommendation?.discount_percent || 0
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `food_inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 flex-1">
          {/* Search Input */}
          <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search food item..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
          </select>

          {/* Risk Filter */}
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            {RISK_FILTERS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <label className="cursor-pointer px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white transition flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <span>{isImporting ? 'Importing...' : 'Import CSV'}</span>
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              onChange={handleFileUpload} 
              disabled={isImporting}
            />
          </label>

          <button
            onClick={handleExportCsv}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white transition flex items-center gap-1.5"
            title="Download CSV inventory report"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onResetDefault}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-400 hover:text-white transition flex items-center gap-1.5"
            title="Reset database to sample demonstration inventory"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>

          <button
            onClick={onAddProduct}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-lg shadow-emerald-950/40 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Product</span>
          </button>
        </div>
      </div>

      {/* Inventory Table Card */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('product_name')}>
                  <div className="flex items-center gap-1">
                    <span>Product Details</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3.5 px-3">Category</th>
                <th className="py-3.5 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('stock_quantity')}>
                  <div className="flex items-center gap-1">
                    <span>Stock</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3.5 px-3 cursor-pointer hover:text-white" onClick={() => handleSort('days_until_expiry')}>
                  <div className="flex items-center gap-1">
                    <span>Shelf Life</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3.5 px-3">Prices (Sell/Cost)</th>
                <th className="py-3.5 px-3">Daily Velocity</th>
                <th className="py-3.5 px-3">ML Predicted Waste</th>
                <th className="py-3.5 px-3">Risk Level</th>
                <th className="py-3.5 px-3">Dynamic Discount</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No products match the selected filters or search query.
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => {
                  const pred = item.prediction || {};
                  const rec = item.recommendation || {};
                  const isExpiringSoon = item.days_until_expiry <= 1;

                  return (
                    <tr key={item.id} className="hover:bg-slate-850/50 transition duration-150">
                      {/* Product Name & Demand info */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-white tracking-tight">{item.product_name}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>Freshness: {item.freshness_score}%</span>
                          <span>•</span>
                          <span>{item.historical_demand} Demand</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <CategoryBadge category={item.category} size="xs" />
                      </td>

                      {/* Stock Quantity */}
                      <td className="py-3 px-3 font-semibold text-slate-200">
                        {item.stock_quantity} <span className="text-slate-500 text-[10px]">kg</span>
                      </td>

                      {/* Days until expiry */}
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded font-bold ${
                          isExpiringSoon 
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                            : item.days_until_expiry <= 3
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {item.days_until_expiry === 0 ? 'Today!' : `${item.days_until_expiry} d`}
                        </span>
                      </td>

                      {/* Prices */}
                      <td className="py-3 px-3 text-slate-300">
                        <div>
                          <span className="font-bold text-emerald-400">${item.selling_price.toFixed(2)}</span>
                          <span className="text-slate-500 text-[10px] ml-1.5">(${item.cost_price.toFixed(2)})</span>
                        </div>
                      </td>

                      {/* Daily velocity */}
                      <td className="py-3 px-3 text-slate-300">
                        {item.avg_daily_sales} <span className="text-[10px] text-slate-500">/day</span>
                      </td>

                      {/* ML Predicted Unsold Waste */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-rose-400">
                          {pred.predicted_unsold_quantity ?? '-'} kg
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {pred.expected_waste_percentage ?? '-'}% of stock
                        </div>
                      </td>

                      {/* Risk Category */}
                      <td className="py-3 px-3">
                        <RiskBadge risk={pred.risk_category} />
                      </td>

                      {/* Recommended Dynamic Discount */}
                      <td className="py-3 px-3">
                        {rec.discount_percent > 0 ? (
                          <button
                            onClick={() => {
                              if (onSelectForDiscount) onSelectForDiscount(item);
                              onNavigate('discounts');
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 transition"
                          >
                            <Tag className="w-3 h-3 text-emerald-400" />
                            <span>{rec.discount_percent}% Off (${rec.discounted_price})</span>
                          </button>
                        ) : (
                          <span className="text-slate-500 text-[11px] font-medium">Standard Price</span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onEditProduct(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            title="Edit product attributes"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteProduct(item.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                            title="Delete item from inventory"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer info */}
        <div className="px-4 py-3 bg-slate-950/40 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <span className="font-semibold text-white">{filteredInventory.length}</span> of <span className="font-semibold text-white">{inventory.length}</span> items
          </div>
          <div className="text-[11px] text-slate-500">
            * All waste metrics generated live via Scikit-Learn Random Forest Pipeline
          </div>
        </div>
      </div>
    </div>
  );
}
