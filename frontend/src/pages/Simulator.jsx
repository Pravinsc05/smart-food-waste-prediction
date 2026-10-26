import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  BrainCircuit, 
  Sparkles, 
  DollarSign, 
  Trash2, 
  TrendingUp, 
  Leaf,
  Layers,
  ArrowRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { api } from '../services/api';
import CategoryBadge from '../components/CategoryBadge';
import RiskBadge from '../components/RiskBadge';

const CATEGORIES = ['Produce', 'Dairy', 'Bakery', 'Meat & Seafood', 'Packaged Food', 'Deli & Prepared'];

export default function Simulator() {
  const [params, setParams] = useState({
    category: 'Produce',
    stock_quantity: 60,
    days_until_expiry: 2,
    avg_daily_sales: 15,
    selling_price: 4.99,
    cost_price: 2.50,
    discount_percent: 25
  });

  const [simResult, setSimResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Debounced auto-simulation on slider adjustment
  useEffect(() => {
    let isMounted = true;
    const runSim = async () => {
      try {
        setIsSimulating(true);
        const res = await api.runSimulation(params);
        if (isMounted) setSimResult(res);
      } catch (err) {
        console.error('Simulation error:', err);
      } finally {
        if (isMounted) setIsSimulating(false);
      }
    };

    const timer = setTimeout(runSim, 200);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [params]);

  const handleResetDefaults = () => {
    setParams({
      category: 'Produce',
      stock_quantity: 60,
      days_until_expiry: 2,
      avg_daily_sales: 15,
      selling_price: 4.99,
      cost_price: 2.50,
      discount_percent: 25
    });
  };

  const ml = simResult?.ml_model_baseline || {};
  const sim = simResult?.simulated_outcomes || {};
  const assump = simResult?.simulation_assumptions || {};

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 mb-2">
            <Sliders className="w-3.5 h-3.5" />
            <span>Interactive Scenario Lab</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            What-If Scenario Simulator
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
            Dynamically adjust inventory, perishability, daily velocity, and markdown discount rates. Inspect real-time comparisons between the ML unmitigated baseline and simulated outcome.
          </p>
        </div>

        <button
          onClick={handleResetDefaults}
          className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white transition flex items-center gap-1.5 shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Sliders Panel */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Simulation Sliders</span>
            </h3>
            <span className="text-[11px] text-slate-400">Reactive recalculation</span>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Food Category</label>
            <select
              value={params.category}
              onChange={(e) => setParams({ ...params, category: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Slider 1: Stock Quantity */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-300">Stock Quantity</span>
              <span className="font-bold text-emerald-400">{params.stock_quantity} kg</span>
            </div>
            <input
              type="range"
              min="5"
              max="200"
              step="5"
              value={params.stock_quantity}
              onChange={(e) => setParams({ ...params, stock_quantity: Number(e.target.value) })}
              className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>5 kg</span>
              <span>100 kg</span>
              <span>200 kg</span>
            </div>
          </div>

          {/* Slider 2: Days Until Expiry */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-300">Days Remaining Until Expiry</span>
              <span className="font-bold text-amber-400">
                {params.days_until_expiry === 0 ? 'Today (0d)' : `${params.days_until_expiry} days`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="14"
              step="1"
              value={params.days_until_expiry}
              onChange={(e) => setParams({ ...params, days_until_expiry: Number(e.target.value) })}
              className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Today (0d)</span>
              <span>7 days</span>
              <span>14 days</span>
            </div>
          </div>

          {/* Slider 3: Expected Daily Sales Velocity */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-300">Expected Daily Demand (units/day)</span>
              <span className="font-bold text-sky-400">{params.avg_daily_sales} units/day</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={params.avg_daily_sales}
              onChange={(e) => setParams({ ...params, avg_daily_sales: Number(e.target.value) })}
              className="w-full accent-sky-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>1 /day</span>
              <span>25 /day</span>
              <span>50 /day</span>
            </div>
          </div>

          {/* Slider 4: Selling Price */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-300">Regular Selling Price</span>
              <span className="font-bold text-white">${params.selling_price.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="35.0"
              step="0.5"
              value={params.selling_price}
              onChange={(e) => {
                const p = Number(e.target.value);
                setParams({ 
                  ...params, 
                  selling_price: p,
                  cost_price: Number((p * 0.55).toFixed(2))
                });
              }}
              className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>$1.00</span>
              <span>$18.00</span>
              <span>$35.00</span>
            </div>
          </div>

          {/* Slider 5: Dynamic Discount Percentage */}
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-900 border border-emerald-500/30">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-emerald-300">Dynamic Discount Percentage</span>
              <span className="font-black text-emerald-400 text-sm">{params.discount_percent}% OFF</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={params.discount_percent}
              onChange={(e) => setParams({ ...params, discount_percent: Number(e.target.value) })}
              className="w-full accent-emerald-400 bg-slate-800 h-2.5 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
              <span>0% (Standard)</span>
              <span>25%</span>
              <span>50% (Clearance)</span>
            </div>
          </div>
        </div>

        {/* Right: Comparative Results (ML Baseline vs Simulation) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Dual Card Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Column A: ML Model Predicted Baseline */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  <BrainCircuit className="w-3 h-3" />
                  <span>ML MODEL BASELINE</span>
                </span>
                <span className="text-[10px] text-slate-500">0% Discount</span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-[11px] text-slate-400">Predicted Unsold Waste</div>
                  <div className="text-3xl font-black text-rose-400">
                    {ml.predicted_unsold_quantity ?? '-'} <span className="text-sm font-bold text-slate-400">kg</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {ml.waste_percentage ?? '-'}% of total inventory
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Waste Cost Value:</span>
                    <span className="font-bold text-rose-300">${ml.waste_value?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Baseline Revenue:</span>
                    <span className="font-bold text-white">${ml.base_revenue?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Risk Assessment:</span>
                    <RiskBadge risk={ml.risk_category} />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] text-slate-500">
                Generated via trained Random Forest Regressor
              </div>
            </div>

            {/* Column B: Simulated Outcome with Discount */}
            <div className="bg-gradient-to-b from-emerald-950/30 to-slate-900 border-2 border-emerald-500/40 rounded-2xl p-5 relative overflow-hidden shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-slate-950">
                  <Sparkles className="w-3 h-3" />
                  <span>SIMULATED OUTCOME</span>
                </span>
                <span className="text-xs font-bold text-emerald-400">
                  {assump.discount_percent}% Discount (${assump.discounted_price?.toFixed(2)})
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-[11px] text-slate-400">Simulated Unsold Waste</div>
                  <div className="text-3xl font-black text-emerald-400">
                    {sim.remaining_unsold ?? '-'} <span className="text-sm font-bold text-slate-400">kg</span>
                  </div>
                  <div className="text-[11px] text-emerald-300 mt-0.5 font-semibold">
                    Saved {sim.waste_avoided_kg ?? '-'} kg from spoilage!
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Simulated Revenue:</span>
                    <span className="font-bold text-emerald-400">${sim.simulated_revenue?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Revenue Gain (Delta):</span>
                    <span className={`font-bold ${sim.revenue_delta >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {sim.revenue_delta >= 0 ? `+$${sim.revenue_delta?.toFixed(2)}` : `-$${Math.abs(sim.revenue_delta)?.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">CO₂ Avoided:</span>
                    <span className="font-bold text-emerald-300">+{sim.co2_saved_kg} kg CO₂e</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] text-slate-400">
                Calculated via Microeconomic Price Elasticity (ε = -{assump.category_elasticity})
              </div>
            </div>
          </div>

          {/* Key Simulation Takeaways Banner */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Net Impact Summary</h4>
                <p className="text-xs text-slate-400">
                  Applying {params.discount_percent}% discount converts {sim.additional_units_sold ?? 0} unsold units into active sales, preserving ${sim.simulated_revenue?.toFixed(2)} in store revenue.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
