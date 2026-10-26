import React from 'react';
import { 
  LayoutDashboard, 
  Boxes, 
  BrainCircuit, 
  BadgePercent, 
  Sliders, 
  BarChart3, 
  Cpu, 
  BookOpen, 
  Leaf, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard, badge: 'Live' },
  { id: 'inventory', label: 'Inventory Management', icon: Boxes },
  { id: 'prediction', label: 'ML Waste Prediction', icon: BrainCircuit, badge: 'AI' },
  { id: 'discounts', label: 'Dynamic Discounts', icon: BadgePercent },
  { id: 'simulator', label: 'What-If Simulator', icon: Sliders },
  { id: 'analytics', label: 'Analytics & Impact', icon: BarChart3 },
  { id: 'model', label: 'Model Performance', icon: Cpu },
  { id: 'info', label: 'Project & Presentation', icon: BookOpen }
];

export default function Sidebar({ activePage, setActivePage, isMobileOpen, setIsMobileOpen }) {
  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-950/90 backdrop-blur-xl border-r border-slate-800/80 
        flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Branding */}
        <div className="p-5 border-b border-slate-800/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-black">
              <Leaf className="w-6 h-6 text-white stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-white tracking-tight">FoodWaste</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">AI</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium leading-none mt-0.5">
                Dynamic Discount System
              </p>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Core Modules
          </div>
          
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  if (setIsMobileOpen) setIsMobileOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold
                  transition-all duration-200 group text-left
                  ${isActive 
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-950/50' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'}
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    isActive 
                      ? 'bg-emerald-400/20 text-emerald-300' 
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Model status footer widget */}
        <div className="p-4 border-t border-slate-800/70 bg-slate-950/40">
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ML Engine Active
              </span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Random Forest Regressor • Pipeline v1.0
            </p>
          </div>
          <p className="text-[10px] text-slate-500 text-center mt-2.5">
            College ML Mini-Project Exhibition 2026
          </p>
        </div>
      </aside>
    </>
  );
}
