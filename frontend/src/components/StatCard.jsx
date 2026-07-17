import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const StatCard = ({ title, value, icon, trend, sparklineData, delay = 0, onClick, hero = false }) => {
  const isPositive = trend?.isPositive ?? true;
  const trendColor = isPositive ? 'text-emerald-500' : 'text-rose-500';
  const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-2xl p-6 relative overflow-hidden group hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] transition-all duration-400 border border-slate-200/60 animate-in fade-in slide-in-from-bottom-4 ${onClick ? 'cursor-pointer' : ''} ${hero ? 'md:col-span-2' : ''}`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      <div className="flex justify-between items-start z-10 relative">
        <div className="flex flex-col h-full justify-between">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 rounded-lg bg-slate-50 text-slate-400 border border-slate-100">
              {icon}
            </div>
            <p className="text-xs font-semibold text-slate-500 tracking-widest uppercase">{title}</p>
          </div>
          
          <h3 className={`${hero ? 'text-5xl' : 'text-3xl'} font-light text-slate-800 tracking-tight font-sans`}>
            {value}
          </h3>

          {trend && (
            <div className="mt-4 flex items-center space-x-1 text-sm">
              <span className={`flex items-center font-medium ${trendColor}`}>
                <TrendIcon size={16} className="mr-0.5" />
                {trend.value}%
              </span>
              <span className="text-slate-400">vs last month</span>
            </div>
          )}
        </div>

        {sparklineData && sparklineData.length > 0 && (
          <div className="w-24 h-12 mt-2 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line 
                  type="monotone" 
                  dataKey="val" 
                  stroke={isPositive ? '#10b981' : '#f43f5e'} 
                  strokeWidth={2} 
                  dot={false}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
