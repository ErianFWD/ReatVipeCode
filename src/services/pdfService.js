/**
 * pdfService.js
 * Generates a professional invoice PDF from reservation data.
 * Uses jspdf + jspdf-autotable. No sensitive data is exposed.
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Brand colors matching global.css
const COLORS = {
  gold:     [184, 145, 75],   // --gold: #b8914b
  dark:     [17,  16,  14],   // --bg-dark: #11100e
  cream:    [246, 241, 232],  // --cream: #f6f1e8
  text:     [33,  31,  27],   // --text: #211f1b
  muted:    [124, 117, 107],  // --text-muted: #7c756b
  green:    [68,  99,  74],   // --green: #44634a
  red:      [164, 73,  73],   // --red: #a44949
  amber:    [183, 123, 49],   // --amber: #b77b31
};

function getPaymentStatusColor(status) {
  if (!status) return COLORS.muted;
  if (status === 'Aprobado') return COLORS.green;
  if (status === 'Rechazado' || status === 'Cancelado') return COLORS.red;
  return COLORS.amber; // Pendiente
}

export function generateInvoicePDF(reservation) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 18;

  // ── Header background ──────────────────────────────────────────
  doc.setFillColor(...COLORS.dark);
  doc.rect(0, 0, pageW, 48, 'F');

  // Brand mark square
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.5);
  doc.rect(margin, 10, 16, 16);
  doc.setFont('times', 'italic');
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.gold);
  doc.text('R', margin + 8, 21.5, { align: 'center' });

  // Brand name
  doc.setFont('times', 'normal');
  doc.setFontSize(17);
  doc.setTextColor(246, 241, 232);
  doc.text('ReservaPro', margin + 22, 20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(160, 152, 140);
  doc.text('LUXURY RESERVATION SYSTEM', margin + 22, 25);

  // Invoice label (right aligned)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.gold);
  doc.text('FACTURA', pageW - margin, 19, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(200, 190, 175);
  doc.text(`#${String(reservation.id).padStart(6, '0')}`, pageW - margin, 25, { align: 'right' });

  // Gold divider
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.3);
  doc.line(margin, 48, pageW - margin, 48);

  // ── Invoice meta & client info ─────────────────────────────────
  let y = 58;

  // Two columns: left = client info, right = invoice dates
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.muted);
  doc.text('CLIENTE', margin, y);
  doc.text('INFORMACIÓN DE FACTURA', pageW - margin - 60, y);

  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.text);
  doc.text(reservation.guestName || 'N/D', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.muted);
  doc.text(reservation.email || '', margin, y + 5);
  doc.text(reservation.phone || '', margin, y + 10);

  // Right column
  const rightCol = pageW - margin - 60;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.text);

  const invoiceDate = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  const rows = [
    ['Nº Factura',   `#${String(reservation.id).padStart(6, '0')}`],
    ['Código Reserva', `RES-${reservation.id}`],
    ['Fecha Emisión', invoiceDate],
    ['Fecha Reserva', reservation.date],
    ['Hora',          reservation.time || 'N/D'],
  ];

  rows.forEach(([label, value], i) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.muted);
    doc.text(label, rightCol, y + (i * 5));
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.text);
    doc.text(value, rightCol + 35, y + (i * 5));
  });

  y += 28;

  // ── Services table ─────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.muted);
  doc.text('DETALLE DE SERVICIOS', margin, y);
  y += 4;

  const isHotel = reservation.serviceType === 'hotel';
  const serviceType = isHotel ? 'Alojamiento' : 'Restaurante';
  const serviceDesc = isHotel
    ? `${reservation.roomType} — ${reservation.nights} noche(s)`
    : `Mesa área ${reservation.tableArea}`;
  const baseAmount = isHotel ? (reservation.nights || 1) * 150 : 0;

  const tableRows = [
    [serviceType, serviceDesc, `${reservation.guests} personas`, `$${baseAmount}`],
  ];

  // Add-ons if present
  const addons = reservation.addonsRequest;
  if (addons) {
    if (addons.wineQuantity > 0) {
      tableRows.push(['Add-on: Vino de Bienvenida', `x${addons.wineQuantity} botellas`, '', `$${addons.wineTotal}`]);
    }
    if (addons.lateCheckout) {
      tableRows.push(['Add-on: Late Check-out', 'Hasta las 16:00 hrs', '', `$${addons.lateCheckoutTotal}`]);
    }
    if (addons.dietaryRequests) {
      tableRows.push(['Requerimiento Dietético', addons.dietaryRequests, '', '$0.00']);
    }
    if (addons.specialRequests) {
      tableRows.push(['Solicitud Especial', addons.specialRequests, '', '$0.00']);
    }
  }

  autoTable(doc, {
    startY: y,
    head: [['Servicio', 'Descripción', 'Personas/Detalle', 'Monto']],
    body: tableRows,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 8,
      cellPadding: 4,
      textColor: COLORS.text,
      lineColor: [220, 210, 195],
      lineWidth: 0.15,
    },
    headStyles: {
      fillColor: COLORS.dark,
      textColor: COLORS.gold,
      fontStyle: 'bold',
      fontSize: 7,
      cellPadding: 5,
    },
    alternateRowStyles: {
      fillColor: [250, 246, 240],
    },
    columnStyles: {
      3: { halign: 'right', fontStyle: 'bold' },
    },
    theme: 'grid',
  });

  y = doc.lastAutoTable.finalY + 8;

  // ── Totals block ───────────────────────────────────────────────
  const addonsGrandTotal = addons?.grandTotal || 0;
  const subtotal = baseAmount + addonsGrandTotal;
  const taxRate = 0.13;
  const taxes = parseFloat((subtotal * taxRate).toFixed(2));
  const total = parseFloat((subtotal + taxes).toFixed(2));

  const totalsX = pageW - margin - 70;
  const valX = pageW - margin;

  const totalsRows = [
    ['Subtotal (servicios)',   `$${subtotal.toFixed(2)}`],
    ['Add-ons',                `$${addonsGrandTotal.toFixed(2)}`],
    ['Impuesto (13%)',         `$${taxes.toFixed(2)}`],
  ];

  totalsRows.forEach(([label, value], i) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.muted);
    doc.text(label, totalsX, y + (i * 7));
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.text);
    doc.text(value, valX, y + (i * 7), { align: 'right' });
  });

  y += totalsRows.length * 7 + 2;

  // Total line
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.4);
  doc.line(totalsX, y, valX, y);
  y += 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.dark);
  doc.text('TOTAL', totalsX, y);
  doc.setTextColor(...COLORS.gold);
  doc.text(`$${total.toFixed(2)}`, valX, y, { align: 'right' });

  y += 14;

  // ── Payment status block ───────────────────────────────────────
  const paymentStatus = reservation.paymentStatus || 'Pendiente';
  const paymentMethod = reservation.paymentMethod || 'N/D';
  const statusColor = getPaymentStatusColor(paymentStatus);

  doc.setFillColor(...COLORS.cream);
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, pageW - margin * 2, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.muted);
  doc.text('MÉTODO DE PAGO', margin + 6, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.text);
  doc.text(paymentMethod, margin + 6, y + 14);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.muted);
  doc.text('ESTADO DE TRANSACCIÓN', pageW / 2, y + 7);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...statusColor);
  doc.text(paymentStatus.toUpperCase(), pageW / 2, y + 14);

  // ── Footer ─────────────────────────────────────────────────────
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFillColor(...COLORS.dark);
  doc.rect(0, pageH - 20, pageW, 20, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(140, 130, 118);
  doc.text('ReservaPro — Luxury Reservation System', margin, pageH - 8);
  doc.text('Documento generado electrónicamente. No requiere firma.', pageW - margin, pageH - 8, { align: 'right' });

  // ── Save ───────────────────────────────────────────────────────
  const filename = `factura-${String(reservation.id).padStart(6, '0')}.pdf`;
  doc.save(filename);
}
