import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Command, ArrowRight, User, Package, Briefcase, FileText, Settings, Layers } from 'lucide-react';

const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Static list of navigable actions/routes
  const actions = [
    { id: 'dashboard', title: 'Go to Dashboard', path: '/', icon: Briefcase, category: 'Navigation' },
    { id: 'employees', title: 'Manage Employees', path: '/employees', icon: User, category: 'HR' },
    { id: 'attendance', title: 'View Attendance', path: '/attendance', icon: FileText, category: 'HR' },
    { id: 'salary', title: 'Process Salary', path: '/salary', icon: FileText, category: 'HR' },
    { id: 'materials', title: 'Material Master', path: '/sap/materials', icon: Package, category: 'MM' },
    { id: 'po', title: 'Purchase Orders', path: '/sap/purchase-orders', icon: Package, category: 'MM' },
    { id: 'inventory', title: 'Inventory (GR/GI)', path: '/sap/inventory', icon: Package, category: 'MM' },
    { id: 'sales', title: 'Sales Orders', path: '/sap/sales-orders', icon: Package, category: 'SD' },
    { id: 'accounts', title: 'Accounts Center (FI)', path: '/sap/accounts', icon: Layers, category: 'FI' },
    { id: 'users', title: 'User Management', path: '/users', icon: Settings, category: 'Admin' },
  ];

  const filteredActions = query === '' 
    ? actions 
    : actions.filter(action => action.title.toLowerCase().includes(query.toLowerCase()) || action.category.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredActions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredActions.length) % filteredActions.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredActions[selectedIndex]) {
          navigate(filteredActions[selectedIndex].path);
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredActions, selectedIndex, navigate, onClose]);

  // Handle global Cmd+K
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open logic needs to be handled by parent, so this just intercepts if not already handled
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 sm:pt-32 px-4 animate-in fade-in duration-200">
      {/* Blurred Backdrop */}
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white w-full max-w-xl rounded-2xl shadow-float overflow-hidden flex flex-col transform transition-all animate-in zoom-in-95 duration-200">
        
        {/* Search Input */}
        <div className="flex items-center px-4 py-4 border-b border-slate-100">
          <Search className="text-slate-400 mr-3" size={20} />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent text-slate-800 text-lg placeholder-slate-400 focus:outline-none"
            placeholder="Search actions, records, or T-codes..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <div className="hidden sm:flex items-center space-x-1">
            <kbd className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-xs font-sans font-semibold border border-slate-200">esc</kbd>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filteredActions.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Command className="mx-auto mb-3 text-slate-300" size={32} />
              <p>No results found for "{query}"</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredActions.map((action, index) => {
                const Icon = action.icon;
                const isSelected = index === selectedIndex;
                return (
                  <div
                    key={action.id}
                    onMouseEnter={() => setSelectedIndex(index)}
                    onClick={() => {
                      navigate(action.path);
                      onClose();
                    }}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon size={18} className={isSelected ? 'text-indigo-600' : 'text-slate-400'} />
                      <span className="font-medium text-sm">{action.title}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-500">{action.category}</span>
                      {isSelected && <ArrowRight size={16} className="text-indigo-500 animate-in slide-in-from-left-2" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-100 px-4 py-3 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <kbd className="bg-white border border-slate-200 rounded px-1.5 py-0.5">↑</kbd>
              <kbd className="bg-white border border-slate-200 rounded px-1.5 py-0.5">↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center space-x-1">
              <kbd className="bg-white border border-slate-200 rounded px-1.5 py-0.5">↵</kbd>
              <span>to select</span>
            </span>
          </div>
          <span className="font-medium tracking-wide">FlowOps Command</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
