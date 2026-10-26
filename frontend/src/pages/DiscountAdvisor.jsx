import React, { useState, useEffect } from 'react';
import { 
  BadgePercent, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
  DollarSign, 
  Leaf,
  Scale,
  Award
} from 'lucide-react';
import { api } from '../services/api';
import CategoryBadge from '../components/CategoryBadge';
import RiskBadge from '../components/RiskBadge';

export default function DiscountAdvisor({ 
  inventory = [], 
  selectedProduct = null,
  onApplyDiscountToInventory 
}) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [discountData, setDiscountData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedProduct) {
      setSelectedItem(selectedProduct);
      fetchRecommendation(selectedProduct);
    } else if (inventory.length > 0 && !selectedItem) {
      setSelectedItem(inventory[0]);
      fetchRecommendation(inventory[0]);
    }
  }, [selectedProduct, inventory]);

  const fetchRecommendation = async (item) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.getDiscountRecommendations({
        product_name: item.product_name,
        category: item.category,
        stock_quantity: Number(item.stock_quantity),
        selling_price: Number(item.selling_price),
        cost_price: Number(item.cost_price),
        days_until_expiry: parseInt(item.days_until_expiry, 10),
        historical_demand: item.historical_demand || 'Medium',
        predicted_unsold: item.prediction?.predicted_unsold_quantity
      });
      setDiscountData(res);
    } catch (err) {
      setError(err.message || 'Failed to load discount recommendation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectProductChange = (e) => {
    const id = e.target.value;
    const found = inventory.find(i => String(i.id) === String(id));
    if (found) {
      setSelectedItem(found);
      fetchRecommendation(found);
    }
  };

  return (
    <div className="space-y-6">
      {/* Policy Transparency Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30 mb-2">
            <Scale className="w-3.5 h-3.5" />
            <span>Retail Econometric Optimization</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Dynamic Discount Recommendation Engine
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
            Recommends markdown tiers based on ML unsold forecasts, price elasticity, shelf-life countdown, and cost margin protection.
          </p>
        </div>

        {/* Product selector */}
        <div className="w-full md:w-80 bg-slate-900/90 border border-slate-700/80 p-3 rounded-xl shrink-0">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Evaluate Inventory SKU
          </label>
          <select
            value={selectedItem?.id || ''}
            onChange={handleSelectProductChange}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            {inventory.map(item => (
              <option key={item.id} value={item.id}>
                {item.product_name} ({item.days_until_expiry}d left • {item.stock_quantity} kg)
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400">Evaluating multi-scenario micro-economic tradeoffs...</p>
        </div>
      ) : discountData ? (
        <div className="space-y-6">
          {/* Best Recommended Scenario Showcase */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/90 via-slate-900 to-slate-950 border-2 border-emerald-500/50 p-6 shadow-2xl">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              {/* Left Column: Recommendation Summary */}
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-slate-950 shadow-md">
                    <Award className="w-3.5 h-3.5" />
                    <span>OPTIMAL RECOMMENDATION</span>
                  </span>
                  <CategoryBadge category={discountData.category} size="xs" />
                  <span className="text-xs text-slate-400">
                    Baseline Policy: {discountData.baseline_policy_benchmark?.label}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-white tracking-tight">
                  Apply {discountData.recommended.discount_percent}% Discount on {discountData.product_name}
                </h3>

                {/* Explanation text */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <div className="font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Algorithmic Rationale & Strategy:</span>
                  </div>
                  "{discountData.recommended.reason}"
                </div>
              </div>

              {/* Right Column: Pricing & Financial Highlights Card */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 min-w-[280px] shrink-0 space-y-3">
                <div className="flex items-baseline justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs text-slate-400 font-medium">Original vs New Price</span>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 line-through mr-2">
                      ${discountData.original_price.toFixed(2)}
                    </span>
                    <span className="text-2xl font-extrabold text-emerald-400">
                      ${discountData.recommended.discounted_price.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Additional Sold</div>
                    <div className="font-bold text-white">+{discountData.recommended.expected_additional_units_sold} units</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Waste Rescued</div>
                    <div className="font-bold text-emerald-400">{discountData.recommended.waste_avoided_kg} kg ({discountData.recommended.waste_reduction_pct}%)</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Est. Revenue</div>
                    <div className="font-bold text-white">${discountData.recommended.estimated_revenue.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Profit Margin</div>
                    <div className={`font-bold ${discountData.recommended.unit_margin >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {discountData.recommended.margin_percent}% (${discountData.recommended.unit_margin})
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Multi-Scenario Comparison Table (0%, 10%, 20%, 30%, 40%) */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Discount Scenario Matrix Comparison</h3>
                <p className="text-xs text-slate-400">Evaluating 10%, 20%, 30%, and 40% markdown options against 0% standard pricing</p>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cost Price Floor: ${discountData.cost_price.toFixed(2)}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Discount Tier</th>
                    <th className="py-3 px-3">Price / Margin</th>
                    <th className="py-3 px-3">Units Sold</th>
                    <th className="py-3 px-3">Remaining Waste</th>
                    <th className="py-3 px-3">Waste Avoided</th>
                    <th className="py-3 px-3">Est. Revenue</th>
                    <th className="py-3 px-3">Profitability</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {discountData.scenarios.map((sc) => {
                    const isSelected = sc.discount_percent === discountData.recommended.discount_percent;

                    return (
                      <tr 
                        key={sc.discount_percent}
                        className={`transition-colors ${
                          isSelected ? 'bg-emerald-950/25 border-l-4 border-l-emerald-500' : 'hover:bg-slate-850/40'
                        }`}
                      >
                        {/* Discount Tier */}
                        <td className="py-3.5 px-4 font-bold text-white">
                          <div className="flex items-center gap-2">
                            <span>{sc.discount_percent}% Discount</span>
                            {isSelected && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-black border border-emerald-500/40">
                                BEST
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Price / Margin */}
                        <td className="py-3.5 px-3">
                          <div className="font-semibold text-slate-200">${sc.discounted_price.toFixed(2)}</div>
                          <div className={`text-[10px] ${sc.unit_margin >= 0 ? 'text-slate-400' : 'text-rose-400 font-bold'}`}>
                            Margin: {sc.margin_percent}% (${sc.unit_margin.toFixed(2)})
                          </div>
                        </td>

                        {/* Units Sold */}
                        <td className="py-3.5 px-3 font-semibold text-slate-200">
                          {sc.expected_units_sold} <span className="text-slate-500 text-[10px]">units</span>
                          {sc.additional_units_sold > 0 && (
                            <span className="text-emerald-400 text-[10px] ml-1">(+{sc.additional_units_sold})</span>
                          )}
                        </td>

                        {/* Remaining Waste */}
                        <td className="py-3.5 px-3 font-semibold text-rose-400">
                          {sc.unsold_quantity} kg
                        </td>

                        {/* Waste Avoided */}
                        <td className="py-3.5 px-3">
                          <span className="font-bold text-emerald-400">+{sc.waste_avoided_kg} kg</span>
                          <span className="text-slate-500 text-[10px] ml-1">({sc.waste_reduction_pct}%)</span>
                        </td>

                        {/* Estimated Revenue */}
                        <td className="py-3.5 px-3 font-bold text-white">
                          ${sc.estimated_revenue.toFixed(2)}
                        </td>

                        {/* Profitability */}
                        <td className="py-3.5 px-3">
                          {sc.is_profitable ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px] font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Profitable
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-400 text-[11px] font-semibold">
                              <AlertCircle className="w-3.5 h-3.5" /> Below Cost
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center">
                          {isSelected ? (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              Recommended
                            </span>
                          ) : (
                            <span className="text-slate-500 text-xs">Alternative</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Note */}
            <div className="mt-4 pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>{discountData.methodology_note}</span>
              <span className="text-slate-500">Configurable retail optimization rules</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
