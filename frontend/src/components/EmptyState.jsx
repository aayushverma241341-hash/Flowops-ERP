import React from 'react';
import { PackageOpen, Plus } from 'lucide-react';

const EmptyState = ({ title = "No Data Found", description = "Get started by creating a new record.", icon: Icon = PackageOpen, actionLabel, onAction }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-xl border border-slate-200 border-dashed animate-in fade-in zoom-in duration-300">
    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mb-4 shadow-sm border border-slate-100">
      <Icon size={32} strokeWidth={1.5} />
    </div>
    <h3 className="text-lg font-bold text-slate-800 mb-1">{title}</h3>
    <p className="text-sm text-slate-500 max-w-sm text-center mb-6">{description}</p>
    
    {actionLabel && onAction && (
      <button 
        onClick={onAction}
        className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-md shadow-indigo-200"
      >
        <Plus size={18} />
        <span>{actionLabel}</span>
      </button>
    )}
  </div>
);

export default EmptyState;
