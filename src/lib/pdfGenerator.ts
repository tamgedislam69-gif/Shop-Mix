import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order } from '../types';
import { formatPrice } from './utils';

export const generateInvoicePDF = (order: Order) => {
  const doc = new jsPDF();
  const primaryColor = '#f85606'; // Shop Mix Orange

  // Add Logo/Header
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('SHOP MIX ONLINE BD', 20, 25);
  
  doc.setFontSize(10);
  doc.text('PREMIUM E-COMMERCE SOLUTIONS', 20, 32);

  // Invoice Details
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.text('INVOICE', 20, 55);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Order ID: ${order.id}`, 20, 65);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 20, 71);
  doc.text(`Status: ${order.status.toUpperCase()}`, 20, 77);

  // Customer Info
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO:', 120, 65);
  doc.setFont('helvetica', 'normal');
  doc.text(order.customer.name, 120, 71);
  doc.text(order.customer.phone, 120, 77);
  doc.text(order.customer.address, 120, 83, { maxWidth: 70 });

  // Table
  const tableRows = order.items.map(item => [
    item.name,
    item.quantity.toString(),
    formatPrice(item.price),
    formatPrice(item.price * item.quantity)
  ]);

  autoTable(doc, {
    startY: 95,
    head: [['Product', 'Qty', 'Unit Price', 'Total']],
    body: tableRows,
    headStyles: { fillColor: [248, 86, 6] },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    margin: { left: 20, right: 20 },
  });

  // Totals
  const lastTable = (doc as any).lastAutoTable;
  const finalY = (lastTable ? lastTable.finalY : 150) + 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Total Summary:', 140, finalY);
  doc.setFont('helvetica', 'normal');
  doc.text(`Subtotal: ${formatPrice(order.total - (order.total > 5000 ? 0 : 150))}`, 140, finalY + 7);
  doc.text(`Shipping: ${order.total > 5000 ? 'FREE' : formatPrice(150)}`, 140, finalY + 14);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor);
  doc.text(`Total Payable: ${formatPrice(order.total)}`, 140, finalY + 24);

  // Footer
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.text('This is a computer generated invoice and does not require signature.', 20, 285);
  doc.text('Thank you for shopping with Shop Mix Online BD!', 20, 290);

  // Save
  doc.save(`ShopMix_Invoice_${order.id}.pdf`);
};
