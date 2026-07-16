import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Generic helper to add a beautiful FlowOps ERP header to any PDF.
 */
const addHeader = (doc, title, subtitle = '') => {
  doc.setFillColor(14, 165, 233); // sky-500
  doc.rect(0, 0, doc.internal.pageSize.width, 15, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('FlowOps ERP', 14, 10);
  
  doc.setTextColor(30, 41, 59); // slate-800
  doc.setFontSize(22);
  doc.text(title, 14, 30);
  
  if (subtitle) {
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, 14, 38);
  }
};

/**
 * Generate an elegant Invoice PDF.
 * @param {Object} inv Invoice metadata
 * @param {Array} details Array of invoice line items
 */
export const generateInvoicePDF = (inv, details) => {
  const doc = new jsPDF();
  
  addHeader(doc, `Tax Invoice`, `Invoice #: INV-${inv.invoice_id}`);
  
  // Invoice Metadata
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To / Site:', 14, 50);
  doc.setFont('helvetica', 'normal');
  doc.text(inv.site_name || 'N/A', 14, 55);
  doc.text(`Work Order: ${inv.wo_no} ${inv.wo_description ? '(' + inv.wo_description + ')' : ''}`, 14, 60);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Invoice Details:', 120, 50);
  doc.setFont('helvetica', 'normal');
  doc.text(`Issue Date: ${new Date(inv.issue_date).toLocaleDateString()}`, 120, 55);
  doc.text(`Due Date: ${new Date(inv.due_date).toLocaleDateString()}`, 120, 60);
  doc.text(`Status: ${inv.status || 'Pending'}`, 120, 65);

  // Line Items Table
  const tableColumn = ["Description", "Quantity", "Rate (Rs)", "Amount (Rs)"];
  const tableRows = [];

  details.forEach(detail => {
    tableRows.push([
      detail.description,
      detail.quantity,
      parseFloat(detail.rate).toLocaleString(undefined, { minimumFractionDigits: 2 }),
      parseFloat(detail.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })
    ]);
  });

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 75,
    theme: 'grid',
    headStyles: { fillColor: [14, 165, 233], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'right', fontStyle: 'bold' }
    }
  });
  
  // Totals
  const finalY = doc.lastAutoTable.finalY || 75;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Total Amount:', 130, finalY + 10);
  doc.setTextColor(14, 165, 233);
  doc.text(`Rs. ${parseFloat(inv.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 165, finalY + 10);

  // Footer Signature
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('For FlowOps ERP', 150, finalY + 40);
  doc.line(140, finalY + 55, 195, finalY + 55);
  doc.text('Authorized Signatory', 145, finalY + 60);
  
  doc.save(`Invoice_INV-${inv.invoice_id}.pdf`);
};

/**
 * Generate an elegant Salary Slip PDF.
 * @param {Object} salary Salary record metadata
 * @param {Object} employee Employee details
 */
export const generateSalarySlipPDF = (salary, employee) => {
  const doc = new jsPDF();
  
  addHeader(doc, 'Payslip', `Month: ${salary.month}`);
  
  // Employee Information
  doc.setFontSize(11);
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.text('Employee Details:', 14, 50);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${employee.name}`, 14, 57);
  doc.text(`Email: ${employee.email}`, 14, 63);
  doc.text(`Role: ${employee.role}`, 14, 69);
  doc.text(`Join Date: ${new Date(employee.created_at).toLocaleDateString()}`, 14, 75);

  doc.setFont('helvetica', 'bold');
  doc.text('Payment Details:', 120, 50);
  doc.setFont('helvetica', 'normal');
  doc.text(`Transaction ID: ${salary.id || 'N/A'}`, 120, 57);
  doc.text(`Payment Date: ${new Date(salary.created_at || Date.now()).toLocaleDateString()}`, 120, 63);
  doc.text(`Payment Mode: Bank Transfer`, 120, 69);
  
  // Earnings & Deductions Tables
  const earnings = [
    ["Basic Salary", parseFloat(salary.base_salary).toLocaleString(undefined, { minimumFractionDigits: 2 })],
    ["Allowances", parseFloat(salary.bonus || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })],
  ];
  const deductions = [
    ["Tax / TDS", parseFloat(salary.deductions || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })],
  ];

  doc.autoTable({
    head: [['Earnings', 'Amount (Rs)']],
    body: earnings,
    startY: 90,
    theme: 'plain',
    headStyles: { fillColor: [248, 250, 252], textColor: [15, 23, 42], fontStyle: 'bold', lineWidth: 0.1, lineColor: [226, 232, 240] },
    bodyStyles: { borderBottomWidth: 0.1, borderBottomColor: [226, 232, 240] },
    columnStyles: { 1: { halign: 'right' } },
    margin: { left: 14, right: 110 }
  });

  doc.autoTable({
    head: [['Deductions', 'Amount (Rs)']],
    body: deductions,
    startY: 90,
    theme: 'plain',
    headStyles: { fillColor: [248, 250, 252], textColor: [15, 23, 42], fontStyle: 'bold', lineWidth: 0.1, lineColor: [226, 232, 240] },
    bodyStyles: { borderBottomWidth: 0.1, borderBottomColor: [226, 232, 240] },
    columnStyles: { 1: { halign: 'right' } },
    margin: { left: 110, right: 14 }
  });

  const finalY = Math.max(doc.lastAutoTable.finalY || 90, 130);
  
  doc.setFillColor(241, 245, 249);
  doc.rect(14, finalY + 10, doc.internal.pageSize.width - 28, 12, 'F');
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Net Pay:', 20, finalY + 18);
  doc.setTextColor(14, 165, 233);
  doc.text(`Rs. ${parseFloat(salary.net_salary).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 165, finalY + 18);
  
  doc.save(`Payslip_${employee.name.replace(/\s+/g, '_')}_${salary.month}.pdf`);
};

/**
 * Generate a generic tabular report for FI modules (e.g. Accounts Payable, General Ledger).
 */
export const generateReportPDF = (title, columns, data, filename = 'Report.pdf') => {
  const doc = new jsPDF();
  addHeader(doc, title, `Generated: ${new Date().toLocaleDateString()}`);

  doc.autoTable({
    head: [columns],
    body: data,
    startY: 45,
    theme: 'striped',
    headStyles: { fillColor: [14, 165, 233], textColor: 255 },
    styles: { fontSize: 9 }
  });

  doc.save(filename);
};
