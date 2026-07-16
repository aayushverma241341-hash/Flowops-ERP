import React, { useState, useEffect } from 'react';
import { IndianRupee, Printer, AlertCircle, Plus, X, Edit, Download } from 'lucide-react';
import api from '../api/axios';
import { generateSalarySlipPDF } from '../utils/pdfGenerator';

const Salary = () => {
  const [salaries, setSalaries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [month, setMonth] = useState('');
  const [availableMonths, setAvailableMonths] = useState([]);

  useEffect(() => {
    const months = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    for (let y = currentYear; y <= currentYear + 2; y++) {
      for (let m = 0; m < 12; m++) {
        months.push(`${monthNames[m]} ${y}`);
      }
    }
    setAvailableMonths(months);
    
    const currentMonthString = `${monthNames[currentDate.getMonth()]} ${currentYear}`;
    setMonth(currentMonthString);
    setFormData(prev => ({...prev, month: currentMonthString}));
  }, []);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    month: '',
    basic_salary: '',
    allowances: '0',
    deductions: '0'
  });

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusData, setStatusData] = useState({
    salary_id: null,
    payment_status: 'Paid',
    payment_date: new Date().toISOString().split('T')[0]
  });

  const fetchSalaries = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/salary?month=${month}`);
      setSalaries(response.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch salaries.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const empRes = await api.get('/employees');
      setEmployees(empRes.data);
    } catch (err) {
      console.error('Failed to fetch employees', err);
    }
  };

  useEffect(() => {
    if (month) {
      fetchSalaries();
    }
  }, [month]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/salary/process', formData);
      setIsModalOpen(false);
      setFormData({
        employee_id: '',
        month: month,
        basic_salary: '',
        allowances: '0',
        deductions: '0'
      });
      fetchSalaries();
    } catch (err) {
      console.error(err);
      alert('Failed to process salary: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/salary/${statusData.salary_id}/status`, {
        payment_status: statusData.payment_status,
        payment_date: statusData.payment_date
      });
      setIsStatusModalOpen(false);
      fetchSalaries();
    } catch (err) {
      console.error(err);
      alert('Failed to update status: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = async (salary_id) => {
    try {
      const response = await api.get(`/salary/${salary_id}`);
      const { salary, employee } = response.data;
      generateSalarySlipPDF(salary, employee);
    } catch (err) {
      console.error(err);
      alert('Failed to generate payslip PDF');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">Salary Processing</h1>
        <div className="flex space-x-3">
          <select 
            value={month}
            onChange={(e) => {
              setMonth(e.target.value);
              setFormData({...formData, month: e.target.value});
            }}
            className="border border-gray-200 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
          >
            {availableMonths.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Process Salaries</span>
          </button>
        </div>
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
              <th className="p-4 font-semibold text-gray-600 text-sm">Employee</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Sites Worked</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Basic (₹)</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Net Salary (₹)</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
              <th className="p-4 font-semibold text-gray-600 text-sm text-right">Payslip</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading salaries...</td></tr>
            ) : salaries.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-500">No salaries found for {month}.</td></tr>
            ) : (
              salaries.map((sal) => (
                <tr key={sal.salary_id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="p-4 font-medium text-gray-900">{sal.employee_name}</td>
                  <td className="p-4 text-gray-600 text-sm">{sal.sites_worked || 'None'}</td>
                  <td className="p-4 text-gray-600">{parseFloat(sal.basic_salary).toLocaleString()}</td>
                  <td className="p-4 font-semibold text-gray-900 flex items-center space-x-1">
                    <IndianRupee size={14} className="text-gray-400" />
                    <span>{parseFloat(sal.net_salary).toLocaleString()}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      sal.payment_status === 'Paid' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                        : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {sal.payment_status || 'Pending'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button 
                      onClick={() => {
                        setStatusData({
                          salary_id: sal.salary_id,
                          payment_status: sal.payment_status || 'Paid',
                          payment_date: sal.payment_date ? new Date(sal.payment_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
                        });
                        setIsStatusModalOpen(true);
                      }}
                      className="text-gray-400 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50"
                      title="Update Status"
                    >
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handlePrint(sal.salary_id)} className="text-gray-400 hover:text-amber-600 transition-colors p-2 rounded-lg hover:bg-amber-50" title="Download Payslip PDF">
                      <Download size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Process Salary Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">Process Salary</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <select required name="employee_id" value={formData.employee_id} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 outline-none bg-white">
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.employee_id} value={emp.employee_id}>{emp.name} ({emp.category})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <input required type="text" name="month" value={formData.month} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Basic Salary (₹)</label>
                <input required type="number" name="basic_salary" value={formData.basic_salary} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Allowances (₹)</label>
                  <input required type="number" name="allowances" value={formData.allowances} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deductions (₹)</label>
                  <input required type="number" name="deductions" value={formData.deductions} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 outline-none" />
                </div>
              </div>
              <div className="pt-2">
                <p className="text-sm text-gray-600 flex justify-between font-medium">
                  <span>Net Salary:</span>
                  <span className="text-gray-900 text-lg">
                    ₹ {((parseFloat(formData.basic_salary) || 0) + (parseFloat(formData.allowances) || 0) - (parseFloat(formData.deductions) || 0)).toLocaleString()}
                  </span>
                </p>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                  {submitting ? 'Processing...' : 'Submit'}
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
              <h2 className="text-lg font-bold text-gray-900">Update Status</h2>
              <button onClick={() => setIsStatusModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateStatus} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  required 
                  value={statusData.payment_status} 
                  onChange={(e) => setStatusData({...statusData, payment_status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                <input 
                  type="date" 
                  required 
                  value={statusData.payment_date} 
                  onChange={(e) => setStatusData({...statusData, payment_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none" 
                />
              </div>
              
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsStatusModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
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

export default Salary;
