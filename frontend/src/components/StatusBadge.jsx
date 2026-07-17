import React from 'react';

const StatusBadge = ({ status }) => {
  const getBadgeStyle = (statusName) => {
    switch (statusName?.toLowerCase()) {
      case 'active':
      case 'paid':
      case 'completed':
      case 'present':
        return 'text-emerald-700 bg-emerald-100/50 border-emerald-200/50';
      case 'pending':
      case 'unpaid':
      case 'in progress':
      case 'warning':
        return 'text-amber-700 bg-amber-100/50 border-amber-200/50';
      case 'error':
      case 'inactive':
      case 'cancelled':
      case 'absent':
        return 'text-rose-700 bg-rose-100/50 border-rose-200/50';
      default:
        return 'text-slate-700 bg-slate-100/50 border-slate-200/50';
    }
  };

  return (
    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getBadgeStyle(status)}`}>
      {status || 'Unknown'}
    </span>
  );
};

export default StatusBadge;
