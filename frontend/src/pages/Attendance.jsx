import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Save, AlertCircle, Loader } from 'lucide-react';
import api from '../api/axios';

const Attendance = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [employees, setEmployees] = useState([]);
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Store attendance data. Structure: { employee_id: { dateString: 'Present' } }
  const [attendanceGrid, setAttendanceGrid] = useState({});

  const daysInMonth = useMemo(() => {
    const [year, month] = date.split('-');
    const days = new Date(year, month, 0).getDate();
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(year, month - 1, i + 2).toISOString().split('T')[0]; // +2 because JS months are 0-indexed and Date(0) goes to last day of previous month... Wait.
      // A better way to get YYYY-MM-DD for each day:
      const dayString = String(i + 1).padStart(2, '0');
      return `${year}-${month}-${dayString}`;
    });
  }, [date]);

  useEffect(() => {
    const loadSites = async () => {
      try {
        const siteRes = await api.get('/sites');
        setSites(siteRes.data);
        if (siteRes.data.length > 0) {
          setSelectedSite(siteRes.data[0].site_id);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load sites.');
      }
    };
    loadSites();
  }, []);

  const fetchData = async () => {
    if (!selectedSite) return;
    try {
      setLoading(true);
      const [year, month] = date.split('-');
      
      const [siteDetailsRes, attRes] = await Promise.all([
        api.get(`/sites/${selectedSite}/full-details`),
        api.get(`/attendance?month=${month}&year=${year}`)
      ]);

      const siteEmployees = siteDetailsRes.data.assigned_employees || [];
      setEmployees(siteEmployees);

      // Initialize grid with 'Present' for everyone in this site
      const initialGrid = {};
      siteEmployees.forEach(emp => {
        initialGrid[emp.employee_id] = {};
        daysInMonth.forEach(day => {
          initialGrid[emp.employee_id][day] = 'Present';
        });
      });

      attRes.data.forEach(rec => {
        // Only overlay if the attendance record belongs to the currently selected site
        if (rec.site_id === parseInt(selectedSite)) {
          const recDate = new Date(rec.date).toISOString().split('T')[0];
          if (initialGrid[rec.employee_id]) {
            initialGrid[rec.employee_id][recDate] = rec.status;
          }
        }
      });

      setAttendanceGrid(initialGrid);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch attendance data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, selectedSite, daysInMonth]);

  const handleCellClick = (employeeId, day) => {
    setAttendanceGrid(prev => {
      const currentStatus = prev[employeeId][day];
      let nextStatus = 'Present';
      if (currentStatus === 'Present') nextStatus = 'Absent';
      else if (currentStatus === 'Absent') nextStatus = 'Leave';
      else if (currentStatus === 'Leave') nextStatus = 'Half-day';

      return {
        ...prev,
        [employeeId]: {
          ...prev[employeeId],
          [day]: nextStatus
        }
      };
    });
  };

  const handleSave = async () => {
    if (!selectedSite) {
      alert("Please select a site first.");
      return;
    }

    setSaving(true);
    const records = [];
    employees.forEach(emp => {
      daysInMonth.forEach(day => {
        records.push({
          employee_id: emp.employee_id,
          date: day,
          status: attendanceGrid[emp.employee_id][day]
        });
      });
    });

    try {
      await api.post('/attendance/bulk', { site_id: selectedSite, records });
      alert("Monthly attendance saved successfully!");
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to save bulk attendance.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200';
      case 'Absent': return 'bg-rose-100 text-rose-700 hover:bg-rose-200';
      case 'Leave': return 'bg-amber-100 text-amber-700 hover:bg-amber-200';
      case 'Half-day': return 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusInitial = (status) => {
    switch (status) {
      case 'Present': return 'P';
      case 'Absent': return 'A';
      case 'Leave': return 'L';
      case 'Half-day': return 'H';
      default: return '-';
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-120px)]">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4 shrink-0">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
          <Calendar className="text-indigo-600" />
          <span>Monthly Attendance Grid</span>
        </h1>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600">Month:</span>
            <input 
              type="month" 
              value={date.substring(0, 7)}
              onChange={(e) => setDate(`${e.target.value}-01`)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600">Site:</span>
            <select 
              value={selectedSite} 
              onChange={(e) => setSelectedSite(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">-- Select Site --</option>
              {sites.map(s => (
                <option key={s.site_id} value={s.site_id}>{s.site_name}</option>
              ))}
            </select>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving || employees.length === 0}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            {saving ? <Loader size={20} className="animate-spin" /> : <Save size={20} />}
            <span>Save Attendance</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center space-x-2 border border-red-100 shrink-0">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Grid Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader className="animate-spin text-indigo-600" size={32} />
          </div>
        ) : employees.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            No employees found in the system.
          </div>
        ) : (
          <div className="overflow-auto flex-1 p-2">
            <table className="w-full text-center border-collapse text-sm">
              <thead className="sticky top-0 bg-white z-10 shadow-sm">
                <tr>
                  <th className="p-3 font-semibold text-gray-600 text-left border border-gray-100 min-w-[150px] sticky left-0 bg-white z-20">
                    Employee Name
                  </th>
                  {daysInMonth.map((day, idx) => (
                    <th key={day} className="p-2 font-semibold text-gray-600 border border-gray-100 min-w-[40px]">
                      {idx + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.employee_id} className="hover:bg-gray-50/50">
                    <td className="p-3 font-medium text-gray-900 text-left border border-gray-100 sticky left-0 bg-white z-10 group-hover:bg-gray-50 truncate max-w-[200px]">
                      {emp.name}
                    </td>
                    {daysInMonth.map(day => {
                      const status = attendanceGrid[emp.employee_id]?.[day] || 'Present';
                      return (
                        <td key={day} className="p-1 border border-gray-100">
                          <button
                            onClick={() => handleCellClick(emp.employee_id, day)}
                            className={`w-8 h-8 rounded-md font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${getStatusColor(status)}`}
                            title={`${day} - ${status}`}
                          >
                            {getStatusInitial(status)}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div className="flex items-center space-x-6 text-sm text-gray-600 bg-white p-4 rounded-xl shadow-sm border border-gray-100 shrink-0">
        <span className="font-semibold">Legend:</span>
        <div className="flex items-center space-x-2"><span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">P</span><span>Present</span></div>
        <div className="flex items-center space-x-2"><span className="w-6 h-6 rounded-md bg-rose-100 text-rose-700 flex items-center justify-center font-bold">A</span><span>Absent</span></div>
        <div className="flex items-center space-x-2"><span className="w-6 h-6 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center font-bold">L</span><span>Leave</span></div>
        <div className="flex items-center space-x-2"><span className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">H</span><span>Half-day</span></div>
      </div>
    </div>
  );
};

export default Attendance;
