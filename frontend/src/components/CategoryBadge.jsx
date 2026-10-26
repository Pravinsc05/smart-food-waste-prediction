import React from 'react';
import { Apple, Milk, Croissant, Drumstick, Package, UtensilsCrossed } from 'lucide-react';

const CATEGORY_STYLES = {
  'Produce': {
    bg: 'bg-emerald-950/60 border-emerald-700/50 text-emerald-300',
    icon: Apple
  },
  'Dairy': {
    bg: 'bg-sky-950/60 border-sky-700/50 text-sky-300',
    icon: Milk
  },
  'Bakery': {
    bg: 'bg-amber-950/60 border-amber-700/50 text-amber-300',
    icon: Croissant
  },
  'Meat & Seafood': {
    bg: 'bg-rose-950/60 border-rose-700/50 text-rose-300',
    icon: Drumstick
  },
  'Packaged Food': {
    bg: 'bg-purple-950/60 border-purple-700/50 text-purple-300',
    icon: Package
  },
  'Deli & Prepared': {
    bg: 'bg-orange-950/60 border-orange-700/50 text-orange-300',
    icon: UtensilsCrossed
  }
};

export default function CategoryBadge({ category, size = 'sm' }) {
  const conf = CATEGORY_STYLES[category] || {
    bg: 'bg-slate-800 border-slate-700 text-slate-300',
    icon: Package
  };
  const Icon = conf.icon;
  
  const sizeClasses = size === 'xs' 
    ? 'text-xs px-2 py-0.5' 
    : size === 'md' 
    ? 'text-sm px-3 py-1' 
    : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${conf.bg} ${sizeClasses}`}>
      <Icon className={size === 'xs' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{category}</span>
    </span>
  );
}
