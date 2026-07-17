import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import WorkOrders from './pages/WorkOrders';
import Sites from './pages/Sites';
import Attendance from './pages/Attendance';
import Billing from './pages/Billing';
import Salary from './pages/Salary';
import Search from './pages/Search';
import Export from './pages/Export';
import Login from './pages/Login';
import MaterialMaster from './pages/SAP/MaterialMaster';
import PurchaseOrder from './pages/SAP/PurchaseOrder';
import GoodsReceipt from './pages/SAP/GoodsReceipt';
import SalesOrder from './pages/SAP/SalesOrder';
import AccountsReceivable from './pages/SAP/AccountsReceivable';
import AccountsPayable from './pages/SAP/AccountsPayable';
import GeneralLedger from './pages/SAP/GeneralLedger';
import ChartOfAccounts from './pages/SAP/ChartOfAccounts';
import FixedAssets from './pages/SAP/FixedAssets';
import WarehouseManagement from './pages/SAP/WarehouseManagement';
import IDOCManagement from './pages/SAP/IDOCManagement';
import Procurement from './pages/SAP/Procurement';
import Inventory from './pages/SAP/Inventory';
import ProductionPlanning from './pages/SAP/ProductionPlanning';
import Users from './pages/Users';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="employees" element={<Employees />} />
          <Route path="work-orders" element={<WorkOrders />} />
          <Route path="sites" element={<Sites />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="billing" element={<Billing />} />
          <Route path="salary" element={<Salary />} />
          <Route path="users" element={<Users />} />
          <Route path="search" element={<Search />} />
          <Route path="export" element={<Export />} />
          <Route path="sap/materials" element={<MaterialMaster />} />
          <Route path="sap/purchase-orders" element={<PurchaseOrder />} />
          <Route path="sap/goods-receipt" element={<GoodsReceipt />} />
          <Route path="sap/sales-orders" element={<SalesOrder />} />
          <Route path="sap/ar" element={<AccountsReceivable />} />
          <Route path="sap/ap" element={<AccountsPayable />} />
          <Route path="sap/gl" element={<GeneralLedger />} />
          <Route path="sap/coa" element={<ChartOfAccounts />} />
          <Route path="sap/fa" element={<FixedAssets />} />
          <Route path="sap/wm" element={<WarehouseManagement />} />
          <Route path="sap/idocs" element={<IDOCManagement />} />
          <Route path="sap/procurement" element={<Procurement />} />
          <Route path="sap/inventory" element={<Inventory />} />
          <Route path="sap/pp" element={<ProductionPlanning />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
