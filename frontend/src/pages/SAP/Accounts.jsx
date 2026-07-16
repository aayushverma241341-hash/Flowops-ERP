import React, { useState, useEffect } from 'react';
import { 
  BookOpen, FileText, ArrowDownLeft, ArrowUpRight, 
  Building2, Wallet, Landmark, RefreshCw, Loader 
} from 'lucide-react';
import api from '../../api/axios';

const FIModule = () => {
  const [activeTab, setActiveTab] = useState('GL');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'GL', label: 'General Ledger', icon: <BookOpen size={18} /> },
    { id: 'AR', label: 'Accounts Receivable', icon: <ArrowDownLeft size={18} /> },
    { id: 'AP', label: 'Accounts Payable', icon: <ArrowUpRight size={18} /> },
    { id: 'COA', label: 'Chart of Accounts', icon: <Landmark size={18} /> },
    { id: 'ASSETS', label: 'Fixed Assets', icon: <Building2 size={18} /> },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      switch (activeTab) {
        case 'GL': endpoint = '/fi/gl'; break;
        case 'AR': endpoint = '/fi/ar'; break;
        case 'AP': endpoint = '/fi/ap'; break;
        case 'COA': endpoint = '/fi/coa'; break;
        case 'ASSETS': endpoint = '/fi/assets'; break;
        default: endpoint = '/fi/gl';
      }
      const response = await api.get(endpoint);
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch FI data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
            Financial Accounting (FI)
          </h1>
          <p className="text-slate-500 mt-1">Manage ledgers, payables, receivables, and company assets.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={fetchData}
            className="flex items-center space-x-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Sync SAP</span>
          </button>
          <button className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-md shadow-indigo-600/20">
            <Wallet size={16} />
            <span>Post Entry</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex overflow-x-auto hide-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[500px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 space-y-4">
            <Loader size={32} className="animate-spin text-indigo-500" />
            <p className="text-slate-500 font-medium">Loading ledger data...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96">
            <FileText size={48} className="text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">No records found for {tabs.find(t => t.id === activeTab)?.label}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  {/* Dynamic Headers based on active tab */}
                  {activeTab === 'GL' && (
                    <>
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Account</th>
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Doc Type</th>
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Debit (₹)</th>
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Credit (₹)</th>
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Text</th>
                    </>
                  )}
                  {(activeTab === 'AR' || activeTab === 'AP') && (
                    <>
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice No</th>
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Entity</th>
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Doc Date</th>
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Due Date</th>
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amount (₹)</th>
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                    </>
                  )}
                  {activeTab === 'COA' && (
                    <>
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Account Code</th>
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Account Name</th>
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Group</th>
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                    </>
                  )}
                  {activeTab === 'ASSETS' && (
                    <>
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Asset ID</th>
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Class</th>
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acquisition (₹)</th>
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Depreciation (₹)</th>
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">NBV (₹)</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    {/* General Ledger Rows */}
                    {activeTab === 'GL' && (
                      <>
                        <td className="py-4 px-6 text-sm text-slate-700 whitespace-nowrap">{new Date(row.transaction_date).toLocaleDateString()}</td>
                        <td className="py-4 px-6 text-sm font-medium text-indigo-600">{row.account_code}</td>
                        <td className="py-4 px-6 text-sm text-slate-500">{row.document_type}</td>
                        <td className="py-4 px-6 text-sm font-semibold text-slate-700 text-right">{parseFloat(row.debit_amount) > 0 ? parseFloat(row.debit_amount).toLocaleString() : '-'}</td>
                        <td className="py-4 px-6 text-sm font-semibold text-slate-700 text-right">{parseFloat(row.credit_amount) > 0 ? parseFloat(row.credit_amount).toLocaleString() : '-'}</td>
                        <td className="py-4 px-6 text-sm text-slate-500 truncate max-w-[200px]">{row.text}</td>
                      </>
                    )}

                    {/* AR/AP Rows */}
                    {(activeTab === 'AR' || activeTab === 'AP') && (
                      <>
                        <td className="py-4 px-6 text-sm font-bold text-slate-700">{row.invoice_no}</td>
                        <td className="py-4 px-6 text-sm font-medium text-slate-900">{activeTab === 'AR' ? row.customer_name : row.vendor_name}</td>
                        <td className="py-4 px-6 text-sm text-slate-500">{new Date(row.doc_date).toLocaleDateString()}</td>
                        <td className="py-4 px-6 text-sm text-slate-500">{new Date(row.due_date).toLocaleDateString()}</td>
                        <td className="py-4 px-6 text-sm font-bold text-slate-700 text-right">{parseFloat(row.amount).toLocaleString()}</td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            row.cleared_status === 'Cleared' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-orange-50 text-orange-700 border-orange-200'
                          }`}>
                            {row.cleared_status}
                          </span>
                        </td>
                      </>
                    )}

                    {/* Chart of Accounts Rows */}
                    {activeTab === 'COA' && (
                      <>
                        <td className="py-4 px-6 text-sm font-bold text-indigo-600">{row.account_code}</td>
                        <td className="py-4 px-6 text-sm font-medium text-slate-900">{row.account_name}</td>
                        <td className="py-4 px-6 text-sm text-slate-500">{row.account_group}</td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {row.statement_type}
                          </span>
                        </td>
                      </>
                    )}

                    {/* Fixed Assets Rows */}
                    {activeTab === 'ASSETS' && (
                      <>
                        <td className="py-4 px-6 text-sm font-bold text-indigo-600">{row.asset_id}</td>
                        <td className="py-4 px-6 text-sm font-medium text-slate-900">{row.description}</td>
                        <td className="py-4 px-6 text-sm text-slate-500">{row.asset_class}</td>
                        <td className="py-4 px-6 text-sm font-semibold text-slate-700 text-right">{parseFloat(row.acquisition_val).toLocaleString()}</td>
                        <td className="py-4 px-6 text-sm font-semibold text-rose-600 text-right">-{parseFloat(row.accum_depreciation).toLocaleString()}</td>
                        <td className="py-4 px-6 text-sm font-bold text-emerald-600 text-right">{parseFloat(row.net_book_val).toLocaleString()}</td>
                      </>
                    )}
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

export default FIModule;
