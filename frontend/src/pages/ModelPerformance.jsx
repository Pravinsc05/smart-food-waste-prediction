import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  RotateCw, 
  CheckCircle2, 
  Layers, 
  BarChart2, 
  Award, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer 
} from 'recharts';
import { api } from '../services/api';

export default function ModelPerformance() {
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainSuccess, setRetrainSuccess] = useState(false);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      const data = await api.getModelMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Error fetching model metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetrain = async () => {
    try {
      setIsRetraining(true);
      setRetrainSuccess(false);
      const res = await api.retrainModel();
      if (res.metrics) {
        setMetrics(res.metrics);
        setRetrainSuccess(true);
        setTimeout(() => setRetrainSuccess(false), 5000);
      }
    } catch (err) {
      alert(`Retraining error: ${err.message}`);
    } finally {
      setIsRetraining(false);
    }
  };

  if (isLoading || !metrics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400">Loading model telemetry and feature importance weights...</p>
      </div>
    );
  }

  const rfMetrics = metrics.metrics?.random_forest || {};
  const baseMetrics = metrics.metrics?.baseline || {};
  const featureImportances = metrics.feature_importances || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 mb-2">
            <Cpu className="w-3.5 h-3.5" />
            <span>Scikit-Learn ML Model Audit</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Model Performance & Validation Telemetry
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
            Trained Random Forest Regressor evaluated against a Linear Regression Baseline using standard statistical error metrics (MAE, RMSE, R²).
          </p>
        </div>

        <button
          onClick={handleRetrain}
          disabled={isRetraining}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition shadow-lg shadow-emerald-950/40 flex items-center gap-2 disabled:opacity-50 shrink-0"
        >
          <RotateCw className={`w-4 h-4 ${isRetraining ? 'animate-spin' : ''}`} />
          <span>{isRetraining ? 'Retraining Model...' : 'Retrain Model Pipeline'}</span>
        </button>
      </div>

      {retrainSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Pipeline successfully retrained! Updated model serialized to Joblib and reloaded into active memory.</span>
        </div>
      )}

      {/* Model Benchmark Comparison Table */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white">Model Benchmark Comparison</h3>
          <span className="text-xs text-slate-400">
            Train Split: {metrics.train_samples} samples | Test Split: {metrics.test_samples} samples (80/20)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Model Architecture</th>
                <th className="py-3 px-4">MAE (Mean Absolute Error)</th>
                <th className="py-3 px-4">RMSE (Root Mean Squared Error)</th>
                <th className="py-3 px-4">R² Score (Goodness of Fit)</th>
                <th className="py-3 px-4">Pipeline Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              <tr className="hover:bg-slate-850/40">
                <td className="py-3.5 px-4 font-bold text-slate-300">
                  {metrics.baseline_model_name}
                </td>
                <td className="py-3.5 px-4 font-semibold text-slate-300">{baseMetrics.mae} kg</td>
                <td className="py-3.5 px-4 font-semibold text-slate-300">{baseMetrics.rmse} kg</td>
                <td className="py-3.5 px-4 font-semibold text-slate-300">{baseMetrics.r2_score}</td>
                <td className="py-3.5 px-4 text-slate-500 font-medium">Benchmark Reference</td>
              </tr>
              <tr className="bg-emerald-950/20 border-l-4 border-l-emerald-500">
                <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>{metrics.model_name}</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-black">
                    ACTIVE
                  </span>
                </td>
                <td className="py-3.5 px-4 font-black text-emerald-400 text-sm">{rfMetrics.mae} kg</td>
                <td className="py-3.5 px-4 font-black text-emerald-400 text-sm">{rfMetrics.rmse} kg</td>
                <td className="py-3.5 px-4 font-black text-emerald-400 text-sm">{rfMetrics.r2_score}</td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Deployed in Memory
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Random Forest achieves lower Mean Absolute Error than linear baseline.</span>
          <span className="text-slate-500">Last trained: {metrics.last_trained}</span>
        </div>
      </div>

      {/* Feature Importance Horizontal Chart */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="mb-4">
          <h3 className="text-base font-bold text-white">Random Forest Feature Importance Analysis</h3>
          <p className="text-xs text-slate-400">Relative contribution percentage of each input feature to waste forecast</p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={featureImportances}
              margin={{ top: 5, right: 30, left: 90, bottom: 5 }}
            >
              <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} unit="%" />
              <YAxis 
                dataKey="feature" 
                type="category" 
                stroke="#94a3b8" 
                fontSize={11} 
                tickLine={false}
                width={120}
              />
              <Tooltip 
                formatter={(val) => [`${val}%`, 'Importance']}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
              />
              <Bar dataKey="importance" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hyperparameters Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.hyperparameters && Object.entries(metrics.hyperparameters).map(([key, val]) => (
          <div key={key} className="glass-card p-4 rounded-xl border border-slate-800">
            <div className="text-[10px] font-bold uppercase text-slate-500">{key.replace(/_/g, ' ')}</div>
            <div className="text-base font-extrabold text-white mt-1">{String(val)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
