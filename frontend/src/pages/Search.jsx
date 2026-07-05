import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, User, Calendar, IndianRupee, MapPin, Briefcase, FileText, ArrowRight } from 'lucide-react';
import api from '../api/axios';

const Search = () => {
  const [searchType, setSearchType] = useState('Employee'); // Employee, Work Order, Site
  
  const [employees, setEmployees] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [sites, setSites] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState('');
  
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [empRes, woRes, siteRes] = await Promise.all([
        api.get('/employees'),
        api.get('/work-orders'),
        api.get('/sites')
      ]);
      setEmployees(empRes.data);
      setWorkOrders(woRes.data);
      setSites(siteRes.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  };

  const fetchFullDetails = async (id, type) => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      let endpoint = '';
      if (type === 'Employee') endpoint = `/employees/${id}/full-details`;
      else if (type === 'Work Order') endpoint = `/work-orders/${id}/full-details`;
      else if (type === 'Site') endpoint = `/sites/${id}/full-details`;

      const res = await api.get(endpoint);
      setDetails(res.data);
    } catch (err) {
      console.error(err);
      setError(`Failed to fetch ${type.toLowerCase()} details.`);
      setDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    let targetId = selectedId;
    
    if (!targetId && searchTerm) {
      let matched = null;
      if (searchType === 'Employee') {
        matched = employees.find(emp => emp.name.toLowerCase().includes(searchTerm.toLowerCase()));
        if (matched) targetId = matched.employee_id;
      } else if (searchType === 'Work Order') {
        matched = workOrders.find(wo => wo.wo_no.toLowerCase().includes(searchTerm.toLowerCase()) || (wo.description && wo.description.toLowerCase().includes(searchTerm.toLowerCase())));
        if (matched) targetId = matched.wo_no;
      } else if (searchType === 'Site') {
        matched = sites.find(s => s.site_name.toLowerCase().includes(searchTerm.toLowerCase()));
        if (matched) targetId = s.site_id;
      }
      
      if (matched) {
        setSelectedId(targetId);
      } else {
        setError(`No ${searchType.toLowerCase()} found matching that query.`);
        setDetails(null);
        return;
      }
    }
    
    if (targetId) {
      fetchFullDetails(targetId, searchType);
    }
  };

  const handleTabChange = (type) => {
    setSearchType(type);
    setSearchTerm('');
    setSelectedId('');
    setDetails(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Global Search</h1>
        
        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6 max-w-fit">
          {['Employee', 'Work Order', 'Site'].map(tab => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                searchType === tab 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={`Search ${searchType}...`}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <select
              value={selectedId}
              onChange={(e) => {
                setSelectedId(e.target.value);
                setSearchTerm('');
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 outline-none bg-white"
            >
              <option value="">Or select from list...</option>
              {searchType === 'Employee' && employees.map(emp => (
                <option key={emp.employee_id} value={emp.employee_id}>{emp.name} ({emp.category})</option>
              ))}
              {searchType === 'Work Order' && workOrders.map(wo => (
                <option key={wo.wo_no} value={wo.wo_no}>{wo.wo_no} - {wo.description}</option>
              ))}
              {searchType === 'Site' && sites.map(s => (
                <option key={s.site_id} value={s.site_id}>{s.site_name}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-12 text-gray-500">
          Loading details...
        </div>
      )}

      {/* RESULT RENDERERS */}
      {!loading && details && (
        <div className="space-y-6">
          
          {/* 1. EMPLOYEE DETAILS */}
          {searchType === 'Employee' && (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-100">
                  <div className="h-16 w-16 bg-sky-100 rounded-full flex items-center justify-center text-sky-600">
                    <User size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{details.name}</h2>
                    <p className="text-gray-500">{details.post} • {details.category}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Father's Name</p>
                    <p className="font-medium text-gray-900">{details.father_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Mobile No</p>
                    <p className="font-medium text-gray-900">{details.mobile_no || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Aadhar No</p>
                    <p className="font-medium text-gray-900">{details.aadhar_no || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Bank Account</p>
                    <p className="font-medium text-gray-900">{details.bank_account_no || 'N/A'} (IFSC: {details.ifsc_no || 'N/A'})</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">UAN No</p>
                    <p className="font-medium text-gray-900">{details.uan_no || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">ESIC No</p>
                    <p className="font-medium text-gray-900">{details.esic_no || 'N/A'}</p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                    <MapPin className="mr-2 text-sky-600" size={16} />
                    Currently Assigned Sites
                  </h3>
                  {details.assigned_sites && details.assigned_sites.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {details.assigned_sites.map(site => (
                        <span key={site.site_id} className="px-3 py-1 bg-sky-50 text-sky-700 rounded-full text-sm font-medium border border-sky-100">
                          {site.site_name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Not assigned to any site.</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Salary History */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center space-x-2">
                    <IndianRupee className="text-sky-600" size={20} />
                    <h3 className="font-bold text-gray-900">Salary History</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto p-4">
                    {details.salaries && details.salaries.length > 0 ? (
                      <div className="space-y-3">
                        {details.salaries.map(sal => (
                          <div key={sal.salary_id} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-semibold text-gray-900">{sal.month}</span>
                              <span className={`px-2 py-1 text-xs rounded-full font-medium ${sal.payment_status === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                {sal.payment_status || 'Pending'}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>Net Salary: ₹{parseFloat(sal.net_salary).toLocaleString()}</span>
                              {sal.payment_status === 'Paid' && sal.payment_date && (
                                <span>Paid on: {new Date(sal.payment_date).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No salary records found.</p>
                    )}
                  </div>
                </div>

                {/* Attendance History */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center space-x-2">
                    <Calendar className="text-sky-600" size={20} />
                    <h3 className="font-bold text-gray-900">Recent Attendance</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto p-4">
                    {details.attendance && details.attendance.length > 0 ? (
                      <div className="space-y-3">
                        {details.attendance.map(att => (
                          <div key={att.attendance_id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                            <div className="flex items-center space-x-3">
                              <div className={`h-2 w-2 rounded-full ${att.status === 'Present' ? 'bg-emerald-500' : att.status === 'Absent' ? 'bg-rose-500' : 'bg-amber-500'}`}></div>
                              <div>
                                <p className="font-medium text-gray-900">{new Date(att.date).toLocaleDateString()}</p>
                                <p className="text-xs text-gray-500 flex items-center mt-1">
                                  <MapPin size={12} className="mr-1" />
                                  {att.site_name || 'N/A'}
                                </p>
                              </div>
                            </div>
                            <span className={`text-sm font-medium ${att.status === 'Present' ? 'text-emerald-700' : att.status === 'Absent' ? 'text-rose-700' : 'text-amber-700'}`}>
                              {att.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No attendance records found.</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 2. WORK ORDER DETAILS */}
          {searchType === 'Work Order' && (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-100">
                  <div className="h-16 w-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                    <Briefcase size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">WO: {details.wo_no}</h2>
                    <p className="text-gray-500">{details.description}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Issue Date</p>
                    <p className="font-medium text-gray-900">{details.issue_date ? new Date(details.issue_date).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">End Date</p>
                    <p className="font-medium text-gray-900">{details.end_date ? new Date(details.end_date).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <MapPin className="mr-2 text-amber-600" size={20} />
                    Associated Sites
                  </h3>
                  {details.sites && details.sites.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {details.sites.map(site => (
                        <div key={site.site_id} className="p-4 border border-gray-200 rounded-lg">
                          <h4 className="font-bold text-gray-900 mb-2">{site.site_name}</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p><span className="font-medium">Location:</span> {site.location}</p>
                            <p><span className="font-medium">Start Date:</span> {site.start_date ? new Date(site.start_date).toLocaleDateString() : 'N/A'}</p>
                            <p><span className="font-medium">Category:</span> {site.employee_category || 'N/A'}</p>
                            <p><span className="font-medium">Max Employees:</span> {site.max_employees || 'N/A'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No sites associated with this work order yet.</p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* 3. SITE DETAILS */}
          {searchType === 'Site' && (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-100">
                  <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                    <MapPin size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{details.site_name}</h2>
                    <p className="text-gray-500">{details.location}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Start Date</p>
                    <p className="font-medium text-gray-900">{details.start_date ? new Date(details.start_date).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">End Date</p>
                    <p className="font-medium text-gray-900">{details.end_date ? new Date(details.end_date).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Employee Category</p>
                    <p className="font-medium text-gray-900">{details.employee_category || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Max Employees</p>
                    <p className="font-medium text-gray-900">{details.max_employees || 'N/A'}</p>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Briefcase className="mr-2 text-emerald-600" size={20} />
                  Associated Work Order
                </h3>
                {details.work_order ? (
                  <div className="p-4 border border-emerald-100 bg-emerald-50/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-gray-900 text-lg">WO: {details.work_order.wo_no}</h4>
                      <span className="text-sm text-gray-500">
                        Issued: {details.work_order.issue_date ? new Date(details.work_order.issue_date).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <p className="text-gray-700">{details.work_order.description}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 p-4 border border-gray-100 rounded-lg bg-gray-50">This site is not currently linked to any active work order.</p>
                )}
              </div>
            </>
          )}

        </div>
      )}
    </div>
  );
};

export default Search;
