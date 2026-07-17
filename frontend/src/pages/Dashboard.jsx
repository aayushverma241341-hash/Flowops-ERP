import React, { useState, useEffect } from 'react';
import { Users, Briefcase, MapPin, IndianRupee, Loader, TrendingUp, Activity, FileText, CheckCircle, ArrowDownRight, ArrowUpRight, Landmark, Receipt, Calendar, Bell, ChevronDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import StatModal from '../components/StatModal';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const navigate = useNavigate();

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
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-slate-200"></div>
          <div className="absolute inset-0 rounded-full border-2 border-slate-900 border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!stats) return <div className="p-4 text-rose-500 font-medium bg-rose-50 rounded-lg">Failed to load dashboard data. Ensure backend is running.</div>;

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Section with Time Filter */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-light text-slate-900 tracking-tight">Overview</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Real-time metrics across your organization.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            <Calendar size={16} className="text-slate-400" />
            <span>Last 30 Days</span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>
          <button className="flex items-center space-x-2 bg-slate-900 border border-slate-900 px-4 py-2 rounded-xl text-sm font-medium text-white hover:bg-slate-800 transition-colors shadow-sm">
            <Activity size={16} />
            <span>Live Sync</span>
          </button>
        </div>
      </div>

      {/* Critical Alerts Banner */}
      <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
            <Bell size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-rose-900">Critical Alerts</h4>
            <p className="text-xs text-rose-700 mt-0.5">3 Invoices Overdue • 12 Work Orders pending assignment</p>
          </div>
        </div>
        <button className="text-sm font-semibold text-rose-700 hover:text-rose-900 bg-white px-3 py-1.5 rounded-lg border border-rose-200 shadow-sm transition-colors">
          View Actions
        </button>
      </div>

      {/* ZONE 1: Executive Financials (North Star Layout) */}
      <section className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Revenue (YTD)" 
            value={`₹ ${(stats.totalRevenue || 0).toLocaleString()}`} 
            icon={<TrendingUp size={24} strokeWidth={2} />} 
            delay={0}
            hero={true}
            trend={stats.trends?.revenue}
            sparklineData={stats.sparklines?.revenue}
            onClick={() => setActiveModal({
              title: "Total Revenue (YTD)",
              value: `₹ ${(stats.totalRevenue || 0).toLocaleString()}`,
              icon: <TrendingUp size={32} strokeWidth={2} />,
              gradient: "from-slate-800 to-slate-900",
              description: "Total gross revenue accumulated year-to-date from all cleared and paid invoices.",
              actionText: "View Invoice Register",
              actionPath: "/sap/accounts"
            })}
          />
          <StatCard 
            title="Total Assets (GL)" 
            value={`₹ ${(stats.totalGL || 0).toLocaleString()}`} 
            icon={<Landmark size={24} strokeWidth={2} />} 
            delay={100}
            trend={stats.trends?.assets}
            sparklineData={stats.sparklines?.assets}
            onClick={() => setActiveModal({
              title: "Total Assets (GL)",
              value: `₹ ${(stats.totalGL || 0).toLocaleString()}`,
              icon: <Landmark size={32} strokeWidth={2} />,
              gradient: "from-slate-800 to-slate-900",
              description: "Total cumulative debit amounts posted to the FI General Ledger across all active company codes.",
              actionText: "Open General Ledger",
              actionPath: "/sap/gl"
            })}
          />
          <StatCard 
            title="Total Receivables (AR)" 
            value={`₹ ${(stats.totalAR || 0).toLocaleString()}`} 
            icon={<ArrowDownRight size={24} strokeWidth={2} />} 
            delay={200}
            trend={stats.trends?.ar}
            sparklineData={stats.sparklines?.ar}
            onClick={() => setActiveModal({
              title: "Total Receivables (AR)",
              value: `₹ ${(stats.totalAR || 0).toLocaleString()}`,
              icon: <ArrowDownRight size={32} strokeWidth={2} />,
              gradient: "from-slate-800 to-slate-900",
              description: "Sum of all open, uncleared incoming payments expected from customers and debtors.",
              actionText: "Open Accounts Receivable",
              actionPath: "/sap/ar"
            })}
          />
        </div>
      </section>

      {/* ZONE 2: Operations & HR */}
      <section className="space-y-4 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <StatCard 
            title="Total Payables (AP)" 
            value={`₹ ${(stats.totalAP || 0).toLocaleString()}`} 
            icon={<ArrowUpRight size={24} strokeWidth={2} />} 
            delay={300}
            trend={stats.trends?.ap}
            sparklineData={stats.sparklines?.ap}
            onClick={() => setActiveModal({
              title: "Total Payables (AP)",
              value: `₹ ${(stats.totalAP || 0).toLocaleString()}`,
              icon: <ArrowUpRight size={32} strokeWidth={2} />,
              gradient: "from-slate-800 to-slate-900",
              description: "Sum of all open, uncleared outgoing payments owed to vendors and creditors.",
              actionText: "Open Accounts Payable",
              actionPath: "/sap/ap"
            })}
          />
          <StatCard 
            title="Total Employees" 
            value={stats.totalEmployees || 0} 
            icon={<Users size={24} strokeWidth={2} />} 
            delay={350}
            trend={stats.trends?.employees}
            onClick={() => setActiveModal({
              title: "Total Employees",
              value: stats.totalEmployees || 0,
              icon: <Users size={32} strokeWidth={2} />,
              gradient: "from-slate-800 to-slate-900",
              description: "Total number of active employees registered in the HR master database.",
              actionText: "View Employee Directory",
              actionPath: "/employees"
            })}
          />
          <StatCard 
            title="Attendance Today" 
            value={stats.todayAttendance || 0} 
            icon={<CheckCircle size={24} strokeWidth={2} />} 
            delay={400}
            onClick={() => setActiveModal({
              title: "Attendance Today",
              value: stats.todayAttendance || 0,
              icon: <CheckCircle size={32} strokeWidth={2} />,
              gradient: "from-slate-800 to-slate-900",
              description: "Number of employees who have clocked in for today's shift.",
              actionText: "View Attendance Register",
              actionPath: "/attendance"
            })}
          />
          <StatCard 
            title="Active Work Orders" 
            value={stats.activeWorkOrders || 0} 
            icon={<Briefcase size={24} strokeWidth={2} />} 
            delay={450}
            onClick={() => setActiveModal({
              title: "Active Work Orders",
              value: stats.activeWorkOrders || 0,
              icon: <Briefcase size={32} strokeWidth={2} />,
              gradient: "from-slate-800 to-slate-900",
              description: "Total number of work orders and projects currently in progress.",
              actionText: "Manage Work Orders",
              actionPath: "/work-orders"
            })}
          />
          <StatCard 
            title="Monthly Payroll" 
            value={`₹ ${(stats.monthlyPayroll || 0).toLocaleString()}`} 
            icon={<IndianRupee size={24} strokeWidth={2} />} 
            delay={500}
            trend={stats.trends?.payroll}
            onClick={() => setActiveModal({
              title: "Monthly Payroll",
              value: `₹ ${(stats.monthlyPayroll || 0).toLocaleString()}`,
              icon: <IndianRupee size={32} strokeWidth={2} />,
              gradient: "from-slate-800 to-slate-900",
              description: "Total net salary disbursed in the current monthly payroll cycle.",
              actionText: "Process Salary",
              actionPath: "/salary"
            })}
          />
        </div>
      </section>

      {/* ZONE 3: Visual Analytics */}
      <section className="space-y-4 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Area Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-slate-200/60 overflow-hidden p-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-semibold text-slate-800 tracking-wide uppercase">Revenue vs Payroll Trend</h3>
              <div className="flex space-x-4">
                <span className="flex items-center text-slate-800 text-xs font-semibold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-slate-800 mr-2"></span> Revenue
                </span>
                <span className="flex items-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-slate-300 mr-2"></span> Payroll
                </span>
              </div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.trendData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1e293b" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#1e293b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(val) => `₹${val/100000}L`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontWeight: 500 }}
                    formatter={(value, name) => [`₹ ${parseFloat(value).toLocaleString()}`, name === 'revenue' ? 'Revenue' : 'Payroll']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#1e293b" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                  <Area type="monotone" dataKey="payroll" stroke="#cbd5e1" strokeWidth={2} fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-slate-200/60 overflow-hidden p-6 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-100">
            <h3 className="text-sm font-semibold text-slate-800 tracking-wide uppercase mb-6">Workforce Distribution</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.siteData || []} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="site" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} width={100} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }} />
                  <Bar dataKey="employees" fill="#334155" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* ZONE 4: The Live Feeds */}
      <section className="space-y-4 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Recent Invoices */}
          <div className="flex flex-col space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-200">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-1">Recent Invoices</h3>
            <DataTable
              columns={[
                { header: 'Invoice', cell: (row) => <span className="font-medium text-slate-800">{row.wo_no || `INV-${row.invoice_id}`}</span> },
                { header: 'Site', accessor: 'site_name' },
                { header: 'Amount', cell: (row) => `₹ ${parseFloat(row.amount).toLocaleString()}` },
                { header: 'Status', cell: (row) => <StatusBadge status={row.status || 'Unpaid'} /> }
              ]}
              data={stats.recentInvoices || []}
              searchable={false}
              emptyStateTitle="No Pending Invoices"
              emptyStateAction={{ label: "+ Create Invoice", onClick: () => navigate('/sap/accounts') }}
            />
          </div>

          {/* HR Onboards */}
          <div className="flex flex-col space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-200">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-1">Recent Onboards</h3>
            <DataTable
              columns={[
                { header: 'Employee', cell: (row) => <span className="font-medium text-slate-800">{row.name}</span> },
                { header: 'Role', accessor: 'post' },
                { header: 'Status', cell: () => <StatusBadge status="Active" /> }
              ]}
              data={stats.recentEmployees || []}
              searchable={false}
              emptyStateTitle="No Recent Employees"
              emptyStateAction={{ label: "+ Add Employee", onClick: () => navigate('/employees') }}
            />
          </div>

        </div>
      </section>

      {/* Dynamic Popups for Stat Cards */}
      <StatModal 
        isOpen={!!activeModal} 
        onClose={() => setActiveModal(null)}
        {...activeModal} 
      />

    </div>
  );
};

export default Dashboard;
