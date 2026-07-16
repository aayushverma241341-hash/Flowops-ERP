import React, { useState, useEffect } from 'react';
import { Building2, RefreshCw, Loader, FileText, Wallet } from 'lucide-react';
import api from '../../api/axios';

const FixedAssets = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/fi/assets');
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch Assets data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
            Fixed Assets Management
          </h1>
          <p className="text-slate-500 mt-1">Manage company assets, acquisition value, and depreciation.</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={fetchData} className="flex items-center space-x-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Sync</span>
          </button>
          <button className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-md shadow-indigo-600/20">
            <Wallet size={16} />
            <span>Add Asset</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[500px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 space-y-4">
            <Loader size={32} className="animate-spin text-indigo-500" />
            <p className="text-slate-500 font-medium">Loading assets...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96">
            <FileText size={48} className="text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">No records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Asset ID</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Class</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acquisition (₹)</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Depreciation (₹)</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">NBV (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 text-sm font-bold text-indigo-600">{row.asset_id}</td>
                    <td className="py-4 px-6 text-sm font-medium text-slate-900">{row.description}</td>
                    <td className="py-4 px-6 text-sm text-slate-500">{row.asset_class}</td>
                    <td className="py-4 px-6 text-sm font-semibold text-slate-700 text-right">{parseFloat(row.acquisition_val).toLocaleString()}</td>
                    <td className="py-4 px-6 text-sm font-semibold text-rose-600 text-right">-{parseFloat(row.accum_depreciation).toLocaleString()}</td>
                    <td className="py-4 px-6 text-sm font-bold text-emerald-600 text-right">{parseFloat(row.net_book_val).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FixedAssets;
