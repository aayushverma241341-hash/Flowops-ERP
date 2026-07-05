import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  Briefcase, User, ClipboardList, MapPin, Clock, FileText, 
  Package, ShoppingCart, Truck, ShoppingBag, Landmark, Search, 
  Menu, Bell, ChevronDown, ChevronRight, Warehouse, Layers, 
  Settings, FolderKanban, ShieldCheck, CreditCard, Receipt
} from 'lucide-react';
import SmartChat from './SmartChat';

const Layout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState({
    'Dashboard': true,
    'HR & Operations': false,
    'Financial Accounting (FI)': false,
    'Materials Management (MM)': false,
    'Production Planning (PP)': false,
    'Warehouse Management (WM)': false,
    'EDI & Integration': false,
    'Tools': false
  });

  const [currentUser, setCurrentUser] = useState(null);

  React.useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {
        console.error('Error parsing user from localStorage', e);
      }
    }
  }, []);

  const menuGroups = [
    {
      title: 'Dashboard',
      icon: <Briefcase size={20} />,
      items: [
        { label: 'Overview', path: '/' }
      ]
    },
    {
      title: 'HR & Operations',
      icon: <User size={20} />,
      items: [
        { label: 'Employees', path: '/employees' },
        { label: 'Work Orders', path: '/work-orders' },
        { label: 'Sites', path: '/sites' },
        { label: 'Attendance', path: '/attendance' },
        { label: 'Billing', path: '/billing' },
        { label: 'Salary', path: '/salary' }
      ]
    },
    {
      title: 'Financial Accounting (FI)',
      icon: <Landmark size={20} />,
      items: [
        { label: 'G/L & Accounts', path: '/sap/accounts' },
      ]
    },
    {
      title: 'Materials Management (MM)',
      icon: <Package size={20} />,
      items: [
        { label: 'Material Master', path: '/sap/materials' },
        { label: 'Procurement (PR/RFQ)', path: '/sap/procurement' },
        { label: 'Purchase Orders', path: '/sap/purchase-orders' },
        { label: 'Inventory (GR/GI)', path: '/sap/inventory' },
        { label: 'Sales Orders', path: '/sap/sales-orders' }
      ]
    },
    {
      title: 'Production Planning (PP)',
      icon: <Layers size={20} />,
      items: [
        { label: 'PP Operations', path: '/sap/pp' }
      ]
    },
    {
      title: 'Warehouse Management (WM)',
      icon: <Warehouse size={20} />,
      items: [
        { label: 'WM Operations', path: '/sap/wm' }
      ]
    },
    {
      title: 'EDI & Integration',
      icon: <Layers size={20} />,
      items: [
        { label: 'IDOC Management', path: '/sap/idocs' }
      ]
    },
    {
      title: 'Tools',
      icon: <Settings size={20} />,
      items: [
        { label: 'User Management', path: '/users' },
        { label: 'Search', path: '/search' },
        { label: 'Export Data', path: '/export' }
      ]
    }
  ];

  const toggleGroup = (title) => {
    setExpandedGroups(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const isActive = (path) => {
    return location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
  };

  // Generate Breadcrumbs
  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    if (paths.length === 0) return ['Dashboard', 'Overview'];
    
    let breadcrumbs = ['Home'];
    if (paths[0] === 'sap') {
      breadcrumbs.push('SAP System');
      breadcrumbs.push(paths[1] ? paths[1].charAt(0).toUpperCase() + paths[1].slice(1) : '');
    } else {
      breadcrumbs.push(paths[0].charAt(0).toUpperCase() + paths[0].slice(1));
    }
    return breadcrumbs;
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      
      {/* Sidebar */}
      <aside className={`bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 shadow-xl z-20 ${sidebarOpen ? 'w-72' : 'w-20'}`}>
        <div className="h-16 flex items-center justify-center border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3 px-4 w-full">
            <div className="bg-indigo-500 p-1.5 rounded-lg text-white">
              <FolderKanban size={24} />
            </div>
            {sidebarOpen && <span className="text-xl font-bold text-white tracking-tight">FlowOps ERP</span>}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 scrollbar-thin scrollbar-thumb-slate-700">
          <div className="px-3 space-y-2">
            {menuGroups.map((group, idx) => (
              <div key={idx} className="mb-2">
                <button 
                  onClick={() => sidebarOpen ? toggleGroup(group.title) : setSidebarOpen(true)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors ${!sidebarOpen && 'justify-center'} ${group.items.some(i => isActive(i.path)) ? 'text-indigo-400 bg-slate-800/50' : 'text-slate-400'}`}
                >
                  <div className="flex items-center space-x-3">
                    {group.icon}
                    {sidebarOpen && <span className="font-semibold text-sm tracking-wide">{group.title}</span>}
                  </div>
                  {sidebarOpen && (
                    <div className="text-slate-500">
                      {expandedGroups[group.title] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>
                  )}
                </button>

                {/* Sub Menu Items */}
                {sidebarOpen && expandedGroups[group.title] && (
                  <div className="mt-1 ml-4 pl-4 border-l border-slate-700 space-y-1">
                    {group.items.map((item, iIdx) => {
                      const active = isActive(item.path);
                      return (
                        <Link 
                          key={iIdx} 
                          to={item.path}
                          className={`block px-3 py-2 rounded-md text-sm transition-colors ${active ? 'bg-indigo-500 text-white font-medium shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* User Profile Snippet in Sidebar */}
        <div className={`p-4 border-t border-slate-800 flex items-center ${sidebarOpen ? 'space-x-3' : 'justify-center'}`}>
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold shrink-0">
            {currentUser ? currentUser.username.charAt(0).toUpperCase() : 'A'}
          </div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{currentUser ? currentUser.username : 'Admin User'}</p>
              <p className="text-xs text-slate-500 truncate">{currentUser ? currentUser.role : 'System Administrator'}</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top App Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0 z-10 shadow-sm">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <Menu size={20} />
            </button>
            
            {/* Dynamic Breadcrumbs */}
            <div className="hidden sm:flex items-center text-sm text-slate-500">
              {getBreadcrumbs().map((crumb, index, arr) => (
                <React.Fragment key={index}>
                  <span className={index === arr.length - 1 ? 'font-semibold text-slate-800' : ''}>
                    {crumb}
                  </span>
                  {index < arr.length - 1 && <ChevronRight size={14} className="mx-2" />}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search T-codes (e.g., ME21N)..." 
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-full text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50"
              />
            </div>
            <button className="relative text-slate-500 hover:text-indigo-600 transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Page Content Scrollable Area */}
        <div className="flex-1 overflow-auto bg-slate-50 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
      
      {/* Next-Gen AI Database Agent */}
      <SmartChat />
    </div>
  );
};

export default Layout;
