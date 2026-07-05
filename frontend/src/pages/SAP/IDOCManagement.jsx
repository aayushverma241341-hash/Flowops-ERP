import React, { useState, useEffect } from 'react';
import { Layers, RefreshCw, Search, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import api from '../../api/axios';

const IDOCManagement = () => {
  const [idocs, setIdocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/edi/idocs');
      setIdocs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case '53': return <CheckCircle2 className="text-green-500" size={16} />;
      case '51': return <XCircle className="text-red-500" size={16} />;
      case '68': return <AlertCircle className="text-orange-500" size={16} />;
      case '64': return <RefreshCw className="text-blue-500" size={16} />;
      default: return <AlertCircle className="text-gray-500" size={16} />;
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case '53': return 'Application doc. posted (Success)';
      case '51': return 'Application doc. not posted (Error)';
      case '68': return 'Error - no further processing';
      case '64': return 'IDoc ready to be transferred';
      default: return `Status ${status}`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">EDI / IDOC Management (WE02/BD87)</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor and reprocess inbound/outbound integration documents.</p>
        </div>
        <button onClick={fetchData} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
          <RefreshCw size={16} /> <span>Refresh Data</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search IDOC number..." 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-64 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 text-sm font-medium">
              Reprocess Failed IDOCs (BD87)
            </button>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-10 text-gray-500">Loading IDOCs...</div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-y border-gray-200">
                  <tr>
                    <th className="px-6 py-3">IDOC Number</th>
                    <th className="px-6 py-3">Message Type</th>
                    <th className="px-6 py-3">Sender Port</th>
                    <th className="px-6 py-3">Receiver Port</th>
                    <th className="px-6 py-3">Created At</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {idocs.map((idoc) => (
                    <tr key={idoc.idoc_id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-indigo-600 cursor-pointer hover:underline">{idoc.idoc_number}</td>
                      <td className="px-6 py-4 font-semibold">{idoc.message_type}</td>
                      <td className="px-6 py-4 text-gray-600">{idoc.sender_port}</td>
                      <td className="px-6 py-4 text-gray-600">{idoc.receiver_port}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{new Date(idoc.created_at).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(idoc.status)}
                          <span className="text-xs font-medium text-gray-700">{getStatusText(idoc.status)}</span>
                        </div>
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

export default IDOCManagement;
