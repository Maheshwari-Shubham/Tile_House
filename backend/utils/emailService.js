const nodemailer = require('nodemailer');
const Settings   = require('../models/Settings');

// Read email credentials from database (admin-editable via Settings tab)
async function getEmailCfg() {
  const rows = await Settings.find({
    key: { $in: ['email_from','email_pass','email_from_name','shop_phone','shop_address'] }
  });
  const c = {};
  rows.forEach(r => { c[r.key] = r.value; });

  c.email_from      = c.email_from      || process.env.EMAIL_USER;
  c.email_pass      = c.email_pass      || process.env.EMAIL_PASS;
  c.email_from_name = c.email_from_name || process.env.EMAIL_FROM_NAME || 'Tile House';
  c.shop_phone      = c.shop_phone      || process.env.SHOP_PHONE || '+91 98765 43210';
  c.shop_address    = c.shop_address    || process.env.SHOP_ADDRESS || 'Bhucho Mandi, Bathinda, Punjab';

  return c;
}

function makeTransporter(cfg) {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: cfg.email_from, pass: cfg.email_pass },
  });
}

// Shared helpers
const rupee = (n) => (n || 0).toLocaleString('en-IN');
const orderId = (o) => '#' + String(o._id).slice(-8).toUpperCase();

function headerBlock(color, statusLine) {
  return `
    <div style="background:${color};color:white;padding:28px 32px;
         border-radius:10px 10px 0 0;text-align:center">
      <h1 style="margin:0;font-size:26px">⬡ Tile House</h1>
      <p style="margin:6px 0 0;opacity:.9;font-size:15px">${statusLine}</p>
    </div>`;
}

function footerBlock(fromName, shopAddress, shopPhone) {
  return `
    <div style="margin-top:28px;padding-top:20px;border-top:1px solid #eee;
         color:#aaa;font-size:12px;text-align:center">
      ${fromName} | ${shopAddress}<br/>📞 ${shopPhone}
    </div>`;
}

function chargesTable(o) {
  const transport = o.adminTransportOverride != null
    ? o.adminTransportOverride : (o.transportationCharge || 0);
  return `
    <table style="width:100%;font-size:14px;border-collapse:collapse">
      <tr><td style="padding:5px 0;color:#555">Items Subtotal</td>
          <td style="text-align:right">₹${rupee(o.subtotal)}</td></tr>
      <tr><td style="padding:5px 0;color:#555">Labour Charges</td>
          <td style="text-align:right">₹${rupee(o.labourCharge)}</td></tr>
      <tr><td style="padding:5px 0;color:#555">Transport Charges</td>
          <td style="text-align:right">₹${rupee(transport)}</td></tr>
      ${o.discount ? `<tr><td style="padding:5px 0;color:#2E7D32">Discount</td>
          <td style="text-align:right;color:#2E7D32">− ₹${rupee(o.discount)}</td></tr>` : ''}
      <tr style="font-weight:bold;border-top:2px solid #ccc">
        <td style="padding:10px 0;font-size:16px">Total Amount</td>
        <td style="text-align:right;font-size:18px;color:#8B5E3C">₹${rupee(o.totalAmount)}</td>
      </tr>
    </table>`;
}

function addressBlock(o) {
  return `
    <p style="color:#555;line-height:1.8;font-size:14px;margin:0">
      ${o.address}${o.landmark ? ', ' + o.landmark : ''}<br/>
      ${o.village ? o.village + ', ' : ''}${o.district || ''}, ${o.state} — ${o.pincode}<br/>
      📞 ${o.phone}
    </p>`;
}

// ── 1. Order Placed ───────────────────────────────────────
async function sendOrderConfirmation(order) {
  try {
    const cfg = await getEmailCfg();
    if (!cfg.email_from || !cfg.email_pass) { console.log('📧 Email not configured in Settings.'); return; }
    if (!order.email || !order.email.includes('@')) { console.log('📧 No customer email for order', orderId(order)); return; }

    const fromName    = cfg.email_from_name || 'Tile House';
    const shopPhone   = cfg.shop_phone      || '+91 98765 43210';
    const shopAddress = cfg.shop_address    || 'Bhucho Mandi, Bathinda, Punjab';

    const itemRows = (order.items || []).map(i => `
      <tr>
        <td style="padding:9px 8px;border-bottom:1px solid #eee">
          ${i.name} <span style="color:#888;font-size:12px">(${i.company}) · ${i.dimensions}</span>
        </td>
        <td style="padding:9px 8px;border-bottom:1px solid #eee;text-align:center">${i.squareFeet} sq.ft</td>
        <td style="padding:9px 8px;border-bottom:1px solid #eee;text-align:right">₹${rupee(i.totalPrice)}</td>
      </tr>`).join('');

    const html = `
    <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;background:#FAFAF8">
      ${headerBlock('#8B5E3C', '📋 Order Received')}
      <div style="padding:32px;background:white;border:1px solid #E8E0D5;border-top:none;border-radius:0 0 10px 10px">
        <h2 style="color:#1A1A1A;margin-top:0">Thank you, ${order.customerName}! 🎉</h2>
        <p style="color:#555;font-size:15px">Your order has been received. Our team will call you within 24 hours to confirm delivery.</p>

        <div style="background:#F5F1EC;padding:14px 20px;border-radius:8px;margin:20px 0;border-left:4px solid #8B5E3C;font-size:14px">
          <strong>Order ID:</strong> ${orderId(order)}<br/>
          <strong>Date:</strong> ${new Date(order.createdAt||Date.now()).toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}<br/>
          <strong>Payment:</strong> ${order.paymentMethod}
        </div>

        <h3 style="color:#8B5E3C;border-bottom:2px solid #E8E0D5;padding-bottom:8px">Items Ordered</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <thead><tr style="background:#F5F1EC">
            <th style="padding:9px 8px;text-align:left">Product</th>
            <th style="padding:9px 8px;text-align:center">Area</th>
            <th style="padding:9px 8px;text-align:right">Amount</th>
          </tr></thead>
          <tbody>${itemRows}</tbody>
        </table>

        <div style="margin-top:20px">${chargesTable(order)}</div>

        <h3 style="color:#8B5E3C;border-bottom:2px solid #E8E0D5;padding-bottom:8px;margin-top:24px">Delivery Address</h3>
        ${addressBlock(order)}

        <div style="background:#E8F5E9;border-radius:8px;padding:14px 18px;margin-top:20px;border:1px solid #A5D6A7;font-size:14px">
          📞 We will call you at <strong>${order.phone}</strong> within 24 hours to confirm delivery schedule.
        </div>
        ${footerBlock(fromName, shopAddress, shopPhone)}
      </div>
    </div>`;

    await makeTransporter(cfg).sendMail({
      from: `"${fromName}" <${cfg.email_from}>`,
      to: order.email,
      subject: `✅ Order Received ${orderId(order)} | Tile House`,
      html,
    });
    console.log(`📧 Order confirmation sent → ${order.email}`);
  } catch (err) {
    console.error('sendOrderConfirmation error:', err.message);
  }
}

// ── 2. Order Confirmed by Admin ───────────────────────────
async function sendOrderConfirmed(order) {
  try {
    const cfg = await getEmailCfg();
    if (!cfg.email_from || !cfg.email_pass) { console.log('📧 Email not configured in Settings.'); return; }
    if (!order.email || !order.email.includes('@')) { console.log('📧 No customer email for order', orderId(order)); return; }

    const fromName    = cfg.email_from_name || 'Tile House';
    const shopPhone   = cfg.shop_phone      || '+91 98765 43210';
    const shopAddress = cfg.shop_address    || 'Bhucho Mandi, Bathinda, Punjab';

    const html = `
    <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;background:#FAFAF8">
      ${headerBlock('#2E7D32', '✅ Order Confirmed')}
      <div style="padding:32px;background:white;border:1px solid #E8E0D5;border-top:none;border-radius:0 0 10px 10px">
        <h2 style="color:#1A1A1A;margin-top:0">Hi ${order.customerName}, your order is confirmed!</h2>
        <p style="color:#555;font-size:15px">Our team has confirmed your order and is preparing it for dispatch.</p>

        <div style="background:#E8F5E9;padding:16px 20px;border-radius:8px;margin:20px 0;border:2px solid #4CAF50;font-size:14px">
          <strong style="color:#2E7D32;font-size:16px">✅ STATUS: CONFIRMED</strong><br/><br/>
          <strong>Order ID:</strong> ${orderId(order)}<br/>
          <strong>Payment:</strong> ${order.paymentMethod}
        </div>

        <h3 style="color:#2E7D32;border-bottom:2px solid #E8E0D5;padding-bottom:8px">Charges Breakdown</h3>
        ${chargesTable(order)}

        <h3 style="color:#2E7D32;border-bottom:2px solid #E8E0D5;padding-bottom:8px;margin-top:24px">Delivery Address</h3>
        ${addressBlock(order)}

        <div style="background:#FFF8E1;border-radius:8px;padding:14px 18px;margin-top:20px;font-size:14px">
          📦 Your tiles are being prepared. You will receive another email with driver details when your order is out for delivery.
        </div>
        ${footerBlock(fromName, shopAddress, shopPhone)}
      </div>
    </div>`;

    await makeTransporter(cfg).sendMail({
      from: `"${fromName}" <${cfg.email_from}>`,
      to: order.email,
      subject: `✅ Order Confirmed ${orderId(order)} | Tile House`,
      html,
    });
    console.log(`📧 Order confirmed email sent → ${order.email}`);
  } catch (err) {
    console.error('sendOrderConfirmed error:', err.message);
  }
}

// ── 3. Out for Delivery — with Driver Details ─────────────
async function sendDispatchNotification(order) {
  try {
    const cfg = await getEmailCfg();
    if (!cfg.email_from || !cfg.email_pass) { console.log('📧 Email not configured in Settings.'); return; }
    if (!order.email || !order.email.includes('@')) { console.log('📧 No customer email for order', orderId(order)); return; }

    const fromName    = cfg.email_from_name || 'Tile House';
    const shopPhone   = cfg.shop_phone      || '+91 98765 43210';
    const shopAddress = cfg.shop_address    || 'Bhucho Mandi, Bathinda, Punjab';

    const driverSection = (order.driverName || order.driverPhone || order.vehicleNumber) ? `
      <div style="background:#F5F1EC;padding:16px 20px;border-radius:8px;margin:20px 0;border-left:4px solid #8B5E3C">
        <h3 style="color:#8B5E3C;margin:0 0 12px;font-size:16px">🧑 Delivery Person Details</h3>
        ${order.driverName    ? `<div style="margin-bottom:8px;font-size:14px"><strong>Driver Name:</strong> ${order.driverName}</div>` : ''}
        ${order.driverPhone   ? `<div style="margin-bottom:8px;font-size:14px"><strong>Driver Mobile:</strong>
            <a href="tel:${order.driverPhone}" style="color:#1565C0;font-weight:bold;font-size:16px">${order.driverPhone}</a></div>` : ''}
        ${order.vehicleNumber ? `<div style="margin-bottom:8px;font-size:14px"><strong>Vehicle Number:</strong>
            <strong style="color:#333;font-size:15px">${order.vehicleNumber}</strong></div>` : ''}
        <div style="margin-top:8px;font-size:12px;color:#888">You can call the driver to coordinate the exact delivery time.</div>
      </div>` : '';

    const html = `
    <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;background:#FAFAF8">
      ${headerBlock('#1565C0', '🚚 Your Order is Out for Delivery!')}
      <div style="padding:32px;background:white;border:1px solid #E8E0D5;border-top:none;border-radius:0 0 10px 10px">
        <h2 style="color:#1A1A1A;margin-top:0">Hi ${order.customerName}, your tiles are on the way! 🚛</h2>
        <p style="color:#555;font-size:15px">Your order <strong>${orderId(order)}</strong> has been dispatched and is heading to your address.</p>

        <div style="background:#E3F2FD;padding:16px 20px;border-radius:8px;margin:20px 0;border:2px solid #1976D2">
          <strong style="color:#1565C0;font-size:16px">🚚 STATUS: OUT FOR DELIVERY</strong>
        </div>

        ${driverSection}

        <h3 style="color:#1565C0;border-bottom:2px solid #E8E0D5;padding-bottom:8px">Order & Charges Summary</h3>
        ${chargesTable(order)}
        <p style="font-size:13px;color:#555;margin-top:8px">Payment: <strong>${order.paymentMethod}</strong></p>

        <h3 style="color:#1565C0;border-bottom:2px solid #E8E0D5;padding-bottom:8px;margin-top:20px">Delivery Address</h3>
        ${addressBlock(order)}

        <div style="background:#E8F5E9;border-radius:8px;padding:14px 18px;margin-top:20px;font-size:14px">
          For any queries, call us at <strong>${shopPhone}</strong>
        </div>
        ${footerBlock(fromName, shopAddress, shopPhone)}
      </div>
    </div>`;

    await makeTransporter(cfg).sendMail({
      from: `"${fromName}" <${cfg.email_from}>`,
      to: order.email,
      subject: `🚚 Out for Delivery ${orderId(order)} | Tile House`,
      html,
    });
    console.log(`📧 Dispatch notification sent → ${order.email}`);
  } catch (err) {
    console.error('sendDispatchNotification error:', err.message);
  }
}

module.exports = { sendOrderConfirmation, sendOrderConfirmed, sendDispatchNotification };
