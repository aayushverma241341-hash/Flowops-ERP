import React from 'react';

const StatCard = ({ title, value, icon, gradient, delay = 0, onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-2xl p-6 relative overflow-hidden group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border border-slate-100 animate-in fade-in slide-in-from-bottom-4 ${onClick ? 'cursor-pointer' : ''}`}
    style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
  >
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 bg-gradient-to-br ${gradient} group-hover:scale-150 transition-transform duration-500`} />
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">{title}</p>
        <h3 className="text-3xl font-extrabold text-slate-800">{value}</h3>
      </div>
      <div className={`p-4 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
        {icon}
      </div>
    </div>
  </div>
);

export default StatCard;
