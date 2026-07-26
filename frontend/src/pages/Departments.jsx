import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, AlertCircle, X, Users } from 'lucide-react';
import api from '../api/axios';
import DataTable from '../components/DataTable';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    head_of_department: '',
    budget: '',
    description: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      setDepartments(response.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch departments. Ensure the backend server is running and you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (editingId) {
        await api.put(`/departments/${editingId}`, formData);
      } else {
        await api.post('/departments', formData);
      }
      closeModal();
      fetchDepartments(); // Refresh list
    } catch (err) {
      console.error(err);
      alert(`Failed to ${editingId ? 'update' : 'add'} department: ` + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (dept) => {
    setEditingId(dept.id);
    setFormData({
      name: dept.name || '',
      head_of_department: dept.head_of_department || '',
      budget: dept.budget || '',
      description: dept.description || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this department? Employees linked to it will not be deleted.")) return;
    try {
      await api.delete(`/departments/${id}`);
      fetchDepartments();
    } catch (err) {
      console.error(err);
      alert('Failed to delete department: ' + (err.response?.data?.message || err.message));
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', head_of_department: '', budget: '', description: '' });
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Department Management</h1>
          <p className="text-sm text-gray-500 mt-1">Organize your workforce and track budgets.</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ name: '', head_of_department: '', budget: '', description: '' });
            setIsModalOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-sm shadow-indigo-200"
        >
          <Plus size={20} />
          <span>Add Department</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center space-x-2 border border-red-100">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-500">Loading departments...</div>
      ) : (
        <DataTable
          columns={[
            { header: 'Department Name', accessor: 'name' },
            { header: 'HOD (Head)', accessor: 'head_of_department' },
            { 
              header: 'Budget (₹)', 
              cell: (row) => row.budget ? `₹${parseFloat(row.budget).toLocaleString('en-IN')}` : '-'
            },
            {
              header: 'Headcount',
              cell: (row) => (
                <div className="flex items-center space-x-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold w-fit border border-blue-100">
                  <Users size={14} />
                  <span>{row.employee_count || 0}</span>
                </div>
              )
            },
            { 
              header: 'Actions', 
              cell: (row) => (
                <div className="flex space-x-3">
                  <button onClick={() => handleEdit(row)} className="text-slate-400 hover:text-indigo-600 transition-colors" title="Edit">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(row.id)} className="text-slate-400 hover:text-rose-600 transition-colors" title="Delete">
                    <Trash2 size={18} />
                  </button>
                </div>
              ) 
            }
          ]}
          data={departments}
          searchPlaceholder="Search departments..."
          emptyStateTitle="No Departments Yet"
          emptyStateDesc="Start organizing your company by creating your first department."
          emptyActionLabel="Add Department"
          onEmptyAction={() => setIsModalOpen(true)}
        />
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
              <h2 className="text-lg font-bold text-gray-900">{editingId ? 'Edit Department' : 'Create Department'}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department Name <span className="text-red-500">*</span></label>
                  <input required type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Finance, HR, Engineering" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Head of Department (HOD)</label>
                  <input type="text" name="head_of_department" value={formData.head_of_department} onChange={handleInputChange} placeholder="Manager's Name" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Annual Budget (₹)</label>
                  <input type="number" step="0.01" name="budget" value={formData.budget} onChange={handleInputChange} placeholder="0.00" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" placeholder="Brief description of department functions..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"></textarea>
                </div>

                <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100">
                  <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm shadow-indigo-200 disabled:opacity-50">
                    {submitting ? 'Saving...' : (editingId ? 'Update Department' : 'Save Department')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;
