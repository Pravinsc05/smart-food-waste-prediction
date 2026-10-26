import React from 'react';
import { Menu, Plus, RefreshCw, Sparkles, Database } from 'lucide-react';

const PAGE_TITLES = {
  dashboard: {
    title: 'Executive Waste & Revenue Dashboard',
    desc: 'Real-time retail inventory tracking, ML waste forecasts & dynamic markdown KPIs'
  },
  inventory: {
    title: 'Food Inventory Management',
    desc: 'Track freshness, perishability shelf life, prices, and demand across all supermarket departments'
  },
  prediction: {
    title: 'Machine Learning Waste Prediction',
    desc: 'Predict expected unsold food quantities before expiry using trained Random Forest Regressor'
  },
  discounts: {
    title: 'Dynamic Discount Recommendation Engine',
    desc: 'Evaluate 10%, 20%, 30%, 40% discount scenarios balancing waste salvage and margin protection'
  },
  simulator: {
    title: 'Interactive What-If Simulation Sandbox',
    desc: 'Test price elasticity hypotheses, varying stock velocity, shelf life, and dynamic clearance discounts'
  },
  analytics: {
    title: 'Visual Analytics & Sustainability Impact',
    desc: 'Environmental CO2 footprints, food category waste distribution, and price elasticity curves'
  },
  model: {
    title: 'ML Model Performance & Retraining',
    desc: 'Evaluation metrics (MAE, RMSE, R²), baseline benchmarks, and feature importance analysis'
  },
  info: {
    title: 'Project Architecture & Viva Presentation Guide',
    desc: 'College presentation slides, viva Q&A talking points, system design, and econometric formulation'
  }
};

export default function Header({ 
  activePage, 
  setIsMobileOpen, 
  onOpenAddModal, 
  onRefresh, 
  isRefreshing 
}) {
  const current = PAGE_TITLES[activePage] || PAGE_TITLES.dashboard;

  return (
    <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3.5">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>{current.title}</span>
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              {current.desc}
            </p>
          </div>
        </div>

        {/* Right: Quick actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 active:scale-95 transition flex items-center gap-1.5"
            title="Refresh application data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition shadow-lg shadow-emerald-950/40 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>
    </header>
  );
}
