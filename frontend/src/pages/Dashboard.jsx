import React from 'react';
import { 
  Package, 
  Clock, 
  Trash2, 
  DollarSign, 
  TrendingDown, 
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Leaf,
  ShieldAlert
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import StatCard from '../components/StatCard';
import CategoryBadge from '../components/CategoryBadge';
import RiskBadge from '../components/RiskBadge';

const CATEGORY_COLORS = {
  'Produce': '#10b981',
  'Dairy': '#0ea5e9',
  'Bakery': '#f59e0b',
  'Meat & Seafood': '#f43f5e',
  'Packaged Food': '#a855f7',
  'Deli & Prepared': '#f97316'
};

export default function Dashboard({ 
  dashboardData, 
  onNavigate, 
  onSelectProductForDiscount,
  isLoading 
}) {
  if (isLoading || !dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-400">Loading intelligent dashboard metrics...</p>
      </div>
    );
  }

  const {
    total_products = 0,
    nearing_expiry_count = 0,
    predicted_waste_kg = 0,
    estimated_revenue_saved = 0,
    waste_reduction_percentage = 0,
    immediate_action_count = 0,
    category_breakdown = [],
    high_risk_alerts = [],
    co2_saved_kg = 0
  } = dashboardData;

  const pieData = category_breakdown.map(c => ({
    name: c.category,
    value: Math.round(c.predicted_waste_kg * 10) / 10,
    color: CATEGORY_COLORS[c.category] || '#64748b'
  })).filter(c => c.value > 0);

  return (
    <div className="space-y-6">
      {/* Sustainability Highlight Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/30 p-6 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <Leaf className="w-3.5 h-3.5" />
              <span>AI Sustainability Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Retail Food Waste & Dynamic Markdown Intelligence
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl">
              Machine learning forecasts unsold grocery stock before expiry, recommending micro-economic discounts that protect profit margins while diverting food from landfills.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/60 border border-slate-800 rounded-xl p-3 px-4 shrink-0">
            <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">CO₂ Emissions Avoided</div>
              <div className="text-xl font-extrabold text-white">{co2_saved_kg} <span className="text-xs font-normal text-slate-400">kg CO₂e</span></div>
              <div className="text-[10px] text-emerald-400">~{Math.round(predicted_waste_kg / 0.42)} meals saved equivalent</div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid (6 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Tracked Inventory"
          value={total_products}
          unit="SKUs"
          subtitle="Active perishable lines"
          icon={Package}
          color="blue"
          tooltip="Total distinct perishable food products tracked in SQLite store inventory."
        />

        <StatCard
          title="Nearing Expiry"
          value={nearing_expiry_count}
          unit="items"
          subtitle="≤ 2 days remaining"
          icon={Clock}
          color="amber"
          tooltip="Products expiring within 48 hours requiring rapid velocity clearance."
        />

        <StatCard
          title="Predicted Waste"
          value={predicted_waste_kg}
          unit="kg"
          subtitle="Expected unsold stock"
          icon={Trash2}
          color="rose"
          tooltip="ML Random Forest prediction of unsold quantity if standard pricing persists."
        />

        <StatCard
          title="Revenue Saved"
          value={`$${estimated_revenue_saved.toLocaleString()}`}
          subtitle="Recovered through discounts"
          icon={DollarSign}
          color="emerald"
          tooltip="Gross revenue generated from items that would have otherwise expired without dynamic discount markdown."
        />

        <StatCard
          title="Waste Reduction"
          value={`${waste_reduction_percentage}%`}
          subtitle="Target stock rescued"
          icon={TrendingDown}
          color="emerald"
          tooltip="Overall percentage of perishable inventory preserved from disposal."
        />

        <StatCard
          title="Urgent Actions"
          value={immediate_action_count}
          unit="alerts"
          subtitle="Immediate markdown needed"
          icon={AlertTriangle}
          color="rose"
          tooltip="Products flagged with High Waste Risk (≥40%) or expiring within 24 hours."
        />
      </div>

      {/* Main Charts & Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Waste Bar Chart */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Predicted Waste by Food Category</h3>
              <p className="text-xs text-slate-400">Total stock vs ML-predicted unsold kilograms</p>
            </div>
            <button 
              onClick={() => onNavigate('analytics')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
            >
              <span>Detailed Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={category_breakdown} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <XAxis dataKey="category" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="kg" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                  labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="total_stock" name="Total Stock (kg)" fill="#334155" radius={[4, 4, 0, 0]} />
                <Bar dataKey="predicted_waste_kg" name="Predicted Waste (kg)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Waste Distribution Donut Chart */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col">
          <div className="mb-2">
            <h3 className="text-base font-bold text-white">Waste Share Distribution</h3>
            <p className="text-xs text-slate-400">Proportional spoilage risk by department</p>
          </div>

          <div className="flex-1 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val) => [`${val} kg`, 'Waste']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
            {pieData.slice(0, 4).map(item => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-slate-300 truncate">{item.name}</span>
                <span className="text-slate-400 font-semibold ml-auto">{item.value}k</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Immediate Attention & Dynamic Discount Alerts */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Products Requiring Immediate Action</h3>
              <p className="text-xs text-slate-400">High spoilage risk or expiring in ≤ 24 hours</p>
            </div>
          </div>
          <button 
            onClick={() => onNavigate('discounts')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
          >
            <span>View All Recommendations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {high_risk_alerts.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            No critical spoilage alerts at this time. All products have adequate shelf life.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {high_risk_alerts.map((item) => (
              <div 
                key={item.id} 
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <CategoryBadge category={item.category} size="xs" />
                    <RiskBadge risk={item.risk_category} percentage={item.waste_percentage} />
                  </div>

                  <h4 className="text-sm font-bold text-white tracking-tight line-clamp-1">
                    {item.product_name}
                  </h4>

                  <div className="grid grid-cols-2 gap-2 mt-3 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-500 font-semibold uppercase">Stock / Waste</div>
                      <div className="font-semibold text-slate-200">{item.stock_quantity} kg / <span className="text-rose-400 font-bold">{item.predicted_unsold} kg</span></div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-semibold uppercase">Days Left</div>
                      <div className="font-semibold text-amber-400">
                        {item.days_until_expiry === 0 ? 'Today (Urgent)' : `${item.days_until_expiry} day(s)`}
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-2.5 line-clamp-2 italic">
                    "{item.reason}"
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">
                    Apply {item.recommended_discount}% Discount
                  </span>
                  <button
                    onClick={() => {
                      if (onSelectProductForDiscount) onSelectProductForDiscount(item);
                      onNavigate('discounts');
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition flex items-center gap-1"
                  >
                    <span>Simulate</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
