import React, { useState, useEffect } from 'react';
import { ShoppingCart, FileText, Briefcase, FileSignature, RefreshCw, Search, Plus } from 'lucide-react';
import api from '../../api/axios';

const Procurement = () => {
  const [activeTab, setActiveTab] = useState('pr');
  const [prs, setPrs] = useState([]);
  const [rfqs, setRfqs] = useState([]);
  const [infoRecords, setInfoRecords] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'pr') {
        const res = await api.get('/sap/prs');
        setPrs(res.data);
      } else if (activeTab === 'rfq') {
        const res = await api.get('/sap/rfqs');
        setRfqs(res.data);
      } else if (activeTab === 'info') {
        const res = await api.get('/sap/info-records');
        setInfoRecords(res.data);
      } else if (activeTab === 'contract') {
        const res = await api.get('/sap/contracts');
        setContracts(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'pr', label: 'Purchase Requisitions (ME51N)', icon: <ShoppingCart size={18} /> },
    { id: 'rfq', label: 'RFQs (ME41)', icon: <FileText size={18} /> },
    { id: 'info', label: 'Info Records (ME11)', icon: <Briefcase size={18} /> },
    { id: 'contract', label: 'Contracts (ME31K)', icon: <FileSignature size={18} /> }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Procurement</h1>
          <p className="text-sm text-gray-500 mt-1">Manage purchase requisitions, RFQs, info records, and contracts.</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={fetchData} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
            <RefreshCw size={16} /> <span>Refresh</span>
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2">
            <Plus size={16} /> <span>Create New</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 flex items-center space-x-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-64 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-10 text-gray-500">Loading Data...</div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-y border-gray-200">
                  {activeTab === 'pr' && (
                    <tr>
                      <th className="px-6 py-3">PR Number</th>
                      <th className="px-6 py-3">Material</th>
                      <th className="px-6 py-3">Quantity</th>
                      <th className="px-6 py-3">Req Date</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  )}
                  {activeTab === 'rfq' && (
                    <tr>
                      <th className="px-6 py-3">RFQ Number</th>
                      <th className="px-6 py-3">Material</th>
                      <th className="px-6 py-3">Vendor</th>
                      <th className="px-6 py-3">Deadline</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  )}
                  {activeTab === 'info' && (
                    <tr>
                      <th className="px-6 py-3">Info Record</th>
                      <th className="px-6 py-3">Material</th>
                      <th className="px-6 py-3">Vendor</th>
                      <th className="px-6 py-3">Net Price</th>
                      <th className="px-6 py-3">Valid To</th>
                    </tr>
                  )}
                  {activeTab === 'contract' && (
                    <tr>
                      <th className="px-6 py-3">Contract</th>
                      <th className="px-6 py-3">Vendor</th>
                      <th className="px-6 py-3">Target Value</th>
                      <th className="px-6 py-3">Validity</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {activeTab === 'pr' && prs.map((pr) => (
                    <tr key={pr.pr_id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{pr.pr_number}</td>
                      <td className="px-6 py-4">{pr.material}</td>
                      <td className="px-6 py-4">{pr.quantity}</td>
                      <td className="px-6 py-4">{new Date(pr.req_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${pr.status === 'Approved' ? 'bg-green-100 text-green-800' : pr.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {pr.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {activeTab === 'rfq' && rfqs.map((rfq) => (
                    <tr key={rfq.rfq_id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{rfq.rfq_number}</td>
                      <td className="px-6 py-4">{rfq.material}</td>
                      <td className="px-6 py-4">{rfq.vendor_name}</td>
                      <td className="px-6 py-4">{new Date(rfq.deadline).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${rfq.status === 'Quoted' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                          {rfq.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {activeTab === 'info' && infoRecords.map((info) => (
                    <tr key={info.info_id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{info.info_number}</td>
                      <td className="px-6 py-4">{info.material}</td>
                      <td className="px-6 py-4">{info.vendor_name}</td>
                      <td className="px-6 py-4 font-bold text-gray-900">${info.net_price}</td>
                      <td className="px-6 py-4">{new Date(info.valid_to).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {activeTab === 'contract' && contracts.map((c) => (
                    <tr key={c.contract_id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{c.contract_number}</td>
                      <td className="px-6 py-4">{c.vendor_name}</td>
                      <td className="px-6 py-4 font-bold">${c.target_value}</td>
                      <td className="px-6 py-4">{new Date(c.valid_from).toLocaleDateString()} - {new Date(c.valid_to).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Procurement;
