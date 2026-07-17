import React from 'react';

const StatusBadge = ({ status }) => {
  const getBadgeStyle = (statusName) => {
    switch (statusName?.toLowerCase()) {
      case 'active':
      case 'paid':
      case 'completed':
      case 'present':
        return { bg: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' };
      case 'pending':
      case 'unpaid':
      case 'in progress':
      case 'warning':
        return { bg: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' };
      case 'error':
      case 'inactive':
      case 'cancelled':
      case 'absent':
        return { bg: 'bg-rose-50 text-rose-700', dot: 'bg-rose-500' };
      default:
        return { bg: 'bg-slate-50 text-slate-700', dot: 'bg-slate-400' };
    }
  };

  const style = getBadgeStyle(status);

  return (
    <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${style.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
      <span>{status || 'Unknown'}</span>
    </span>
  );
};

export default StatusBadge;
