import React, { useState, useEffect } from 'react';
import { Factory, Calendar, Settings2, GitMerge } from 'lucide-react';
import api from '../../api/axios';

const ProductionPlanning = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [data, setData] = useState({
    orders: [],
    mrp: [],
    routings: [],
    boms: []
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
        case 'orders': endpoint = '/pp/production-orders'; break;
        case 'mrp': endpoint = '/pp/mrp-runs'; break;
        case 'routings': endpoint = '/pp/routings'; break;
        case 'boms': endpoint = '/pp/boms'; break;
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
    { id: 'orders', label: 'Production Orders (CO01-CO15)', icon: <Factory size={20} />, desc: 'Manage manufacturing orders' },
    { id: 'mrp', label: 'MRP Runs (MD01-MD04)', icon: <Calendar size={20} />, desc: 'Material Requirements Planning' },
    { id: 'routings', label: 'Routings (CA01)', icon: <Settings2 size={20} />, desc: 'Define production operations sequences' },
    { id: 'boms', label: 'Bill of Materials (CS01)', icon: <GitMerge size={20} />, desc: 'Product component structures' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Production Planning (PP)</h1>
        <p className="text-gray-600">Manage manufacturing orders, MRP runs, routings, and bill of materials.</p>
        
        <div className="flex space-x-1 overflow-x-auto mt-6 bg-gray-50 p-1 rounded-lg">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center p-4 rounded-md transition-colors min-w-[200px] ${
                activeTab === tab.id 
                  ? 'bg-white shadow-sm border border-gray-200 text-indigo-600' 
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                {activeTab === 'orders' && (
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                )}
                {activeTab === 'mrp' && (
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Run No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requirements</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Planned Orders</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                )}
                {activeTab === 'routings' && (
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Routing No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operations</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                )}
                {activeTab === 'boms' && (
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BOM No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Qty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Components</th>
                  </tr>
                )}
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeTab === 'orders' && data.orders.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">{item.order_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.material_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.plant}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity} {item.uom}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.start_date).toLocaleDateString()} &rarr; {new Date(item.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
                
                {activeTab === 'mrp' && data.mrp.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">{item.run_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.material_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.plant}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">{item.total_requirements}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">{item.planned_orders_qty}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.status}</td>
                  </tr>
                ))}

                {activeTab === 'routings' && data.routings.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">{item.routing_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.material_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.plant}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {JSON.stringify(item.operations)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.status}</td>
                  </tr>
                ))}

                {activeTab === 'boms' && data.boms.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">{item.bom_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.material_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.plant}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.base_quantity}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {JSON.stringify(item.components)}
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

export default ProductionPlanning;
