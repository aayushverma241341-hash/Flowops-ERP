import React, { useState, useEffect } from 'react';
import { Landmark, TrendingUp, DollarSign, BookOpen, Layers, Building, ArrowLeft, Loader2 } from 'lucide-react';

import * as XLSX from 'xlsx';

export default function Accounts() {
  const [activeModule, setActiveModule] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const accountFeatures = [
    {
      id: 'ar',
      title: 'Accounts Receivable (FB70/F-28/FBL5N)',
      icon: <TrendingUp className="text-emerald-600" size={28} />,
      bg: 'bg-emerald-100',
      description: 'Manages the collection of payments owed to the organization by customers. It includes features like invoice capture, approval, and reconciliation.',
      endpoint: '/api/fi/ar',
      columns: ['Invoice Number', 'Customer Name', 'Amount', 'Due Date', 'Status']
    },
    {
      id: 'ap',
      title: 'Accounts Payable (FB60/F-53/FBL1N)',
      icon: <DollarSign className="text-rose-600" size={28} />,
      bg: 'bg-rose-100',
      description: 'Manages the payment of expenses owed to the organization by suppliers. It includes features like invoice capture, approval, and reconciliation.',
      endpoint: '/api/fi/ap',
      columns: ['Invoice Number', 'Vendor Name', 'Amount', 'Due Date', 'Status']
    },
    {
      id: 'gl',
      title: 'General Ledger (FB50/FBL3N/FS10N)',
      icon: <Landmark className="text-indigo-600" size={28} />,
      bg: 'bg-indigo-100',
      description: 'Holds financial information such as bank statements and balance sheets, and is crucial for maintaining accurate financial records.',
      endpoint: '/api/fi/gl',
      columns: ['Date', 'Document', 'Description', 'Account Code', 'Debit', 'Credit']
    },
    {
      id: 'coa',
      title: 'Chart of Accounts',
      icon: <Layers className="text-amber-600" size={28} />,
      bg: 'bg-amber-100',
      description: 'Organizes and categorizes financial transactions. Includes Financial Statements (F.01) capabilities for Balance Sheet & P&L.',
      endpoint: '/api/fi/coa',
      columns: ['Account Code', 'Account Name', 'Type', 'Balance', 'Currency']
    },
    {
      id: 'assets',
      title: 'Fixed Assets Management',
      icon: <Building className="text-blue-600" size={28} />,
      bg: 'bg-blue-100',
      description: 'Manages the acquisition, maintenance, and disposal of fixed assets within the organization.',
      endpoint: '/api/fi/assets',
      columns: ['Asset Number', 'Asset Name', 'Class', 'Purchase Date', 'Purchase Value', 'Book Value', 'Status']
    }
  ];

  const exportToExcel = () => {
    if (!data || !data.length) return;
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, activeModule);
    XLSX.writeFile(workbook, `${activeModule}_export.xlsx`);
  };

  useEffect(() => {
    if (activeModule) {
      setLoading(true);
      const moduleConfig = accountFeatures.find(f => f.id === activeModule);
      fetch(`http://localhost:5000${moduleConfig.endpoint}`)
        .then(res => res.json())
        .then(data => {
          setData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching FI data:", err);
          setLoading(false);
        });
    }
  }, [activeModule]);

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="border-b pb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Landmark className="text-indigo-600" size={32} />
          Financial Accounts (FI)
        </h1>
        <p className="mt-3 text-gray-600 text-lg max-w-4xl">
          The Accounts Module is designed to manage financial transactions and generate financial statements for external reporting purposes. These features ensure that financial data is accurate, up-to-date, and compliant with accounting standards, providing a clear picture of the organization's financial health.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {accountFeatures.map((feature) => (
          <div key={feature.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start gap-4 mb-4">
              <div className={`${feature.bg} p-3 rounded-xl shrink-0`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 leading-tight pt-1">
                {feature.title}
              </h3>
            </div>
            <p className="text-gray-600 leading-relaxed mb-6">
              {feature.description}
            </p>
            <button 
              onClick={() => setActiveModule(feature.id)}
              className="text-indigo-600 font-medium text-sm hover:text-indigo-800 transition-colors flex items-center gap-1"
            >
              Access Module &rarr;
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTable = () => {
    const moduleConfig = accountFeatures.find(f => f.id === activeModule);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setActiveModule(null)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
            >
              <ArrowLeft size={24} />
            </button>
            <div className={`${moduleConfig.bg} p-2 rounded-lg`}>
              {moduleConfig.icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{moduleConfig.title}</h1>
              <p className="text-gray-500 text-sm">{data.length} records found</p>
            </div>
          </div>
          <button onClick={exportToExcel} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
            Export Data
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {moduleConfig.columns.map((col, idx) => (
                      <th key={idx} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      {activeModule === 'ar' && (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.invoice_number}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.customer_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">₹{parseFloat(row.amount).toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(row.due_date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              row.status === 'Paid' ? 'bg-green-100 text-green-800' : 
                              row.status === 'Overdue' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {row.status}
                            </span>
                          </td>
                        </>
                      )}
                      {activeModule === 'ap' && (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.invoice_number}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.vendor_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">₹{parseFloat(row.amount).toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(row.due_date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              row.status === 'Paid' ? 'bg-green-100 text-green-800' : 
                              row.status === 'Overdue' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {row.status}
                            </span>
                          </td>
                        </>
                      )}
                      {activeModule === 'gl' && (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(row.transaction_date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.document_number}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.description}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.account_code}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 font-medium">₹{parseFloat(row.debit).toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-rose-600 font-medium">₹{parseFloat(row.credit).toLocaleString()}</td>
                        </>
                      )}
                      {activeModule === 'coa' && (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.account_code}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.account_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.account_type}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">₹{parseFloat(row.balance).toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.currency}</td>
                        </>
                      )}
                      {activeModule === 'assets' && (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.asset_number}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.asset_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.asset_class}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(row.purchase_date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{parseFloat(row.purchase_value).toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 font-semibold">₹{parseFloat(row.current_book_value).toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {row.status}
                            </span>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                  {data.length === 0 && (
                    <tr>
                      <td colSpan={moduleConfig.columns.length} className="px-6 py-12 text-center text-gray-500">
                        No records found for this module.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  return activeModule ? renderTable() : renderOverview();
}
