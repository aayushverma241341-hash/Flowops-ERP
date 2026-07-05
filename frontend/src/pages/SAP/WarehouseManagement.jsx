import React, { useState, useEffect } from 'react';
import { Package, MapPin, Truck, RefreshCw, Plus, Search } from 'lucide-react';
import api from '../../api/axios';

const WarehouseManagement = () => {
  const [activeTab, setActiveTab] = useState('bins');
  const [bins, setBins] = useState([]);
  const [trs, setTrs] = useState([]);
  const [tos, setTos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'bins') {
        const res = await api.get('/wm/bins');
        setBins(res.data);
      } else if (activeTab === 'tr') {
        const res = await api.get('/wm/trs');
        setTrs(res.data);
      } else if (activeTab === 'to') {
        const res = await api.get('/wm/tos');
        setTos(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'bins', label: 'Bin Master (LS01/LS03)', icon: <MapPin size={18} /> },
    { id: 'tr', label: 'Transfer Requirements (LB10)', icon: <Package size={18} /> },
    { id: 'to', label: 'Transfer Orders (LT01/LT21)', icon: <Truck size={18} /> }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Warehouse Management (WM)</h1>
          <p className="text-sm text-gray-500 mt-1">Manage storage bins, capacities, and material movements.</p>
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
                placeholder="Search records..." 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-64 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-10 text-gray-500">Loading WM Data...</div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-y border-gray-200">
                  {activeTab === 'bins' && (
                    <tr>
                      <th className="px-6 py-3">Bin ID</th>
                      <th className="px-6 py-3">Warehouse</th>
                      <th className="px-6 py-3">Storage Type</th>
                      <th className="px-6 py-3">Capacity (Cur/Max)</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  )}
                  {activeTab === 'tr' && (
                    <tr>
                      <th className="px-6 py-3">TR Number</th>
                      <th className="px-6 py-3">Material</th>
                      <th className="px-6 py-3">Required Qty</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  )}
                  {activeTab === 'to' && (
                    <tr>
                      <th className="px-6 py-3">TO Number</th>
                      <th className="px-6 py-3">TR Ref</th>
                      <th className="px-6 py-3">Material</th>
                      <th className="px-6 py-3">Movement (Src &rarr; Dest)</th>
                      <th className="px-6 py-3">Qty</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {activeTab === 'bins' && bins.map((bin) => (
                    <tr key={bin.bin_id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{bin.storage_bin}</td>
                      <td className="px-6 py-4">{bin.warehouse_no}</td>
                      <td className="px-6 py-4">{bin.storage_type}</td>
                      <td className="px-6 py-4">{bin.current_capacity} / {bin.max_capacity}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${bin.status === 'Full' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {bin.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {activeTab === 'tr' && trs.map((tr) => (
                    <tr key={tr.tr_id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{tr.tr_number}</td>
                      <td className="px-6 py-4">{tr.material}</td>
                      <td className="px-6 py-4">{tr.req_quantity}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${tr.status === 'Processed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                          {tr.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {activeTab === 'to' && tos.map((to) => (
                    <tr key={to.to_id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{to.to_number}</td>
                      <td className="px-6 py-4">{to.tr_number}</td>
                      <td className="px-6 py-4">{to.material}</td>
                      <td className="px-6 py-4">{to.source_bin} &rarr; {to.dest_bin}</td>
                      <td className="px-6 py-4">{to.quantity}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${to.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                          {to.status}
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

export default WarehouseManagement;
