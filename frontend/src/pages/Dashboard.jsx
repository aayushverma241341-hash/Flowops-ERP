import React, { useState, useEffect } from 'react';
import { Users, Briefcase, MapPin, IndianRupee, Loader, TrendingUp, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import api from '../api/axios';

const StatCard = ({ title, value, icon, gradient, delay }) => (
  <div 
    className={`bg-white rounded-2xl p-6 relative overflow-hidden group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border border-slate-100 animate-in fade-in slide-in-from-bottom-4`}
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

// Data will be fetched from API now

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!stats) return <div className="p-4 text-rose-500 font-medium bg-rose-50 rounded-lg">Failed to load dashboard data. Ensure backend is running.</div>;

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Overview Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back. Here is what's happening across your operations today.</p>
        </div>
        <button className="hidden md:flex items-center space-x-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm">
          <Activity size={16} />
          <span>Download Report</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Employees" 
          value={stats.totalEmployees || 500} 
          icon={<Users size={24} strokeWidth={2.5} />} 
          gradient="from-indigo-500 to-cyan-500"
          delay={0}
        />
        <StatCard 
          title="Active Work Orders" 
          value={stats.activeWorkOrders || 100} 
          icon={<Briefcase size={24} strokeWidth={2.5} />} 
          gradient="from-emerald-400 to-teal-500"
          delay={100}
        />
        <StatCard 
          title="Running Sites" 
          value={stats.activeSites || 12} 
          icon={<MapPin size={24} strokeWidth={2.5} />} 
          gradient="from-fuchsia-500 to-purple-600"
          delay={200}
        />
        <StatCard 
          title="Monthly Payroll" 
          value={`₹ ${(stats.monthlyPayroll || 1750000).toLocaleString()}`} 
          icon={<IndianRupee size={24} strokeWidth={2.5} />} 
          gradient="from-amber-400 to-orange-500"
          delay={300}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 animate-in fade-in slide-in-from-bottom-8" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Revenue vs Payroll Trend</h3>
            <div className="flex space-x-4">
              <span className="flex items-center text-emerald-500 text-sm font-semibold">
                <span className="w-3 h-3 rounded-full bg-emerald-400 mr-2"></span> Revenue
              </span>
              <span className="flex items-center text-indigo-500 text-sm font-semibold">
                <span className="w-3 h-3 rounded-full bg-indigo-400 mr-2"></span> Payroll
              </span>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.trendData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPayroll" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => `₹${val/100000}L`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  formatter={(value, name) => [`₹ ${parseFloat(value).toLocaleString()}`, name === 'revenue' ? 'Revenue' : 'Payroll']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="payroll" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorPayroll)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 animate-in fade-in slide-in-from-bottom-8" style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
          <h3 className="text-lg font-bold text-slate-800 mb-6">Workforce Distribution</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.siteData || []} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="site" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }} width={100} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Bar dataKey="employees" fill="#14b8a6" radius={[0, 6, 6, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Employees */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">Recent Onboards</h3>
            <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">View All</button>
          </div>
          <div className="p-0">
            {stats.recentEmployees && stats.recentEmployees.length > 0 ? stats.recentEmployees.map((emp, i) => (
              <div key={emp.employee_id} className={`flex items-center justify-between p-4 ${i !== stats.recentEmployees.length - 1 ? 'border-b border-slate-50' : ''} hover:bg-slate-50 transition-colors`}>
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-100 to-blue-100 flex items-center justify-center text-indigo-700 font-bold uppercase ring-2 ring-white shadow-sm">
                    {emp.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{emp.name}</p>
                    <p className="text-xs font-medium text-slate-500">{emp.post || 'Field Staff'}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100/50 px-3 py-1 rounded-full border border-emerald-200/50">Active</span>
              </div>
            )) : (
              <div className="p-8 text-center text-slate-500">No recent employees found.</div>
            )}
          </div>
        </div>

        {/* Invoices */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">Pending Invoices</h3>
            <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">View All</button>
          </div>
          <div className="p-0">
            {stats.recentInvoices && stats.recentInvoices.length > 0 ? stats.recentInvoices.map((inv, i) => (
              <div key={inv.invoice_id} className={`flex items-center justify-between p-4 ${i !== stats.recentInvoices.length - 1 ? 'border-b border-slate-50' : ''} hover:bg-slate-50 transition-colors`}>
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shadow-sm">
                    <FileText size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{inv.wo_no || `INV-${inv.invoice_id}`}</p>
                    <p className="text-xs font-medium text-slate-500">Due in 5 days</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800">₹ {parseFloat(inv.amount).toLocaleString()}</p>
                  <p className="text-xs font-bold text-orange-600 mt-0.5">{inv.status || 'Unpaid'}</p>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-slate-500">No pending invoices.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
