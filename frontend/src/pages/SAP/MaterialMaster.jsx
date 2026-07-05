import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

export default function MaterialMaster() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/sap/materials', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMaterials(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!materials || !materials.length) return;
    const worksheet = XLSX.utils.json_to_sheet(materials);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Materials");
    XLSX.writeFile(workbook, `materials_export.xlsx`);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center bg-blue-900 text-white p-4 shadow-md rounded-t-sm">
        <div>
          <h1 className="text-xl font-semibold">Display Material (Initial Screen)</h1>
          <p className="text-xs opacity-75">Transaction MM03</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportToExcel} className="bg-blue-800 hover:bg-blue-900 px-4 py-2 text-sm shadow-sm rounded-sm">Export Data</button>
          <button className="bg-blue-700 hover:bg-blue-600 px-4 py-2 text-sm shadow-sm rounded-sm">Create (MM01)</button>
        </div>
      </div>

      <div className="bg-white shadow-sm border p-4 mt-4">
        {loading ? <p>Loading data...</p> : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300 text-sm text-gray-700">
                <th className="p-3 font-semibold">Material Number</th>
                <th className="p-3 font-semibold">Description</th>
                <th className="p-3 font-semibold">Base Unit</th>
                <th className="p-3 font-semibold">Mat. Group</th>
                <th className="p-3 font-semibold text-right">Unrestricted Stock</th>
              </tr>
            </thead>
            <tbody>
              {materials.map(mat => (
                <tr key={mat.material_id} className="border-b border-gray-100 hover:bg-blue-50 text-sm text-gray-800 transition-colors">
                  <td className="p-3 font-medium text-blue-700">{mat.material_number}</td>
                  <td className="p-3">{mat.description}</td>
                  <td className="p-3">{mat.base_unit}</td>
                  <td className="p-3">{mat.material_group}</td>
                  <td className="p-3 text-right font-bold">{mat.total_stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
