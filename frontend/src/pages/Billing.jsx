import React, { useState, useEffect } from 'react';
import { FileText, Plus, Download, AlertCircle, X, Trash2, Edit } from 'lucide-react';
import api from '../api/axios';

const Billing = () => {
  const [invoices, setInvoices] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    wo_no: '',
    site_id: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days from now
  });
  const [details, setDetails] = useState([
    { description: '', quantity: 1, rate: 0, amount: 0 }
  ]);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusData, setStatusData] = useState({
    invoice_id: null,
    status: 'Paid',
    credited_date: new Date().toISOString().split('T')[0]
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invRes, woRes, siteRes] = await Promise.all([
        api.get('/billing'),
        api.get('/work-orders'),
        api.get('/sites')
      ]);
      setInvoices(invRes.data);
      setWorkOrders(woRes.data);
      setSites(siteRes.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDetailChange = (index, field, value) => {
    const newDetails = [...details];
    newDetails[index][field] = value;
    
    // Auto-calculate amount if quantity or rate changes
    if (field === 'quantity' || field === 'rate') {
      newDetails[index].amount = newDetails[index].quantity * newDetails[index].rate;
    }
    
    setDetails(newDetails);
  };

  const addDetailRow = () => {
    setDetails([...details, { description: '', quantity: 1, rate: 0, amount: 0 }]);
  };

  const removeDetailRow = (index) => {
    setDetails(details.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return details.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const payload = {
      ...formData,
      amount: calculateTotal(),
      details: details.filter(d => d.description.trim() !== '')
    };

    if (payload.details.length === 0) {
      alert("Please add at least one valid invoice item.");
      setSubmitting(false);
      return;
    }

    try {
      await api.post('/billing/create', payload);
      setIsModalOpen(false);
      setFormData({
        wo_no: '',
        site_id: '',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      setDetails([{ description: '', quantity: 1, rate: 0, amount: 0 }]);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to create invoice: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/billing/${statusData.invoice_id}/status`, {
        status: statusData.status,
        credited_date: statusData.credited_date
      });
      setIsStatusModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to update invoice status: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = async (invoice_id) => {
    try {
      const response = await api.get(`/billing/${invoice_id}/print`);
      const printWindow = window.open('', '_blank');
      printWindow.document.write(response.data);
      printWindow.document.close();
    } catch (err) {
      console.error(err);
      alert('Failed to generate invoice');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Invoices & Billing</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus size={20} />
          <span>Create Invoice</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center space-x-2 border border-red-100">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 font-semibold text-gray-600 text-sm">Invoice ID</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Work Order</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Date</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Amount (₹)</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
              <th className="p-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="p-8 text-center text-gray-500">Loading invoices...</td></tr>
            ) : invoices.length === 0 ? (
              <tr><td colSpan="6" className="p-8 text-center text-gray-500">No invoices found.</td></tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.invoice_id} className="border-b border-gray-50">
                  <td className="p-4 font-medium text-gray-900 flex items-center space-x-2">
                    <FileText className="text-sky-500" size={18} />
                    <span>INV-{inv.invoice_id}</span>
                  </td>
                  <td className="p-4 text-gray-600">{inv.wo_no}</td>
                  <td className="p-4 text-gray-600">{new Date(inv.issue_date).toLocaleDateString()}</td>
                  <td className="p-4 font-medium text-gray-900">{parseFloat(inv.amount).toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      inv.status === 'Paid' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                        : 'bg-rose-50 text-rose-700 border-rose-100'
                    }`}>
                      {inv.status || 'Pending'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button 
                      onClick={() => {
                        setStatusData({
                          invoice_id: inv.invoice_id,
                          status: inv.status || 'Paid',
                          credited_date: inv.credited_date ? new Date(inv.credited_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
                        });
                        setIsStatusModalOpen(true);
                      }}
                      className="text-gray-400 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50"
                      title="Update Status"
                    >
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handlePrint(inv.invoice_id)} className="text-gray-400 hover:text-sky-600 transition-colors p-2 rounded-lg hover:bg-sky-50" title="Download Invoice">
                      <Download size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Invoice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <h2 className="text-lg font-bold text-gray-900">Create New Invoice</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Header Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Work Order</label>
                  <select required name="wo_no" value={formData.wo_no} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 outline-none bg-white">
                    <option value="">Select Work Order</option>
                    {workOrders.map(wo => (
                      <option key={wo.wo_no} value={wo.wo_no}>{wo.wo_no} - {wo.description}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Site</label>
                  <select required name="site_id" value={formData.site_id} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 outline-none bg-white">
                    <option value="">Select Site</option>
                    {sites.map(s => (
                      <option key={s.site_id} value={s.site_id}>{s.site_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                  <input required type="date" name="issue_date" value={formData.issue_date} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input required type="date" name="due_date" value={formData.due_date} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 outline-none" />
                </div>
              </div>

              {/* Line Items */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-3 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-700">Invoice Items</h3>
                  <button type="button" onClick={addDetailRow} className="text-sm text-sky-600 hover:text-sky-800 font-medium flex items-center">
                    <Plus size={16} className="mr-1" /> Add Item
                  </button>
                </div>
                <div className="p-3 space-y-3 bg-white">
                  {details.map((detail, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-1">
                        <input 
                          type="text" 
                          placeholder="Description" 
                          required
                          value={detail.description} 
                          onChange={(e) => handleDetailChange(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 outline-none text-sm"
                        />
                      </div>
                      <div className="w-24">
                        <input 
                          type="number" 
                          placeholder="Qty" 
                          required min="1"
                          value={detail.quantity} 
                          onChange={(e) => handleDetailChange(index, 'quantity', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 outline-none text-sm"
                        />
                      </div>
                      <div className="w-32">
                        <input 
                          type="number" 
                          placeholder="Rate" 
                          required min="0" step="0.01"
                          value={detail.rate} 
                          onChange={(e) => handleDetailChange(index, 'rate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 outline-none text-sm"
                        />
                      </div>
                      <div className="w-32 pt-2 text-right font-medium text-gray-700">
                        ₹ {parseFloat(detail.amount || 0).toLocaleString()}
                      </div>
                      {details.length > 1 && (
                        <button type="button" onClick={() => removeDetailRow(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end">
                  <div className="text-lg font-bold text-gray-900">
                    Total: ₹ {calculateTotal().toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                  {submitting ? 'Creating...' : 'Create Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">Update Invoice Status</h2>
              <button onClick={() => setIsStatusModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateStatus} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  required 
                  value={statusData.status} 
                  onChange={(e) => setStatusData({...statusData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 outline-none bg-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Credited Date</label>
                <input 
                  type="date" 
                  required 
                  value={statusData.credited_date} 
                  onChange={(e) => setStatusData({...statusData, credited_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 outline-none" 
                />
              </div>
              
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsStatusModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                  {submitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
