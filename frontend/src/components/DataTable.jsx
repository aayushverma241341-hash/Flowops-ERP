import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import EmptyState from './EmptyState';

const DataTable = ({ 
  columns, 
  data, 
  searchPlaceholder = "Search records...", 
  searchable = true,
  emptyStateTitle,
  emptyStateDesc,
  onEmptyAction,
  emptyActionLabel
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  
  // Basic Search Filtering (checks all string values in a row)
  const filteredData = data.filter(row => 
    Object.values(row).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * rowsPerPage, 
    currentPage * rowsPerPage
  );

  return (
    <div className="bg-white rounded-xl shadow-soft overflow-hidden animate-in fade-in duration-300">
      
      {/* Table Header/Toolbar */}
      {searchable && (
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset page on search
              }}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm"
            />
          </div>
          <div className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-700">{filteredData.length}</span> records
          </div>
        </div>
      )}

      {/* Table Content */}
      {data.length === 0 ? (
        <div className="p-6">
          <EmptyState 
            title={emptyStateTitle} 
            description={emptyStateDesc}
            actionLabel={emptyActionLabel}
            onAction={onEmptyAction}
          />
        </div>
      ) : filteredData.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-sm">
          No records match your search "<strong>{searchTerm}</strong>".
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                {columns.map((col, idx) => (
                  <th 
                    key={idx} 
                    className="px-6 py-5 text-xs font-semibold text-slate-400 tracking-tight whitespace-nowrap"
                  >
                    <div className="flex items-center space-x-1 cursor-pointer hover:text-slate-600 transition-colors">
                      <span>{col.header}</span>
                      <ArrowUpDown size={14} className="opacity-40" />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentData.map((row, rIdx) => (
                <tr key={rIdx} className="group hover:bg-slate-50/50 transition-colors duration-200">
                  {columns.map((col, cIdx) => (
                    <td 
                      key={cIdx} 
                      className={`px-6 py-4 text-sm text-slate-700 whitespace-nowrap ${col.header === 'Actions' ? 'opacity-0 group-hover:opacity-100 transition-opacity duration-200' : ''}`}
                    >
                      {col.cell ? col.cell(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {filteredData.length > 0 && (
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white">
          <div className="text-sm text-slate-500">
            Page <span className="font-semibold text-slate-700">{currentPage}</span> of <span className="font-semibold text-slate-700">{totalPages || 1}</span>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
