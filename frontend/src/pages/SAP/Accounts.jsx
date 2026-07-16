import React, { useState } from 'react';
import AccountsReceivable from './AccountsReceivable';
import AccountsPayable from './AccountsPayable';
import GeneralLedger from './GeneralLedger';
import ChartOfAccounts from './ChartOfAccounts';
import FixedAssets from './FixedAssets';
import { BookOpen, CreditCard, DollarSign, PieChart, Landmark } from 'lucide-react';

const Accounts = () => {
  const [activeTab, setActiveTab] = useState('ar');

  const tabs = [
    { id: 'ar', label: 'Accounts Receivable', icon: <DollarSign size={18} /> },
    { id: 'ap', label: 'Accounts Payable', icon: <CreditCard size={18} /> },
    { id: 'gl', label: 'General Ledger', icon: <BookOpen size={18} /> },
    { id: 'coa', label: 'Chart of Accounts', icon: <PieChart size={18} /> },
    { id: 'fa', label: 'Fixed Assets', icon: <Landmark size={18} /> },
  ];

  return (
    <div className="space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Financial Accounting (FI)</h1>
          <p className="text-slate-500 mt-1">Manage receivables, payables, ledgers, and fixed assets.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 flex space-x-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'ar' && <AccountsReceivable />}
        {activeTab === 'ap' && <AccountsPayable />}
        {activeTab === 'gl' && <GeneralLedger />}
        {activeTab === 'coa' && <ChartOfAccounts />}
        {activeTab === 'fa' && <FixedAssets />}
      </div>
    </div>
  );
};

export default Accounts;
