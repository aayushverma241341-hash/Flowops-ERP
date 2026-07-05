import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

export default function GoodsReceipt() {
  const [poId, setPoId] = useState('');
  const [migoDoc, setMigoDoc] = useState('');
  const [message, setMessage] = useState('');
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      const token = localStorage.getItem('token');
      // Using fetch here since we used it in other places, or axios.
      const res = await axios.get('http://localhost:5000/api/sap/goods-receipts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReceipts(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handlePostGR = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/sap/goods-receipt', 
        { po_id: parseInt(poId), migo_document: migoDoc },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Material document posted successfully!');
      setPoId('');
      setMigoDoc('');
      fetchReceipts(); // Refresh the table
    } catch (err) {
      console.error(err);
      setMessage('Error posting goods receipt.');
    }
  };

  const exportToExcel = () => {
    if (!receipts || !receipts.length) return;
    const worksheet = XLSX.utils.json_to_sheet(receipts);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Goods Receipts");
    XLSX.writeFile(workbook, `goods_receipts_export.xlsx`);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center bg-blue-900 text-white p-4 shadow-md rounded-t-sm">
        <div>
          <h1 className="text-xl font-semibold">Goods Receipt Purchase Order</h1>
          <p className="text-xs opacity-75">Transaction MIGO</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportToExcel} className="bg-blue-800 hover:bg-blue-900 px-4 py-2 text-sm shadow-sm rounded-sm">Export Data</button>
          <button className="bg-blue-700 hover:bg-blue-600 px-4 py-2 text-sm shadow-sm rounded-sm">Check</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        <div className="bg-white shadow-sm border p-6 lg:col-span-1 h-fit">
          <h2 className="text-lg font-bold mb-4">Post New Receipt</h2>
          {message && <p className="mb-4 text-sm font-bold text-green-700 bg-green-50 p-2 rounded">{message}</p>}
          <form onSubmit={handlePostGR} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Purchase Order Number (Internal ID)</label>
              <input 
                type="number" 
                required
                value={poId}
                onChange={(e) => setPoId(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded-sm focus:outline-none focus:border-blue-500"
                placeholder="e.g. 1"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">MIGO Document Ref</label>
              <input 
                type="text" 
                required
                value={migoDoc}
                onChange={(e) => setMigoDoc(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded-sm focus:outline-none focus:border-blue-500"
                placeholder="e.g. DEL-8899"
              />
            </div>
            
            <div className="pt-4 flex gap-4">
              <button type="submit" className="bg-green-600 hover:bg-green-700 text-white w-full py-2 rounded-sm shadow-sm font-semibold">Post Document</button>
            </div>
          </form>
        </div>

        <div className="bg-white shadow-sm border p-4 lg:col-span-2">
          <h2 className="text-lg font-bold mb-4">Recent Goods Receipts</h2>
          {loading ? <p>Loading data...</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-300 text-sm text-gray-700">
                    <th className="p-3 font-semibold">MIGO Doc</th>
                    <th className="p-3 font-semibold">PO Number</th>
                    <th className="p-3 font-semibold">Posting Date</th>
                    <th className="p-3 font-semibold">Movement Type</th>
                  </tr>
                </thead>
                <tbody>
                  {receipts.map(gr => (
                    <tr key={gr.gr_id} className="border-b border-gray-100 hover:bg-blue-50 text-sm text-gray-800 transition-colors">
                      <td className="p-3 font-medium text-blue-700">{gr.migo_document}</td>
                      <td className="p-3">{gr.po_number}</td>
                      <td className="p-3">{new Date(gr.posting_date).toLocaleDateString()}</td>
                      <td className="p-3 font-bold text-gray-600">{gr.movement_type}</td>
                    </tr>
                  ))}
                  {receipts.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-4 text-center text-gray-500">No Goods Receipts found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
