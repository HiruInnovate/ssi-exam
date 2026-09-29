import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import clientPromise from '@/lib/mongodb';
import { getSettings } from '@/lib/settings';

export async function POST(req) {
  try {
    const { name, phone, message } = await req.json();

    if (!name || !phone || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // 1. Persist to MongoDB
    const client = await clientPromise;
    const db = client.db();
    await db.collection('support_inquiries').insertOne({
      name,
      phone,
      message,
      timestamp: new Date()
    });

    // 2. Setup Nodemailer Transporter
    const settings = await getSettings();
    const transporter = nodemailer.createTransport({
      host: settings.smtp.host,
      port: parseInt(settings.smtp.port),
      secure: parseInt(settings.smtp.port) === 465, // true for 465, false for 587
      auth: {
        user: settings.smtp.user,
        pass: settings.smtp.pass,
      },
    });

    // 3. Send Email
    const mailOptions = {
      from: settings.smtp.from,
      to: 'ssicommunityadmin@onlinestudysmart.com',
      subject: `New Support Inquiry from ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; color: #1e293b;">
          <h2 style="color: #10b981; margin-top: 0;">New Support Request</h2>
          <p>You have received a new inquiry from the SSI Exam Portal contact form.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Message:</strong></p>
          <div style="background-color: #f8fafc; padding: 16px; border-radius: 4px; white-space: pre-wrap;">${message}</div>
          
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b;">This message was generated automatically by the SSI Portal Support System.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: 'Your message has been sent successfully.' });

  } catch (err) {
    console.error('Support API Error:', err);
    return NextResponse.json({ error: 'Failed to process inquiry. Please try again later.' }, { status: 500 });
  }
}
