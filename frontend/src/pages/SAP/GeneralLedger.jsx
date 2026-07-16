import React, { useState, useEffect } from 'react';
import { BookOpen, RefreshCw, Loader, FileText, Wallet } from 'lucide-react';
import api from '../../api/axios';

const GeneralLedger = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/fi/gl');
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch GL data:', error);
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
            General Ledger
          </h1>
          <p className="text-slate-500 mt-1">View all journal entries and financial postings (FB50/FBL3N).</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={fetchData} className="flex items-center space-x-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Sync</span>
          </button>
          <button className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-md shadow-indigo-600/20">
            <Wallet size={16} />
            <span>Post Entry</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[500px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 space-y-4">
            <Loader size={32} className="animate-spin text-indigo-500" />
            <p className="text-slate-500 font-medium">Loading ledger...</p>
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
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Account</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Doc Type</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Debit (₹)</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Credit (₹)</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Text</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 text-sm text-slate-700 whitespace-nowrap">{new Date(row.transaction_date).toLocaleDateString()}</td>
                    <td className="py-4 px-6 text-sm font-medium text-indigo-600">{row.account_code}</td>
                    <td className="py-4 px-6 text-sm text-slate-500">{row.document_type}</td>
                    <td className="py-4 px-6 text-sm font-semibold text-slate-700 text-right">{parseFloat(row.debit_amount) > 0 ? parseFloat(row.debit_amount).toLocaleString() : '-'}</td>
                    <td className="py-4 px-6 text-sm font-semibold text-slate-700 text-right">{parseFloat(row.credit_amount) > 0 ? parseFloat(row.credit_amount).toLocaleString() : '-'}</td>
                    <td className="py-4 px-6 text-sm text-slate-500 truncate max-w-[200px]">{row.text}</td>
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

export default GeneralLedger;
