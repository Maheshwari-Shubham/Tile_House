import { jsPDF } from 'jspdf';

const money = (value) => `Rs. ${(Number(value) || 0).toLocaleString('en-IN')}`;

function loadLogoDataUrl() {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth || 400;
        canvas.height = image.naturalHeight || 406;
        canvas.getContext('2d').drawImage(image, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch {
        resolve(null);
      }
    };
    image.onerror = () => resolve(null);
    image.src = `${process.env.PUBLIC_URL || ''}/favicon.svg`;
  });
}

export async function downloadInvoice(order) {
  const pdf = new jsPDF();
  const orderNumber = String(order._id).slice(-8).toUpperCase();
  const date = new Date(order.createdAt).toLocaleDateString('en-IN');
  const logo = await loadLogoDataUrl();
  let y = 22;

  if (logo) {
    pdf.addImage(logo, 'PNG', 20, 10, 18, 18);
  }
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(22);
  pdf.setTextColor(139, 94, 60);
  pdf.text('Tile House', logo ? 43 : 20, y);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(80, 80, 80);
  pdf.text(`Invoice: #${orderNumber}`, 145, 16);
  pdf.text(`Date: ${date}`, 145, 22);

  y = 38;
  pdf.setDrawColor(220, 210, 200);
  pdf.line(20, y, 190, y);
  y += 10;

  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(30, 30, 30);
  pdf.text('Customer', 20, y);
  y += 6;
  pdf.setFont('helvetica', 'normal');
  pdf.text(String(order.customerName || ''), 20, y);
  y += 5;
  pdf.text(String(order.phone || ''), 20, y);
  y += 5;
  const address = `${order.address || ''}${order.landmark ? `, ${order.landmark}` : ''}`;
  const location = `${order.village ? `${order.village}, ` : ''}${order.district || ''}, ${order.state || ''} - ${order.pincode || ''}`;
  pdf.text(address.slice(0, 95), 20, y);
  y += 5;
  pdf.text(location.slice(0, 95), 20, y);

  y += 12;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Items', 20, y);
  y += 7;
  pdf.setFontSize(9);
  pdf.setFillColor(245, 241, 236);
  pdf.rect(20, y - 5, 170, 8, 'F');
  pdf.setTextColor(40, 40, 40);
  pdf.text('Product', 22, y);
  pdf.text('Area', 125, y);
  pdf.text('Amount', 162, y);
  y += 8;
  pdf.setFont('helvetica', 'normal');

  (order.items || []).forEach((item) => {
    const name = `${item.name || ''} (${item.dimensions || ''})`;
    pdf.text(name.slice(0, 58), 22, y);
    pdf.text(`${item.squareFeet || 0} sq.ft`, 125, y);
    pdf.text(money(item.totalPrice), 162, y);
    y += 7;
    if (y > 265) {
      pdf.addPage();
      y = 20;
    }
  });

  y += 5;
  pdf.setDrawColor(220, 210, 200);
  pdf.line(110, y, 190, y);
  y += 8;
  const charges = [
    ['Tiles Subtotal', order.subtotal],
    ['Labour', order.adminLabourOverride ?? order.labourCharge],
    ['Transport', order.adminTransportOverride ?? order.transportationCharge],
  ];
  if (order.discount > 0) charges.push(['Discount', -order.discount]);

  pdf.setFont('helvetica', 'normal');
  charges.forEach(([label, value]) => {
    pdf.text(label, 115, y);
    pdf.text(money(value), 162, y);
    y += 6;
  });

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('Total', 115, y + 2);
  pdf.text(money(order.totalAmount), 162, y + 2);
  y += 12;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text(`Payment: ${order.paymentMethod || 'COD'}`, 20, y);
  pdf.text('Status: Delivered', 20, y + 6);
  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Thank you for choosing Tile House.', 20, 280);
  pdf.text('+91 9872635534', 160, 280);

  pdf.save(`Tile-House-Invoice-${orderNumber}.pdf`);
}
