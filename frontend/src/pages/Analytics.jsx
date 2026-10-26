import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Leaf, 
  DollarSign, 
  TrendingDown, 
  Droplet, 
  Utensils, 
  HelpCircle,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, Legend, CartesianGrid 
} from 'recharts';
import { api } from '../services/api';
import StatCard from '../components/StatCard';

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const data = await api.getAnalytics();
        if (isMounted) setAnalyticsData(data);
      } catch (err) {
        console.error('Failed fetching analytics:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchAnalytics();
    return () => { isMounted = false; };
  }, []);

  if (isLoading || !analyticsData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400">Loading comprehensive analytics & carbon footprint models...</p>
      </div>
    );
  }

  const { category_comparison = [], expiry_trends = [], elasticity_curve = [], sustainability_metrics = {} } = analyticsData;

  // Aggregate totals
  const totalWasteAvoided = category_comparison.reduce((sum, c) => sum + c.waste_avoided, 0);
  const totalBaseRevenue = category_comparison.reduce((sum, c) => sum + c.base_revenue, 0);
  const totalOptimizedRevenue = category_comparison.reduce((sum, c) => sum + c.optimized_revenue, 0);
  const totalRevenueGain = totalOptimizedRevenue - totalBaseRevenue;

  // Environmental conversions
  const emissionsFactor = sustainability_metrics.emissions_factor_kg_co2_per_kg_food || 2.5;
  const co2AvoidedKg = Math.round(totalWasteAvoided * emissionsFactor);
  const mealsSaved = Math.round(totalWasteAvoided / 0.42);
  const waterSavedLiters = Math.round(totalWasteAvoided * 1000);

  return (
    <div className="space-y-6">
      {/* Sustainability Headline Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Food Waste Diverted"
          value={Math.round(totalWasteAvoided * 10) / 10}
          unit="kg"
          subtitle="Rescued through dynamic markdowns"
          icon={TrendingDown}
          color="emerald"
          tooltip="Total kilograms of food diverted from municipal landfills via dynamic price discounts."
        />

        <StatCard
          title="Carbon Footprint Avoided"
          value={co2AvoidedKg.toLocaleString()}
          unit="kg CO₂e"
          subtitle={`Factor: ${emissionsFactor} kg CO₂ / kg food`}
          icon={Leaf}
          color="emerald"
          tooltip="Calculated using standard FAO/EPA food loss greenhouse gas emission conversion models."
        />

        <StatCard
          title="Equivalent Meals Saved"
          value={mealsSaved.toLocaleString()}
          unit="meals"
          subtitle="Based on 420g average meal"
          icon={Utensils}
          color="blue"
          tooltip="Portion equivalents of nutritious food preserved for consumer consumption."
        />

        <StatCard
          title="Embedded Water Conserved"
          value={`${(waterSavedLiters / 1000).toFixed(1)}k`}
          unit="liters"
          subtitle="~1,000L water per kg food"
          icon={Droplet}
          color="purple"
          tooltip="Indirect agricultural and supply chain water resources protected from wasted harvest."
        />
      </div>

      {/* Charts Grid Row 1: Waste Before vs Avoided by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Waste Rescue Chart */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white">Food Waste vs Avoided Waste by Department</h3>
            <p className="text-xs text-slate-400">Comparing ML predicted unsold kg with dynamic discount salvage kg</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={category_comparison} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="category" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="kg" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="predicted_waste" name="Unmitigated Waste (kg)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="waste_avoided" name="Rescued Stock (kg)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Comparison Chart */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white">Revenue Realization: Standard vs Dynamic Discount</h3>
            <p className="text-xs text-slate-400">Gross revenue generated across each department</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={category_comparison} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="category" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="$" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="base_revenue" name="Baseline Revenue ($)" fill="#64748b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="optimized_revenue" name="Optimized Revenue ($)" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Grid Row 2: Shelf Life Waste Proximity & Price Elasticity Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shelf Life vs Waste Curve */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white">Waste Concentration vs Shelf-Life Proximity</h3>
            <p className="text-xs text-slate-400">Waste percentage escalates dramatically as expiry approaches</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={expiry_trends} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="wasteGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="shelf_life" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="waste_rate_pct" name="Waste Rate (% of stock)" stroke="#f43f5e" fillOpacity={1} fill="url(#wasteGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Microeconomic Price Elasticity Curve */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white">Price Elasticity of Demand Response Curves</h3>
            <p className="text-xs text-slate-400">Relative sales velocity uplift index (100 = standard demand)</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={elasticity_curve} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="discount" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={[90, 185]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="Bakery_Demand_Index" name="Bakery (ε = -1.85)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Produce_Demand_Index" name="Produce (ε = -1.45)" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Meat_Demand_Index" name="Meat (ε = -1.60)" stroke="#f43f5e" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
