import React, { useState } from 'react';
import { CreditCard, BookOpen, Layers, Briefcase, FileText } from 'lucide-react';

import ChartOfAccounts from './ChartOfAccounts';
import GeneralLedger from './GeneralLedger';
import AccountsReceivable from './AccountsReceivable';
import AccountsPayable from './AccountsPayable';
import FixedAssets from './FixedAssets';

const Accounts = () => {
  const [activeTab, setActiveTab] = useState('coa');

  const tabs = [
    { id: 'coa', label: 'Chart of Accounts', icon: <Briefcase size={16} /> },
    { id: 'gl', label: 'General Ledger', icon: <BookOpen size={16} /> },
    { id: 'ar', label: 'Accounts Receivable', icon: <FileText size={16} /> },
    { id: 'ap', label: 'Accounts Payable', icon: <CreditCard size={16} /> },
    { id: 'assets', label: 'Fixed Assets', icon: <Layers size={16} /> },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
            Financial Accounting (FI)
          </h1>
          <p className="text-slate-500 mt-1">Command center for all accounting modules and master data.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 overflow-x-auto">
        <div className="flex space-x-2 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'coa' && <ChartOfAccounts />}
        {activeTab === 'gl' && <GeneralLedger />}
        {activeTab === 'ar' && <AccountsReceivable />}
        {activeTab === 'ap' && <AccountsPayable />}
        {activeTab === 'assets' && <FixedAssets />}
      </div>
    </div>
  );
};

export default Accounts;
