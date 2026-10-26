import React from 'react';
import { 
  BookOpen, 
  Layers, 
  BrainCircuit, 
  Scale, 
  HelpCircle, 
  ShieldCheck, 
  Cpu, 
  Leaf, 
  CheckCircle2, 
  Sparkles,
  Award
} from 'lucide-react';

export default function ProjectInfo() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Hero Header */}
      <div className="text-center space-y-2 py-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          <Award className="w-3.5 h-3.5" />
          <span>College ML Mini-Project Exhibition</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Smart Food Waste Prediction & Dynamic Discount Recommendation System
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
          Comprehensive project documentation, mathematical formulation, ML pipeline architecture, and viva presentation talking points.
        </p>
      </div>

      {/* Section 1: Executive Overview & Objectives */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
          <BookOpen className="w-5 h-5" />
          <h2>1. Project Objective & Real-World Motivation</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Food waste in modern supermarkets and food retail constitutes nearly 10–15% of all perishable merchandise, causing enormous economic losses and heavy greenhouse gas emissions (landfill methane). Traditional stores rely on static manual markdown stickers on the final day, which are too late to stimulate demand.
        </p>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          This system replaces guesswork with a two-stage intelligent optimization pipeline:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-xs font-bold text-emerald-400">Stage 1: Machine Learning Waste Forecast</span>
            <p className="text-xs text-slate-400">
              A trained <strong>Random Forest Regressor</strong> predicts the exact unsold food quantity (kg) expected before expiry, taking into account stock velocity, days to expiry, department perishability, demand level, and day-of-week surges.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-xs font-bold text-sky-400">Stage 2: Econometric Dynamic Discounting</span>
            <p className="text-xs text-slate-400">
              An optimization engine simulates 10%, 20%, 30%, and 40% discount scenarios via <strong>Price Elasticity of Demand</strong>, picking the best discount that maximizes revenue while enforcing cost-price margin protection.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Machine Learning Architecture */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-sky-400 font-bold text-base">
          <BrainCircuit className="w-5 h-5" />
          <h2>2. Machine Learning Algorithm & Pipeline</h2>
        </div>
        
        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            <strong>Algorithm:</strong> Scikit-Learn <code className="text-emerald-400 bg-slate-900 px-1 py-0.5 rounded">RandomForestRegressor</code> (120 Estimators, Max Depth = 14) with <code className="text-emerald-400 bg-slate-900 px-1 py-0.5 rounded">OneHotEncoder</code> and <code className="text-emerald-400 bg-slate-900 px-1 py-0.5 rounded">StandardScaler</code> assembled into a Joblib-serialized pipeline.
          </p>
          <p>
            <strong>Physics Conservation & Boundary Guarantee:</strong>
            Predictions are strictly clipped via <code className="text-emerald-400 bg-slate-900 px-1 py-0.5 rounded">np.clip(y_pred, 0.0, stock_quantity)</code>. It is physically impossible for predicted unsold waste to drop below zero or exceed the existing physical inventory.
          </p>
          <p>
            <strong>Zero Target Leakage:</strong>
            Future sales realization or post-discount outcomes are never fed as input features. Only features known at prediction time (shelf life, historical demand, daily sales velocity, prices, day of week) are utilized.
          </p>
        </div>
      </div>

      {/* Section 3: Microeconomic Dynamic Discount Formulation */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
          <Scale className="w-5 h-5" />
          <h2>3. Dynamic Discounting & Price Elasticity Formulation</h2>
        </div>
        
        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            Price elasticity of demand represents the percentage change in quantity demanded relative to a percentage price reduction:
          </p>
          <div className="p-3.5 rounded-xl bg-slate-900 font-mono text-xs text-amber-300 text-center border border-slate-800">
            Demand Uplift = |ε| × Discount Rate × Urgency Factor (1 + 1 / Days Left)
          </div>
          <p>
            <strong>Transparent Multi-Objective Function:</strong>
            The system selects the optimal discount by evaluating:
          </p>
          <div className="p-3.5 rounded-xl bg-slate-900 font-mono text-xs text-emerald-300 text-center border border-slate-800">
            Score(d) = 0.55 × (Revenue(d) / Max_Revenue) + 0.45 × (Waste_Avoided_Pct) - Below_Cost_Penalty
          </div>
          <p>
            This ensures that deep discounts are never blindly applied if standard pricing or modest discounts suffice, while protecting the retailer's cost floor.
          </p>
        </div>
      </div>

      {/* Section 4: College Viva Presentation Talking Points (Q&A) */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-purple-400 font-bold text-base">
          <HelpCircle className="w-5 h-5" />
          <h2>4. College Viva Q&A & Presentation Talking Points</h2>
        </div>

        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <h4 className="font-bold text-white mb-1">
              Q1: Why use Random Forest instead of simple Linear Regression?
            </h4>
            <p className="text-slate-400 leading-relaxed">
              <strong>Answer:</strong> Linear regression assumes linear additivity and cannot capture non-linear thresholds (e.g. food sales drop precipitously on the final 24 hours of shelf life). Random Forest uses an ensemble of 120 decision trees that effectively model interactions between categorical departments, day of the week, and remaining days.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <h4 className="font-bold text-white mb-1">
              Q2: Is the discount recommendation itself a Machine Learning model?
            </h4>
            <p className="text-slate-400 leading-relaxed">
              <strong>Answer:</strong> No, and we are academically transparent about this. The waste prediction is ML (Random Forest). The dynamic discount recommendation is an Econometric Price Elasticity Optimization Engine that uses the ML prediction as input.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <h4 className="font-bold text-white mb-1">
              Q3: How is the environmental CO₂ impact calculated?
            </h4>
            <p className="text-slate-400 leading-relaxed">
              <strong>Answer:</strong> We use the standard FAO / EPA Food Loss Emissions factor of 2.5 kg CO₂-equivalent per 1.0 kg of food diverted from municipal landfills.
            </p>
          </div>
        </div>
      </div>

      {/* Section 5: Tech Stack & System Architecture */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
          <Layers className="w-5 h-5" />
          <h2>5. Technology Stack & Persistence</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-500 font-bold uppercase block text-[10px]">Frontend</span>
            <span className="text-white font-bold">React 19 + Vite</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-500 font-bold uppercase block text-[10px]">Styling</span>
            <span className="text-white font-bold">Tailwind CSS v4</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-500 font-bold uppercase block text-[10px]">Charts</span>
            <span className="text-white font-bold">Recharts Responsive</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-500 font-bold uppercase block text-[10px]">Backend</span>
            <span className="text-white font-bold">Python Flask 3.1</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-500 font-bold uppercase block text-[10px]">Machine Learning</span>
            <span className="text-white font-bold">Scikit-Learn 1.8</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-500 font-bold uppercase block text-[10px]">Data Wrangling</span>
            <span className="text-white font-bold">Pandas & NumPy</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-500 font-bold uppercase block text-[10px]">Database</span>
            <span className="text-white font-bold">SQLite 3 (Persistent)</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-500 font-bold uppercase block text-[10px]">Model Storage</span>
            <span className="text-white font-bold">Joblib Serializer</span>
          </div>
        </div>
      </div>
    </div>
  );
}
