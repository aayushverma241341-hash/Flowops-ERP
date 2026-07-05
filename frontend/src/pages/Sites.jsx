import React, { useState, useEffect } from 'react';
import { Plus, MapPin, Users, AlertCircle, X, ChevronRight, UserPlus } from 'lucide-react';
import api from '../api/axios';

const Sites = () => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    site_name: '',
    wo_no: '',
    location: '',
    max_employees: '',
    employee_category: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Site detail view
  const [selectedSiteId, setSelectedSiteId] = useState(null);
  const [siteDetails, setSiteDetails] = useState(null);
  const [allEmployees, setAllEmployees] = useState([]);
  const [selectedEmployeeToAssign, setSelectedEmployeeToAssign] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [workOrders, setWorkOrders] = useState([]);

  const fetchSites = async () => {
    try {
      const response = await api.get('/sites');
      setSites(response.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch sites.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setAllEmployees(response.data);
    } catch (err) {
      console.error("Failed to fetch employees", err);
    }
  };

  const fetchWorkOrders = async () => {
    try {
      const response = await api.get('/work-orders');
      setWorkOrders(response.data);
    } catch (err) {
      console.error("Failed to fetch work orders", err);
    }
  };

  useEffect(() => {
    fetchSites();
    fetchAllEmployees();
    fetchWorkOrders();
  }, []);

  const openSiteDetails = async (id) => {
    setSelectedSiteId(id);
    try {
      const res = await api.get(`/sites/${id}/full-details`);
      setSiteDetails(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load site details');
    }
  };

  const handleAssignEmployee = async (e) => {
    e.preventDefault();
    if (!selectedEmployeeToAssign) return;
    
    setAssigning(true);
    try {
      await api.post('/sites/assign', {
        site_id: selectedSiteId,
        employee_id: selectedEmployeeToAssign
      });
      // Refresh site details to show newly assigned employee
      await openSiteDetails(selectedSiteId);
      setSelectedEmployeeToAssign('');
    } catch (err) {
      console.error(err);
      alert('Failed to assign employee: ' + (err.response?.data?.message || err.message));
    } finally {
      setAssigning(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/sites', formData);
      setIsModalOpen(false);
      setFormData({ site_name: '', wo_no: '', location: '', max_employees: '', employee_category: '' });
      fetchSites(); // Refresh list
    } catch (err) {
      console.error(err);
      alert('Failed to add site: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  // Main render logic depends on whether a site is selected
  if (selectedSiteId && siteDetails) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => { setSelectedSiteId(null); setSiteDetails(null); }}
            className="text-gray-500 hover:text-purple-600 transition-colors"
          >
            &larr; Back to Sites
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{siteDetails.site_name}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Site Overview</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Location</p>
                  <p className="font-medium text-gray-900">{siteDetails.location}</p>
                </div>
                <div>
                  <p className="text-gray-500">Work Order</p>
                  <p className="font-medium text-gray-900">{siteDetails.wo_no || 'None'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Required Category</p>
                  <p className="font-medium text-gray-900">{siteDetails.employee_category || 'General'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Max Capacity</p>
                  <p className="font-medium text-gray-900">{siteDetails.max_employees}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-900 flex items-center">
                  <Users className="mr-2 text-purple-600" size={20} />
                  Assigned Employees ({siteDetails.assigned_employees?.length || 0})
                </h3>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto">
                {siteDetails.assigned_employees && siteDetails.assigned_employees.length > 0 ? (
                  <div className="space-y-3">
                    {siteDetails.assigned_employees.map(emp => (
                      <div key={emp.employee_id} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg bg-white hover:bg-gray-50">
                        <div>
                          <p className="font-medium text-gray-900">{emp.name}</p>
                          <p className="text-xs text-gray-500">{emp.post} • {emp.category}</p>
                        </div>
                        <span className="text-sm font-mono text-gray-500">{emp.mobile_no}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-6 border border-dashed rounded-lg">No employees assigned to this site yet.</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center text-lg">
                <UserPlus className="mr-2 text-purple-600" size={20} />
                Assign Employee
              </h3>
              <form onSubmit={handleAssignEmployee} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Employee</label>
                  <select 
                    value={selectedEmployeeToAssign}
                    onChange={(e) => setSelectedEmployeeToAssign(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 outline-none bg-white"
                  >
                    <option value="">-- Select Employee --</option>
                    {allEmployees
                      .filter(e => !siteDetails.assigned_employees?.find(ae => ae.employee_id === e.employee_id))
                      .map(emp => (
                      <option key={emp.employee_id} value={emp.employee_id}>
                        {emp.name} ({emp.category})
                      </option>
                    ))}
                  </select>
                </div>
                <button 
                  type="submit" 
                  disabled={assigning || !selectedEmployeeToAssign}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {assigning ? 'Assigning...' : 'Assign to Site'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Active Sites</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus size={20} />
          <span>Add Site</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center space-x-2 border border-red-100">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading sites...</div>
      ) : sites.length === 0 ? (
        <div className="text-center py-10 text-gray-500 bg-white rounded-xl border border-gray-100">No sites found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map((site) => (
            <div 
              key={site.site_id} 
              onClick={() => openSiteDetails(site.site_id)}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="text-purple-600" size={24} />
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-700 transition-colors">{site.site_name}</h3>
                </div>
                <ChevronRight className="text-gray-300 group-hover:text-purple-500 transition-colors" size={20} />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Work Order</span>
                  <span className="font-medium text-gray-900">{site.wo_no || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Location</span>
                  <span className="font-medium text-gray-900">{site.location}</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-500">Capacity & Category</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-md">{site.employee_category || 'General'}</span>
                    <div className="flex items-center space-x-1 text-purple-700 font-medium bg-purple-50 px-2 py-1 rounded-md">
                      <Users size={14} />
                      <span>Max {site.max_employees}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Site Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">Add New Site</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
                <input required type="text" name="site_name" value={formData.site_name} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Work Order Number (optional)</label>
                <select name="wo_no" value={formData.wo_no} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 outline-none bg-white">
                  <option value="">-- Select Work Order --</option>
                  {workOrders.map((wo) => (
                    <option key={wo.wo_no} value={wo.wo_no}>{wo.wo_no} - {wo.description}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input required type="text" name="location" value={formData.location} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Employees Capacity</label>
                <input required type="number" name="max_employees" value={formData.max_employees} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee Category</label>
                <select name="employee_category" value={formData.employee_category} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 outline-none bg-white">
                  <option value="">Select Category</option>
                  <option value="Skilled">Skilled Worker</option>
                  <option value="Semi-Skilled">Semi-Skilled Worker</option>
                  <option value="Unskilled">Unskilled Worker</option>
                  <option value="Supervisor">Supervisor</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                  {submitting ? 'Saving...' : 'Save Site'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sites;
