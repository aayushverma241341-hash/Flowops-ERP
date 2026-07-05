import React, { useState, useEffect } from 'react';
import { PackageSearch, ArrowRightLeft, ClipboardCheck } from 'lucide-react';
import api from '../../api/axios';

const Inventory = () => {
  const [activeTab, setActiveTab] = useState('goods_movement');
  const [data, setData] = useState({
    goods_movement: [],
    stock_overview: [],
    physical_inventory: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const fetchData = async (tab) => {
    setLoading(true);
    try {
      let endpoint = '';
      switch (tab) {
        case 'goods_movement': endpoint = '/sap/material-documents'; break;
        case 'stock_overview': endpoint = '/sap/stock-overview'; break;
        case 'physical_inventory': endpoint = '/sap/physical-inventory'; break;
        default: break;
      }
      
      if (endpoint) {
        const response = await api.get(endpoint);
        setData(prev => ({ ...prev, [tab]: response.data }));
      }
    } catch (error) {
      console.error(`Error fetching ${tab}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'goods_movement', label: 'Goods Movement (MIGO, MB1A-C)', icon: <ArrowRightLeft size={20} />, desc: 'Receipts, issues, transfer postings' },
    { id: 'stock_overview', label: 'Stock Overview (MMBE, MB52)', icon: <PackageSearch size={20} />, desc: 'Warehouse stock and reporting' },
    { id: 'physical_inventory', label: 'Physical Inventory (MI01-MI24)', icon: <ClipboardCheck size={20} />, desc: 'Inventory counts and differences' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Inventory Management & PI</h1>
        <p className="text-gray-600">Manage goods movements, comprehensive stock overviews, and physical inventory counting.</p>
        
        <div className="flex space-x-1 overflow-x-auto mt-6 bg-gray-50 p-1 rounded-lg">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center p-4 rounded-md transition-colors min-w-[200px] ${
                activeTab === tab.id 
                  ? 'bg-white shadow-sm border border-gray-200 text-teal-600' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.icon}
              <span className="font-semibold mt-2 text-sm text-center">{tab.label}</span>
              <span className="text-xs mt-1 text-center opacity-75">{tab.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                {activeTab === 'goods_movement' && (
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doc Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mvmt Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                )}
                {activeTab === 'stock_overview' && (
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plant / SLoc</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unrestricted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">QA / Blocked</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">In Transit</th>
                  </tr>
                )}
                {activeTab === 'physical_inventory' && (
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PI Doc No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plant / SLoc</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doc Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items Overview</th>
                  </tr>
                )}
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeTab === 'goods_movement' && data.goods_movement.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-teal-600">{item.doc_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.material}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">{item.movement_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.posting_date).toLocaleDateString()}</td>
                  </tr>
                ))}
                
                {activeTab === 'stock_overview' && data.stock_overview.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-teal-600">{item.material_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.plant} / {item.storage_loc}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.batch || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">{item.unrestricted_stock}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">{item.quality_inspection} / <span className="text-red-500">{item.blocked_stock}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">{item.in_transit}</td>
                  </tr>
                ))}

                {activeTab === 'physical_inventory' && data.physical_inventory.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-teal-600">{item.doc_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.plant} / {item.storage_loc}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.doc_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.planned_count_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === 'POSTED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {JSON.stringify(item.items)}
                    </td>
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

export default Inventory;
