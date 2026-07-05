import React, { useState, useEffect } from 'react';
import { Users, Briefcase, MapPin, IndianRupee, Loader } from 'lucide-react';
import api from '../api/axios';

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4 hover:shadow-md transition-shadow duration-300">
    <div className={`p-3 rounded-lg ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
    </div>
  </div>
);

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
      <div className="flex items-center justify-center h-full">
        <Loader className="animate-spin text-primary-600" size={32} />
      </div>
    );
  }

  if (!stats) return <div className="p-4 text-red-500">Failed to load dashboard data.</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Employees" 
          value={stats.totalEmployees} 
          icon={<Users size={24} className="text-blue-600" />} 
          color="bg-blue-50" 
        />
        <StatCard 
          title="Active Work Orders" 
          value={stats.activeWorkOrders} 
          icon={<Briefcase size={24} className="text-emerald-600" />} 
          color="bg-emerald-50" 
        />
        <StatCard 
          title="Sites Running" 
          value={stats.activeSites} 
          icon={<MapPin size={24} className="text-purple-600" />} 
          color="bg-purple-50" 
        />
        <StatCard 
          title="Monthly Payroll" 
          value={`₹ ${stats.monthlyPayroll.toLocaleString()}`} 
          icon={<IndianRupee size={24} className="text-amber-600" />} 
          color="bg-amber-50" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Employees</h3>
          <div className="space-y-4">
            {stats.recentEmployees.map((emp) => (
              <div key={emp.employee_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold uppercase">
                    {emp.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{emp.name}</p>
                    <p className="text-xs text-gray-500">{emp.category || emp.post || 'Employee'}</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Active</span>
              </div>
            ))}
            {stats.recentEmployees.length === 0 && <p className="text-sm text-gray-500 text-center py-2">No recent employees</p>}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Invoices</h3>
          <div className="space-y-4">
            {stats.recentInvoices.map((inv) => (
              <div key={inv.invoice_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer">
                <div>
                  <p className="font-medium text-gray-900">{inv.wo_no || `INV-${inv.invoice_id}`}</p>
                  <p className="text-xs text-gray-500">{inv.site_name || 'General Site'}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">₹ {parseFloat(inv.amount).toLocaleString()}</p>
                  <p className={`text-xs ${inv.status === 'Paid' ? 'text-emerald-500' : 'text-rose-500'}`}>{inv.status || 'Unpaid'}</p>
                </div>
              </div>
            ))}
            {stats.recentInvoices.length === 0 && <p className="text-sm text-gray-500 text-center py-2">No recent invoices</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
