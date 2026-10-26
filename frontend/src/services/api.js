/**
 * API Service for Smart Food Waste & Dynamic Discount System
 * Communicates with Flask backend at http://127.0.0.1:5000 (via Vite proxy or direct)
 * Includes graceful offline fallback data so the demo is always resilient.
 */

const API_BASE = '/api';

async function request(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`[API] Failed fetching ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // Health
  checkHealth: () => request('/health'),

  // Dashboard Statistics
  getDashboard: () => request('/dashboard'),

  // Inventory CRUD
  getInventory: (category = 'All') => request(`/inventory?category=${encodeURIComponent(category)}`),
  addProduct: (product) => request('/inventory', {
    method: 'POST',
    body: JSON.stringify(product)
  }),
  updateProduct: (id, product) => request(`/inventory/${id}`, {
    method: 'PUT',
    body: JSON.stringify(product)
  }),
  deleteProduct: (id) => request(`/inventory/${id}`, {
    method: 'DELETE'
  }),
  resetInventory: () => request('/inventory/reset', {
    method: 'POST'
  }),
  importCsv: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/inventory/import-csv`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to import CSV');
    }
    return await res.json();
  },

  // Machine Learning Inference
  predictWaste: (itemData) => request('/predict', {
    method: 'POST',
    body: JSON.stringify(itemData)
  }),

  // Discount Recommendations
  getDiscountRecommendations: (itemData) => request('/recommend-discount', {
    method: 'POST',
    body: JSON.stringify(itemData)
  }),

  // What-If Simulator
  runSimulation: (params) => request('/simulate', {
    method: 'POST',
    body: JSON.stringify(params)
  }),

  // Analytics & Sustainability
  getAnalytics: () => request('/analytics'),

  // Model Evaluation & Retraining
  getModelMetrics: () => request('/model/metrics'),
  retrainModel: () => request('/model/retrain', {
    method: 'POST'
  })
};
