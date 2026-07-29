// Vercel Serverless Function — POST /api/contact
// Validates the incoming brief and sends it to your inbox via Resend.
// Requires RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL as
// environment variables (set these in the Vercel project dashboard).

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ''));
}

function isValidMobile(value) {
  return /^[0-9+()\-\s]{7,16}$/.test(String(value || ''));
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const { name, mobile, email, constituency, message, website } = req.body || {};

    // Honeypot — bots fill every field, real visitors never see this one.
    // Return a normal-looking success without sending anything.
    if (website) {
      return res.status(200).json({ ok: true });
    }

    if (!name || !mobile || !email || !constituency || !message) {
      return res.status(400).json({ ok: false, error: 'Missing required fields' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ ok: false, error: 'Invalid email address' });
    }
    if (!isValidMobile(mobile)) {
      return res.status(400).json({ ok: false, error: 'Invalid mobile number' });
    }
    if (String(message).length > 600) {
      return res.status(400).json({ ok: false, error: 'Message too long' });
    }

    if (!process.env.RESEND_API_KEY || !process.env.CONTACT_TO_EMAIL || !process.env.CONTACT_FROM_EMAIL) {
      console.error('Missing Resend environment variables.');
      return res.status(500).json({ ok: false, error: 'Server is not configured' });
    }

    await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL,       // e.g. "AERRA AXIS <brief@yourdomain.com>"
      to: process.env.CONTACT_TO_EMAIL,            // e.g. "info@aerraaxis.com"
      replyTo: email,
      subject: `New brief from ${name} — ${constituency}`,
      text:
        `Full Name: ${name}\n` +
        `Mobile Number: ${mobile}\n` +
        `Email Address: ${email}\n` +
        `Constituency and State: ${constituency}\n\n` +
        `Lay of the land:\n${message}`,
      html:
        `<p><strong>Full Name:</strong> ${escapeHtml(name)}</p>` +
        `<p><strong>Mobile Number:</strong> ${escapeHtml(mobile)}</p>` +
        `<p><strong>Email Address:</strong> ${escapeHtml(email)}</p>` +
        `<p><strong>Constituency and State:</strong> ${escapeHtml(constituency)}</p>` +
        `<p><strong>Lay of the land:</strong><br>${escapeHtml(message).replace(/\n/g, '<br>')}</p>`,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Contact form error:', err);
    return res.status(500).json({ ok: false, error: 'Server error, please try again later' });
  }
}
