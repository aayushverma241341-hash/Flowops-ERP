import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, AlertCircle, X } from 'lucide-react';
import api from '../api/axios';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    post: '',
    category: 'Skilled',
    mobile_no: '',
    aadhar_no: '',
    date_of_birth: '',
    father_name: '',
    bank_account_no: '',
    ifsc_no: '',
    uan_no: '',
    esic_no: ''
  });
  const [bankPhoto, setBankPhoto] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch employees. Ensure the backend server is running and you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.date_of_birth) {
      const dob = new Date(formData.date_of_birth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      if (age < 18) {
        alert("Employee must be at least 18 years old.");
        return;
      }
    }

    setSubmitting(true);
    
    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key] || '');
    });
    if (bankPhoto) {
      submitData.append('bank_photo', bankPhoto);
    }

    try {
      if (editingId) {
        await api.put(`/employees/${editingId}`, submitData, { headers: { 'Content-Type': 'multipart/form-data' }});
      } else {
        await api.post('/employees', submitData, { headers: { 'Content-Type': 'multipart/form-data' }});
      }
      closeModal();
      fetchEmployees(); // Refresh list
    } catch (err) {
      console.error(err);
      alert(`Failed to ${editingId ? 'update' : 'add'} employee: ` + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (emp) => {
    setEditingId(emp.employee_id);
    setFormData({
      name: emp.name || '',
      post: emp.post || '',
      category: emp.category || 'Skilled',
      mobile_no: emp.mobile_no || '',
      aadhar_no: emp.aadhar_no || '',
      date_of_birth: emp.date_of_birth ? emp.date_of_birth.split('T')[0] : '',
      father_name: emp.father_name || '',
      bank_account_no: emp.bank_account_no || '',
      ifsc_no: emp.ifsc_no || '',
      uan_no: emp.uan_no || '',
      esic_no: emp.esic_no || ''
    });
    setBankPhoto(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      await api.delete(`/employees/${id}`);
      fetchEmployees();
    } catch (err) {
      console.error(err);
      alert('Failed to delete employee: ' + (err.response?.data?.message || err.message));
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', post: '', category: 'Skilled', mobile_no: '', aadhar_no: '', date_of_birth: '', father_name: '', bank_account_no: '', ifsc_no: '', uan_no: '', esic_no: '' });
    setBankPhoto(null);
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Employees Directory</h1>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ name: '', post: '', category: 'Skilled', mobile_no: '', aadhar_no: '', date_of_birth: '', father_name: '', bank_account_no: '', ifsc_no: '', uan_no: '', esic_no: '' });
            setBankPhoto(null);
            setIsModalOpen(true);
          }}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus size={20} />
          <span>Add Employee</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center space-x-2 border border-red-100">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center bg-gray-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search employees by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 font-semibold text-gray-600 text-sm">Name</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Post</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Category</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Mobile</th>
                <th className="p-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">Loading employees...</td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">No employees found.</td>
                </tr>
              ) : (
                employees
                  .filter(emp => emp.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((emp) => (
                  <tr key={emp.employee_id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">{emp.name}</td>
                    <td className="p-4 text-gray-600">{emp.post}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        {emp.category}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">{emp.mobile_no}</td>
                    <td className="p-4 text-right space-x-3">
                      <button onClick={() => handleEdit(emp)} className="text-gray-400 hover:text-primary-600 transition-colors">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(emp.employee_id)} className="text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
              <h2 className="text-lg font-bold text-gray-900">{editingId ? 'Edit Employee' : 'Add New Employee'}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Father/Husband Name</label>
                    <input type="text" name="father_name" value={formData.father_name} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth (Must be 18+)</label>
                    <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number (10 digits)</label>
                    <input type="text" name="mobile_no" value={formData.mobile_no} onChange={handleInputChange} pattern="\d{10}" maxLength="10" title="Must be exactly 10 digits" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Aadhar Number (12 digits)</label>
                    <input type="text" name="aadhar_no" value={formData.aadhar_no} onChange={handleInputChange} pattern="\d{12}" maxLength="12" title="Must be exactly 12 digits" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Post / Job Role</label>
                    <input required type="text" name="post" value={formData.post} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select name="category" value={formData.category} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 outline-none bg-white">
                      <option value="Skilled">Skilled</option>
                      <option value="Semi-Skilled">Semi-Skilled</option>
                      <option value="Highly-Skilled">Highly-Skilled</option>
                      <option value="Unskilled">Unskilled</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <h3 className="text-md font-bold text-gray-900 mb-4">Bank & Compliance Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account Number</label>
                      <input type="text" name="bank_account_no" value={formData.bank_account_no} onChange={handleInputChange} pattern="\d+" title="Must contain only numbers" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Number (11 chars)</label>
                      <input type="text" name="ifsc_no" value={formData.ifsc_no} onChange={handleInputChange} pattern="^[A-Za-z0-9]{11}$" maxLength="11" title="Must be exactly 11 alphanumeric characters" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 outline-none uppercase" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">UAN Number (12 digits, optional)</label>
                      <input type="text" name="uan_no" value={formData.uan_no} onChange={handleInputChange} pattern="\d{12}" maxLength="12" title="Must be exactly 12 digits" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ESIC Number (10 digits, optional)</label>
                      <input type="text" name="esic_no" value={formData.esic_no} onChange={handleInputChange} pattern="\d{10}" maxLength="10" title="Must be exactly 10 digits" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 outline-none" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Upload Bank Details Photo (.jpg only)</label>
                      <input type="file" accept=".jpg,.jpeg" onChange={(e) => setBankPhoto(e.target.files[0])} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 outline-none" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100">
                  <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                    {submitting ? 'Saving...' : (editingId ? 'Update Employee' : 'Save Employee')}
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

export default Employees;
