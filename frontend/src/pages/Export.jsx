import React, { useState } from 'react';
import { Download, Users, Briefcase, MapPin, IndianRupee, Calendar, Landmark, ShoppingBag, Package, ShoppingCart, Truck } from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../api/axios';

const Export = () => {
  const [exporting, setExporting] = useState(false);

  const downloadExcel = (data, filename, sheetName = 'Sheet1') => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const exportEmployees = async () => {
    try {
      setExporting(true);
      const res = await api.get('/employees');
      // Process data for export to remove internal keys like bank_photo_path if desired,
      // or map them to better column names.
      const exportData = res.data.map(emp => ({
        'Employee ID': emp.employee_id,
        'Full Name': emp.name,
        'Father/Husband Name': emp.father_name || 'N/A',
        'Date of Birth': emp.date_of_birth ? new Date(emp.date_of_birth).toLocaleDateString() : 'N/A',
        'Category': emp.category,
        'Post / Role': emp.post,
        'Mobile Number': emp.mobile_no || 'N/A',
        'Aadhar Number': emp.aadhar_no || 'N/A',
        'UAN Number': emp.uan_no || 'N/A',
        'ESIC Number': emp.esic_no || 'N/A',
        'Bank Account No': emp.bank_account_no || 'N/A',
        'IFSC Code': emp.ifsc_no || 'N/A',
        'Joined Date': new Date(emp.created_at).toLocaleDateString()
      }));
      downloadExcel(exportData, 'Employees_Data', 'Employees');
    } catch (err) {
      console.error(err);
      alert('Failed to export employees.');
    } finally {
      setExporting(false);
    }
  };

  const exportWorkOrders = async () => {
    try {
      setExporting(true);
      const res = await api.get('/work-orders');
      const exportData = res.data.map(wo => ({
        'WO Number': wo.wo_no,
        'Description': wo.description,
        'Issue Date': wo.issue_date ? new Date(wo.issue_date).toLocaleDateString() : 'N/A',
        'End Date': wo.end_date ? new Date(wo.end_date).toLocaleDateString() : 'N/A'
      }));
      downloadExcel(exportData, 'Work_Orders_Data', 'Work Orders');
    } catch (err) {
      console.error(err);
      alert('Failed to export work orders.');
    } finally {
      setExporting(false);
    }
  };

  const exportSites = async () => {
    try {
      setExporting(true);
      const res = await api.get('/sites');
      const exportData = res.data.map(s => ({
        'Site ID': s.site_id,
        'Site Name': s.site_name,
        'Work Order': s.wo_no || 'N/A',
        'Location': s.location,
        'Max Capacity': s.max_employees,
        'Category Requirement': s.employee_category || 'N/A',
        'Start Date': s.start_date ? new Date(s.start_date).toLocaleDateString() : 'N/A',
        'End Date': s.end_date ? new Date(s.end_date).toLocaleDateString() : 'N/A'
      }));
      downloadExcel(exportData, 'Sites_Data', 'Sites');
    } catch (err) {
      console.error(err);
      alert('Failed to export sites.');
    } finally {
      setExporting(false);
    }
  };

  const exportSalaries = async () => {
    // Note: fetches ALL salaries across all months since we don't pass a month filter.
    try {
      setExporting(true);
      const res = await api.get('/salary');
      const exportData = res.data.map(sal => ({
        'Salary ID': sal.salary_id,
        'Employee Name': sal.employee_name,
        'Post': sal.post,
        'Month': sal.month,
        'Sites Worked': sal.sites_worked || 'None',
        'Basic Salary': sal.basic_salary,
        'Allowances': sal.allowances,
        'Deductions': sal.deductions,
        'Net Salary': sal.net_salary,
        'Status': sal.payment_status || 'Pending',
        'Payment Date': sal.payment_date ? new Date(sal.payment_date).toLocaleDateString() : 'N/A'
      }));
      downloadExcel(exportData, 'Salaries_Data', 'Salaries');
    } catch (err) {
      console.error(err);
      alert('Failed to export salaries.');
    } finally {
      setExporting(false);
    }
  };

  const exportFinancials = async () => {
    try {
      setExporting(true);
      const [ar, ap, gl, coa, assets] = await Promise.all([
        api.get('/fi/ar').catch(()=>({data:[]})),
        api.get('/fi/ap').catch(()=>({data:[]})),
        api.get('/fi/gl').catch(()=>({data:[]})),
        api.get('/fi/coa').catch(()=>({data:[]})),
        api.get('/fi/assets').catch(()=>({data:[]}))
      ]);
      const workbook = XLSX.utils.book_new();
      if (ar.data.length) XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(ar.data), 'Accounts Receivable');
      if (ap.data.length) XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(ap.data), 'Accounts Payable');
      if (gl.data.length) XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(gl.data), 'General Ledger');
      if (coa.data.length) XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(coa.data), 'Chart of Accounts');
      if (assets.data.length) XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(assets.data), 'Fixed Assets');
      
      if (workbook.SheetNames.length === 0) XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet([{message: 'No records'}]), 'Empty');
      XLSX.writeFile(workbook, `Financial_Accounts.xlsx`);
    } catch (err) {
      console.error(err);
      alert('Failed to export financials.');
    } finally {
      setExporting(false);
    }
  };

  const exportSalesOrders = async () => {
    try {
      setExporting(true);
      const res = await api.get('/sd/sales-orders');
      downloadExcel(res.data, 'Sales_Orders');
    } catch (err) {
      console.error(err);
      alert('Failed to export sales orders.');
    } finally {
      setExporting(false);
    }
  };

  const exportMaterials = async () => {
    try {
      setExporting(true);
      const res = await api.get('/sap/materials');
      downloadExcel(res.data, 'Material_Master');
    } catch (err) {
      console.error(err);
      alert('Failed to export materials.');
    } finally {
      setExporting(false);
    }
  };

  const exportPurchaseOrders = async () => {
    try {
      setExporting(true);
      const res = await api.get('/sap/purchase-orders');
      downloadExcel(res.data, 'Purchase_Orders');
    } catch (err) {
      console.error(err);
      alert('Failed to export purchase orders.');
    } finally {
      setExporting(false);
    }
  };

  const exportGoodsReceipts = async () => {
    try {
      setExporting(true);
      const res = await api.get('/sap/goods-receipts');
      downloadExcel(res.data, 'Goods_Receipts');
    } catch (err) {
      console.error(err);
      alert('Failed to export goods receipts.');
    } finally {
      setExporting(false);
    }
  };

  const exportAllSystemRecords = async () => {
    try {
      setExporting(true);
      const [
        emp, wo, sites, sal,
        ar, ap, gl, coa, assets,
        sales, mat, pos, gr,
        wmBins, wmTrs, wmTos,
        prs, rfqs, info, contracts,
        miro, matdocs, idocs,
        ppOrders, ppMrp, ppRoutings, ppBoms,
        stockOverview, physicalInventory
      ] = await Promise.all([
        api.get('/employees').catch(()=>({data:[]})),
        api.get('/work-orders').catch(()=>({data:[]})),
        api.get('/sites').catch(()=>({data:[]})),
        api.get('/salary').catch(()=>({data:[]})),
        api.get('/fi/ar').catch(()=>({data:[]})),
        api.get('/fi/ap').catch(()=>({data:[]})),
        api.get('/fi/gl').catch(()=>({data:[]})),
        api.get('/fi/coa').catch(()=>({data:[]})),
        api.get('/fi/assets').catch(()=>({data:[]})),
        api.get('/sd/sales-orders').catch(()=>({data:[]})),
        api.get('/sap/materials').catch(()=>({data:[]})),
        api.get('/sap/purchase-orders').catch(()=>({data:[]})),
        api.get('/sap/goods-receipts').catch(()=>({data:[]})),
        api.get('/wm/bins').catch(()=>({data:[]})),
        api.get('/wm/trs').catch(()=>({data:[]})),
        api.get('/wm/tos').catch(()=>({data:[]})),
        api.get('/sap/prs').catch(()=>({data:[]})),
        api.get('/sap/rfqs').catch(()=>({data:[]})),
        api.get('/sap/info-records').catch(()=>({data:[]})),
        api.get('/sap/contracts').catch(()=>({data:[]})),
        api.get('/sap/miro-invoices').catch(()=>({data:[]})),
        api.get('/sap/material-documents').catch(()=>({data:[]})),
        api.get('/edi/idocs').catch(()=>({data:[]})),
        api.get('/pp/production-orders').catch(()=>({data:[]})),
        api.get('/pp/mrp-runs').catch(()=>({data:[]})),
        api.get('/pp/routings').catch(()=>({data:[]})),
        api.get('/pp/boms').catch(()=>({data:[]})),
        api.get('/sap/stock-overview').catch(()=>({data:[]})),
        api.get('/sap/physical-inventory').catch(()=>({data:[]}))
      ]);

      const workbook = XLSX.utils.book_new();
      
      const addSheet = (data, name) => {
        if(data && data.length) {
          XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data), name);
        }
      };

      addSheet(emp.data, 'Employees');
      addSheet(wo.data, 'Work Orders');
      addSheet(sites.data, 'Sites');
      addSheet(sal.data, 'Salaries');
      addSheet(ar.data, 'AR');
      addSheet(ap.data, 'AP');
      addSheet(gl.data, 'GL');
      addSheet(coa.data, 'COA');
      addSheet(assets.data, 'Fixed Assets');
      addSheet(sales.data, 'Sales Orders');
      addSheet(mat.data, 'Materials');
      addSheet(pos.data, 'Purchase Orders');
      addSheet(gr.data, 'Goods Receipts');
      addSheet(wmBins.data, 'WM Bins');
      addSheet(wmTrs.data, 'WM TRs');
      addSheet(wmTos.data, 'WM TOs');
      addSheet(prs.data, 'MM PRs');
      addSheet(rfqs.data, 'MM RFQs');
      addSheet(info.data, 'MM Info Records');
      addSheet(contracts.data, 'MM Contracts');
      addSheet(miro.data, 'MIRO Invoices');
      addSheet(matdocs.data, 'Material Docs');
      addSheet(idocs.data, 'EDI IDOCs');
      addSheet(ppOrders.data, 'PP Orders');
      addSheet(ppMrp.data, 'PP MRP');
      addSheet(ppRoutings.data, 'PP Routings');
      addSheet(ppBoms.data, 'PP BOMs');
      addSheet(stockOverview.data, 'IM Stock Overview');
      addSheet(physicalInventory.data, 'IM Physical Inventory');

      if (workbook.SheetNames.length === 0) {
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet([{ message: 'No records found' }]), 'Empty');
      }

      XLSX.writeFile(workbook, `Complete_System_Records.xlsx`);
    } catch (err) {
      console.error(err);
      alert('Failed to export all records.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Export Data</h1>
            <p className="text-gray-500">Download complete system records in Excel (.xlsx) format.</p>
          </div>
          <button 
            onClick={exportAllSystemRecords} disabled={exporting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 font-bold shadow-sm"
          >
            <Download size={20} /><span>Export All System Records</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-white flex flex-col items-start justify-between min-h-[160px]">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-sky-50 text-sky-600 rounded-lg"><Users size={24} /></div>
              <h2 className="text-lg font-bold text-gray-900">Employees</h2>
            </div>
            <p className="text-sm text-gray-500 mb-6 flex-1">Export complete details of all registered employees including banking and compliance data.</p>
            <button 
              onClick={exportEmployees} disabled={exporting}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
            >
              <Download size={18} /><span>Download Excel</span>
            </button>
          </div>

          <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-white flex flex-col items-start justify-between min-h-[160px]">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><MapPin size={24} /></div>
              <h2 className="text-lg font-bold text-gray-900">Sites</h2>
            </div>
            <p className="text-sm text-gray-500 mb-6 flex-1">Export a list of all active and past work sites including capacity limits and categories.</p>
            <button 
              onClick={exportSites} disabled={exporting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
            >
              <Download size={18} /><span>Download Excel</span>
            </button>
          </div>

          <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-white flex flex-col items-start justify-between min-h-[160px]">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-lg"><Briefcase size={24} /></div>
              <h2 className="text-lg font-bold text-gray-900">Work Orders</h2>
            </div>
            <p className="text-sm text-gray-500 mb-6 flex-1">Export details of all work orders, descriptions, and timelines.</p>
            <button 
              onClick={exportWorkOrders} disabled={exporting}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
            >
              <Download size={18} /><span>Download Excel</span>
            </button>
          </div>

          <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-white flex flex-col items-start justify-between min-h-[160px]">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg"><IndianRupee size={24} /></div>
              <h2 className="text-lg font-bold text-gray-900">Salaries</h2>
            </div>
            <p className="text-sm text-gray-500 mb-6 flex-1">Export a complete history of all processed salaries, net payouts, and payment status.</p>
            <button 
              onClick={exportSalaries} disabled={exporting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
            >
              <Download size={18} /><span>Download Excel</span>
            </button>
          </div>

          {/* New SAP Cards */}
          <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-white flex flex-col items-start justify-between min-h-[160px]">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg"><Landmark size={24} /></div>
              <h2 className="text-lg font-bold text-gray-900">Financial Accounts</h2>
            </div>
            <p className="text-sm text-gray-500 mb-6 flex-1">Export a complete workbook of AR, AP, General Ledger, COA, and Fixed Assets.</p>
            <button 
              onClick={exportFinancials} disabled={exporting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
            >
              <Download size={18} /><span>Download Excel</span>
            </button>
          </div>

          <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-white flex flex-col items-start justify-between min-h-[160px]">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><ShoppingBag size={24} /></div>
              <h2 className="text-lg font-bold text-gray-900">Sales Orders</h2>
            </div>
            <p className="text-sm text-gray-500 mb-6 flex-1">Export details of all customer sales orders and delivery statuses.</p>
            <button 
              onClick={exportSalesOrders} disabled={exporting}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
            >
              <Download size={18} /><span>Download Excel</span>
            </button>
          </div>

          <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-white flex flex-col items-start justify-between min-h-[160px]">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><Package size={24} /></div>
              <h2 className="text-lg font-bold text-gray-900">Material Master</h2>
            </div>
            <p className="text-sm text-gray-500 mb-6 flex-1">Export the complete list of managed materials and unrestricted stock levels.</p>
            <button 
              onClick={exportMaterials} disabled={exporting}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
            >
              <Download size={18} /><span>Download Excel</span>
            </button>
          </div>

          <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-white flex flex-col items-start justify-between min-h-[160px]">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-teal-50 text-teal-600 rounded-lg"><ShoppingCart size={24} /></div>
              <h2 className="text-lg font-bold text-gray-900">Purchase Orders</h2>
            </div>
            <p className="text-sm text-gray-500 mb-6 flex-1">Export vendor purchase orders, items, and procurement statuses.</p>
            <button 
              onClick={exportPurchaseOrders} disabled={exporting}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
            >
              <Download size={18} /><span>Download Excel</span>
            </button>
          </div>

          <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-white flex flex-col items-start justify-between min-h-[160px]">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-lg"><Truck size={24} /></div>
              <h2 className="text-lg font-bold text-gray-900">Goods Receipts</h2>
            </div>
            <p className="text-sm text-gray-500 mb-6 flex-1">Export all posted material documents and MIGO transaction logs.</p>
            <button 
              onClick={exportGoodsReceipts} disabled={exporting}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
            >
              <Download size={18} /><span>Download Excel</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Export;
