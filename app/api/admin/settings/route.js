import { requireAuth } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { getSettings } from '@/lib/settings';
import bcrypt from 'bcryptjs';

export async function GET(req) {
  try {
    const auth = await requireAuth(['admin']);
    if (auth.error) {
       return new Response(JSON.stringify({ error: auth.error }), { status: auth.status });
    }

    const settings = await getSettings();
    
    // Do not return actual password hash to client, just indicator if it's set
    return new Response(JSON.stringify({
      smtp: settings.smtp,
      hasDbPassword: !!settings.adminPasswordHash
    }), { status: 200 });

  } catch (error) {
    console.error('Settings GET API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const auth = await requireAuth(['admin']);
    if (auth.error) {
       return new Response(JSON.stringify({ error: auth.error }), { status: auth.status });
    }

    const body = await req.json();
    const { smtp, newAdminPassword } = body;

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'ssi_portal');

    const updateDoc = {};

    if (smtp) {
       updateDoc.smtp = {
          host: smtp.host || '',
          port: smtp.port || '587',
          user: smtp.user || '',
          pass: smtp.pass || '',
          from: smtp.from || ''
       };
    }

    if (newAdminPassword && newAdminPassword.trim() !== '') {
       updateDoc.adminPasswordHash = await bcrypt.hash(newAdminPassword, 10);
    }

    if (Object.keys(updateDoc).length > 0) {
       await db.collection('global_settings').updateOne(
          { _id: 'global_settings' },
          { $set: updateDoc },
          { upsert: true }
       );
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    console.error('Settings POST API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
