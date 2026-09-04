const nodemailer = require('nodemailer');

// Create transporter — uses Gmail SMTP or any SMTP configured in .env
function getTransporter() {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASS || '',   // Gmail App Password
    },
  });
}

// ── Order Confirmation to Customer ───────────────────────
async function sendOrderConfirmation(order) {
  if (!order.email) return;  // skip if no email
  const transporter = getTransporter();

  const itemRows = order.items.map(i =>
    `<tr>
      <td style="padding:8px;border-bottom:1px solid #eee;">${i.name} (${i.company})</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${i.squareFeet} sq.ft</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">₹${i.pricePerSqFt}/sqft</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">₹${i.totalPrice?.toLocaleString('en-IN')}</td>
    </tr>`
  ).join('');

  const html = `
  <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#333;">
      <div style="background:#8B5E3C;padding:24px;text-align:center;">
      <h1 style="color:white;margin:0;font-size:24px;">⬡ Tile House</h1>
      <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;">Order Confirmation</p>
    </div>
    <div style="padding:24px;background:#fff;">
      <h2 style="color:#8B5E3C;">Thank you, ${order.customerName}! 🎉</h2>
      <p>Your order <strong>#${String(order._id).slice(-8).toUpperCase()}</strong> has been placed successfully.</p>
      <p>Our team will call you at <strong>${order.phone}</strong> within 24 hours to confirm delivery.</p>

      <h3 style="margin-top:24px;">Order Details</h3>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#f5f1ec;">
            <th style="padding:8px;text-align:left;">Product</th>
            <th style="padding:8px;text-align:center;">Qty (sqft)</th>
            <th style="padding:8px;text-align:center;">Rate</th>
            <th style="padding:8px;text-align:right;">Amount</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <div style="margin-top:16px;background:#f9f6f2;padding:16px;border-radius:8px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span>Items Subtotal</span><strong>₹${order.subtotal?.toLocaleString('en-IN')}</strong></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span>Labour Charges</span><strong>₹${order.labourCharge?.toLocaleString('en-IN')}</strong></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span>Transportation (${order.distanceKm||0} km)</span><strong>₹${order.transportationCharge?.toLocaleString('en-IN')}</strong></div>
        ${order.discount>0 ? `<div style="display:flex;justify-content:space-between;margin-bottom:6px;color:green;"><span>Discount</span><strong>−₹${order.discount?.toLocaleString('en-IN')}</strong></div>` : ''}
        <div style="display:flex;justify-content:space-between;padding-top:8px;border-top:1px solid #ddd;font-size:18px;"><span><strong>Total Payable</strong></span><strong style="color:#8B5E3C;">₹${order.totalAmount?.toLocaleString('en-IN')}</strong></div>
      </div>

      <h3 style="margin-top:24px;">Delivery Address</h3>
      <p style="background:#f9f6f2;padding:12px;border-radius:8px;line-height:1.8;">
        ${order.customerName}<br/>
        ${order.address}${order.landmark ? '<br/>Landmark: '+order.landmark : ''}<br/>
        ${order.village ? order.village+', ' : ''}${order.district}, ${order.state} — ${order.pincode}
      </p>

      <p style="color:#888;font-size:13px;margin-top:24px;">
        If you have any questions, call us at <strong>+91 9872635534</strong><br/>
        Tile House, Bhucho Mandi, Bathinda, Punjab
      </p>
    </div>
    <div style="background:#1a1a1a;padding:16px;text-align:center;color:#aaa;font-size:12px;">
      © Tile House — Premium Tiles & Marble
    </div>
  </div>`;

  await transporter.sendMail({
    from: `"Tile House" <${process.env.EMAIL_USER}>`,
    to: order.email,
    subject: `✅ Order Confirmed — #${String(order._id).slice(-8).toUpperCase()} | Tile House`,
    html,
  });
}

// ── Dispatch notification with driver details ─────────────
async function sendDispatchNotification(order) {
  if (!order.email) return;
  const transporter = getTransporter();

  const html = `
  <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#333;">
    <div style="background:#8B5E3C;padding:24px;text-align:center;">
      <h1 style="color:white;margin:0;">⬡ Tile House</h1>
      <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;">Your Order is On the Way!</p>
    </div>
    <div style="padding:24px;background:#fff;">
      <h2 style="color:#8B5E3C;">🚚 Out for Delivery!</h2>
      <p>Dear ${order.customerName}, your order <strong>#${String(order._id).slice(-8).toUpperCase()}</strong> is on its way!</p>

      ${order.driverName || order.driverPhone ? `
      <div style="background:#E8F5E9;border:1px solid #A5D6A7;border-radius:10px;padding:16px;margin-top:20px;">
        <h3 style="color:#2E7D32;margin:0 0 12px;">🧑‍🔧 Delivery Details</h3>
        ${order.driverName ? `<p style="margin:4px 0;"><strong>Driver Name:</strong> ${order.driverName}</p>` : ''}
        ${order.driverPhone ? `<p style="margin:4px 0;"><strong>Driver Mobile:</strong> <a href="tel:${order.driverPhone}" style="color:#2E7D32;">${order.driverPhone}</a></p>` : ''}
        <p style="margin:8px 0 0;font-size:13px;color:#555;">You can call the driver for delivery updates.</p>
      </div>` : ''}

      <div style="margin-top:20px;background:#f9f6f2;padding:16px;border-radius:8px;">
        <p><strong>Delivery Address:</strong></p>
        <p>${order.address}, ${order.village ? order.village+', ':''} ${order.district}, ${order.state} — ${order.pincode}</p>
        <p><strong>Total Amount:</strong> ₹${order.totalAmount?.toLocaleString('en-IN')} (${order.paymentMethod})</p>
      </div>

      <p style="color:#888;font-size:13px;margin-top:20px;">Questions? Call us at +91 9872635534</p>
    </div>
    <div style="background:#1a1a1a;padding:16px;text-align:center;color:#aaa;font-size:12px;">
      © Tile House — Premium Tiles & Marble
    </div>
  </div>`;

  await transporter.sendMail({
    from: `"Tile House" <${process.env.EMAIL_USER}>`,
    to: order.email,
    subject: `🚚 Your Order is Out for Delivery — Tile House`,
    html,
  });
}

module.exports = { sendOrderConfirmation, sendDispatchNotification };
