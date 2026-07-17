import React, { useEffect, useRef } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StatModal = ({ isOpen, onClose, title, value, icon, gradient, description, actionText, actionPath }) => {
  const modalRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Click outside to close
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header with Gradient */}
        <div className={`p-8 bg-gradient-to-br ${gradient} text-white relative`}>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md shadow-inner">
              {icon}
            </div>
            <div>
              <p className="text-white/80 text-sm font-semibold uppercase tracking-wider mb-1">{title}</p>
              <h2 className="text-4xl font-extrabold">{value}</h2>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 text-center space-y-6">
          <p className="text-slate-600 font-medium">
            {description || `This metric represents the current live status of ${title}. It is aggregated in real-time from the backend database.`}
          </p>

          {actionText && actionPath && (
            <button 
              onClick={() => {
                onClose();
                navigate(actionPath);
              }}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-semibold transition-colors"
            >
              <span>{actionText}</span>
              <ExternalLink size={18} className="text-slate-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatModal;
