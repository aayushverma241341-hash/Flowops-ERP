import React, { useState, useEffect } from 'react';
import { Plus, FileText, AlertCircle, X, Download } from 'lucide-react';
import api from '../api/axios';

const WorkOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    wo_no: '',
    issue_date: new Date().toISOString().split('T')[0],
    end_date: '',
    description: '',
    copy_file: null
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/work-orders');
      setOrders(response.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch work orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleInputChange = (e) => {
    if (e.target.name === 'copy_file') {
      setFormData({ ...formData, copy_file: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append('wo_no', formData.wo_no);
      submitData.append('issue_date', formData.issue_date);
      if (formData.end_date) submitData.append('end_date', formData.end_date);
      submitData.append('description', formData.description);
      if (formData.copy_file) {
        submitData.append('copy_file', formData.copy_file);
      }

      await api.post('/work-orders', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setIsModalOpen(false);
      setFormData({ wo_no: '', issue_date: new Date().toISOString().split('T')[0], end_date: '', description: '', copy_file: null });
      fetchOrders(); // Refresh list
    } catch (err) {
      console.error(err);
      alert('Failed to add work order: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Work Orders</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus size={20} />
          <span>New Work Order</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center space-x-2 border border-red-100">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading work orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-10 text-gray-500 bg-white rounded-xl border border-gray-100">No work orders found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((wo) => (
            <div key={wo.wo_no} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-100 transition-colors">
                  <FileText size={24} />
                </div>
                <span className="text-sm font-medium text-gray-500">
                  {new Date(wo.issue_date).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{wo.wo_no}</h3>
              <p className="text-gray-600 text-sm line-clamp-2 mb-4">{wo.description}</p>
              {wo.copy_file_path && (
                <a 
                  href={`http://localhost:5000/${wo.copy_file_path}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                >
                  <Download size={16} className="mr-1" />
                  View Copy
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Work Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">Add New Work Order</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Work Order Number (Unique)</label>
                <input required type="text" name="wo_no" value={formData.wo_no} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                <input required type="date" name="issue_date" value={formData.issue_date} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea required name="description" value={formData.description} onChange={handleInputChange} rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 outline-none"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Copy of Work Order (Optional)</label>
                <input type="file" name="copy_file" onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                  {submitting ? 'Saving...' : 'Save Work Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkOrders;
