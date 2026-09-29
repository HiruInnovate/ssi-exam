import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import nodemailer from 'nodemailer';
import { requireAuth } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
export const maxDuration = 60; // Allow enough time for bulk sending

export async function POST(req) {
  try {
    const auth = await requireAuth(['admin']);
    if (auth.error) {
      return new Response(JSON.stringify({ error: auth.error }), { status: auth.status });
    }

    const { studentIds, subject, htmlBody } = await req.json();

    const settings = await getSettings();
    const transporter = nodemailer.createTransport({
      host: settings.smtp.host,
      port: parseInt(settings.smtp.port || '587'),
      auth: {
        user: settings.smtp.user,
        pass: settings.smtp.pass,
      },
    });

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return new Response(JSON.stringify({ error: 'Missing or invalid studentIds' }), { status: 400 });
    }
    if (!subject || !htmlBody) {
      return new Response(JSON.stringify({ error: 'Missing subject or htmlBody' }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'ssi_portal');

    // Convert string IDs to ObjectIds
    const objectIds = studentIds.map(id => new ObjectId(id));

    const students = await db.collection('students').find({ _id: { $in: objectIds } }).toArray();

    if (students.length === 0) {
      return new Response(JSON.stringify({ error: 'No valid students found.' }), { status: 404 });
    }

    let successCount = 0;
    let failCount = 0;
    const failedEmails = [];

    for (const student of students) {
      if (!student.email) {
        failCount++;
        failedEmails.push({ id: student._id, name: student.name, reason: 'No email found' });
        continue;
      }

      const personalizedBody = htmlBody.replace(/{{name}}/g, student.name);

      const mailOptions = {
        from: settings.smtp.from,
        to: student.email,
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px;">
            ${personalizedBody}
            <br/><br/>
            <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 20px 0;" />
            <p style="font-size: 12px; color: #888;">
              This is an automated message from <br/>
              <strong>Study Smart Innovations</strong><br/>
              Support Team
            </p>
          </div>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        successCount++;
      } catch (err) {
        console.error(`Failed to send email to ${student.email}:`, err);
        failCount++;
        failedEmails.push({ id: student._id, email: student.email, name: student.name, reason: 'SMTP delivery failed' });
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      successCount, 
      failCount,
      failedEmails,
      totalAttempted: students.length
    }), { status: 200 });

  } catch (error) {
    console.error('Send Bulk Mail API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
