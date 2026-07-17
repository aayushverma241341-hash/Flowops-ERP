import React, { useState, useEffect } from 'react';
import { Users, Briefcase, MapPin, IndianRupee, Loader, TrendingUp, Activity, FileText, CheckCircle, ArrowDownRight, ArrowUpRight, Landmark, Receipt } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import api from '../api/axios';

import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import StatModal from '../components/StatModal';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);

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
    <div className="space-y-10 pb-10">
      
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Command Center</h1>
          <p className="text-slate-500 mt-1">Live metrics across Finance, Operations, and HR.</p>
        </div>
        <button className="hidden md:flex items-center space-x-2 bg-indigo-600 border border-indigo-700 px-4 py-2 rounded-xl text-sm font-medium text-white hover:bg-indigo-700 transition-colors shadow-sm">
          <Activity size={16} />
          <span>Live Sync Active</span>
        </button>
      </div>

      {/* ZONE 1: Executive Financials */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center space-x-2">
          <Landmark size={20} className="text-indigo-500" />
          <span>Executive Financials (FI)</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Gross Revenue (YTD)" 
            value={`₹ ${(stats.totalRevenue || 0).toLocaleString()}`} 
            icon={<TrendingUp size={24} strokeWidth={2.5} />} 
            gradient="from-emerald-500 to-teal-500"
            delay={0}
            onClick={() => setActiveModal({
              title: "Gross Revenue (YTD)",
              value: `₹ ${(stats.totalRevenue || 0).toLocaleString()}`,
              icon: <TrendingUp size={32} strokeWidth={2.5} />,
              gradient: "from-emerald-500 to-teal-500",
              description: "Total gross revenue accumulated year-to-date from all cleared and paid invoices.",
              actionText: "View Invoice Register",
              actionPath: "/sap/accounts"
            })}
          />
          <StatCard 
            title="Total Assets (GL)" 
            value={`₹ ${(stats.totalGL || 0).toLocaleString()}`} 
            icon={<Landmark size={24} strokeWidth={2.5} />} 
            gradient="from-indigo-500 to-blue-600"
            delay={100}
            onClick={() => setActiveModal({
              title: "Total Assets (GL)",
              value: `₹ ${(stats.totalGL || 0).toLocaleString()}`,
              icon: <Landmark size={32} strokeWidth={2.5} />,
              gradient: "from-indigo-500 to-blue-600",
              description: "Total cumulative debit amounts posted to the FI General Ledger across all active company codes.",
              actionText: "Open General Ledger",
              actionPath: "/sap/gl"
            })}
          />
          <StatCard 
            title="Total Receivables (AR)" 
            value={`₹ ${(stats.totalAR || 0).toLocaleString()}`} 
            icon={<ArrowDownRight size={24} strokeWidth={2.5} />} 
            gradient="from-emerald-400 to-teal-500"
            delay={200}
            onClick={() => setActiveModal({
              title: "Total Receivables (AR)",
              value: `₹ ${(stats.totalAR || 0).toLocaleString()}`,
              icon: <ArrowDownRight size={32} strokeWidth={2.5} />,
              gradient: "from-emerald-400 to-teal-500",
              description: "Sum of all open, uncleared incoming payments expected from customers and debtors.",
              actionText: "Open Accounts Receivable",
              actionPath: "/sap/ar"
            })}
          />
          <StatCard 
            title="Total Payables (AP)" 
            value={`₹ ${(stats.totalAP || 0).toLocaleString()}`} 
            icon={<ArrowUpRight size={24} strokeWidth={2.5} />} 
            gradient="from-rose-400 to-red-500"
            delay={300}
            onClick={() => setActiveModal({
              title: "Total Payables (AP)",
              value: `₹ ${(stats.totalAP || 0).toLocaleString()}`,
              icon: <ArrowUpRight size={32} strokeWidth={2.5} />,
              gradient: "from-rose-400 to-red-500",
              description: "Sum of all open, uncleared outgoing payments owed to vendors and creditors.",
              actionText: "Open Accounts Payable",
              actionPath: "/sap/ap"
            })}
          />
        </div>
      </section>

      {/* ZONE 2: Operations & HR */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center space-x-2">
          <Users size={20} className="text-fuchsia-500" />
          <span>Operations & HR</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard 
            title="Total Employees" 
            value={stats.totalEmployees || 0} 
            icon={<Users size={24} strokeWidth={2.5} />} 
            gradient="from-slate-600 to-slate-800"
            delay={0}
            onClick={() => setActiveModal({
              title: "Total Employees",
              value: stats.totalEmployees || 0,
              icon: <Users size={32} strokeWidth={2.5} />,
              gradient: "from-slate-600 to-slate-800",
              description: "Total number of active employees registered in the HR master database.",
              actionText: "View Employee Directory",
              actionPath: "/employees"
            })}
          />
          <StatCard 
            title="Attendance Today" 
            value={stats.todayAttendance || 0} 
            icon={<CheckCircle size={24} strokeWidth={2.5} />} 
            gradient="from-blue-400 to-indigo-500"
            delay={100}
            onClick={() => setActiveModal({
              title: "Attendance Today",
              value: stats.todayAttendance || 0,
              icon: <CheckCircle size={32} strokeWidth={2.5} />,
              gradient: "from-blue-400 to-indigo-500",
              description: "Number of employees who have clocked in for today's shift.",
              actionText: "View Attendance Register",
              actionPath: "/attendance"
            })}
          />
          <StatCard 
            title="Active Work Orders" 
            value={stats.activeWorkOrders || 0} 
            icon={<Briefcase size={24} strokeWidth={2.5} />} 
            gradient="from-amber-400 to-orange-500"
            delay={200}
            onClick={() => setActiveModal({
              title: "Active Work Orders",
              value: stats.activeWorkOrders || 0,
              icon: <Briefcase size={32} strokeWidth={2.5} />,
              gradient: "from-amber-400 to-orange-500",
              description: "Total number of work orders and projects currently in progress.",
              actionText: "Manage Work Orders",
              actionPath: "/work-orders"
            })}
          />
          <StatCard 
            title="Running Sites" 
            value={stats.activeSites || 0} 
            icon={<MapPin size={24} strokeWidth={2.5} />} 
            gradient="from-fuchsia-500 to-purple-600"
            delay={300}
            onClick={() => setActiveModal({
              title: "Running Sites",
              value: stats.activeSites || 0,
              icon: <MapPin size={32} strokeWidth={2.5} />,
              gradient: "from-fuchsia-500 to-purple-600",
              description: "Total number of operational field sites across all locations.",
              actionText: "View Sites",
              actionPath: "/sites"
            })}
          />
          <StatCard 
            title="Monthly Payroll" 
            value={`₹ ${(stats.monthlyPayroll || 0).toLocaleString()}`} 
            icon={<IndianRupee size={24} strokeWidth={2.5} />} 
            gradient="from-rose-400 to-red-500"
            delay={400}
            onClick={() => setActiveModal({
              title: "Monthly Payroll",
              value: `₹ ${(stats.monthlyPayroll || 0).toLocaleString()}`,
              icon: <IndianRupee size={32} strokeWidth={2.5} />,
              gradient: "from-rose-400 to-red-500",
              description: "Total net salary disbursed in the current monthly payroll cycle.",
              actionText: "Process Salary",
              actionPath: "/salary"
            })}
          />
        </div>
      </section>

      {/* ZONE 3: Visual Analytics */}
      <section className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Area Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-soft overflow-hidden p-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
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
          <div className="bg-white rounded-2xl shadow-soft overflow-hidden p-6 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-100">
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
      </section>

      {/* ZONE 4: The Live Feeds */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center space-x-2">
          <Activity size={20} className="text-emerald-500" />
          <span>Live Activity Feeds</span>
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Recent Invoices */}
          <div className="flex flex-col space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-200">
            <h3 className="text-[15px] font-bold text-slate-600 px-1">Recent Invoices</h3>
            <DataTable
              columns={[
                { header: 'Invoice', cell: (row) => <span className="font-semibold text-slate-800">{row.wo_no || `INV-${row.invoice_id}`}</span> },
                { header: 'Site', accessor: 'site_name' },
                { header: 'Amount', cell: (row) => `₹ ${parseFloat(row.amount).toLocaleString()}` },
                { header: 'Status', cell: (row) => <StatusBadge status={row.status || 'Unpaid'} /> }
              ]}
              data={stats.recentInvoices || []}
              searchable={false}
              emptyStateTitle="No Invoices"
            />
          </div>

          {/* HR Onboards */}
          <div className="flex flex-col space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-200">
            <h3 className="text-[15px] font-bold text-slate-600 px-1">Recent Onboards (HR)</h3>
            <DataTable
              columns={[
                { header: 'Employee', cell: (row) => <span className="font-semibold text-slate-800">{row.name}</span> },
                { header: 'Role', accessor: 'post' },
                { header: 'Status', cell: () => <StatusBadge status="Active" /> }
              ]}
              data={stats.recentEmployees || []}
              searchable={false}
              emptyStateTitle="No Recent Employees"
            />
          </div>

          {/* Recent AR */}
          <div className="flex flex-col space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-300">
            <h3 className="text-[15px] font-bold text-slate-600 px-1">Accounts Receivable (Live)</h3>
            <DataTable
              columns={[
                { header: 'Customer', cell: (row) => <span className="font-semibold text-slate-800">{row.customer_name}</span> },
                { header: 'Amount', cell: (row) => `₹ ${parseFloat(row.amount).toLocaleString()}` },
                { header: 'Status', cell: (row) => <StatusBadge status={row.cleared_status === 'Open' ? 'Pending' : 'Paid'} /> }
              ]}
              data={stats.recentAR || []}
              searchable={false}
              emptyStateTitle="No AR Entries"
            />
          </div>

          {/* Recent AP */}
          <div className="flex flex-col space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-300">
            <h3 className="text-[15px] font-bold text-slate-600 px-1">Accounts Payable (Live)</h3>
            <DataTable
              columns={[
                { header: 'Vendor', cell: (row) => <span className="font-semibold text-slate-800">{row.vendor_name}</span> },
                { header: 'Amount', cell: (row) => `₹ ${parseFloat(row.amount).toLocaleString()}` },
                { header: 'Status', cell: (row) => <StatusBadge status={row.cleared_status === 'Open' ? 'Pending' : 'Paid'} /> }
              ]}
              data={stats.recentAP || []}
              searchable={false}
              emptyStateTitle="No AP Entries"
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
