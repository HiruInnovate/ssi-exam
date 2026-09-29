import clientPromise from '@/lib/mongodb';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { email, password, role } = await req.json();

    if (!email || !password || !role) {
      return new Response(JSON.stringify({ error: 'Missing credentials' }), { status: 400 });
    }

    if (role === 'admin') {
      const adminEmail = 'admin@studysmart.com'; // Default admin email mapping
      
      if (email.toLowerCase() !== adminEmail.toLowerCase()) {
         return new Response(JSON.stringify({ error: 'Invalid admin credentials' }), { status: 401 });
      }

      const client = await clientPromise;
      const db = client.db(process.env.MONGODB_DB_NAME || 'ssi_portal');
      const settings = await db.collection('global_settings').findOne({ _id: 'global_settings' });

      let isMatch = false;

      if (settings && settings.adminPasswordHash) {
         // Use Database Hashed Password
         isMatch = await bcrypt.compare(password, settings.adminPasswordHash);
      } else {
         // Fallback to strict environment variable matching if database hasn't been configured yet
         const adminPasswordEnv = process.env.ADMIN_PASSWORD || 'admin';
         isMatch = (password === adminPasswordEnv);
      }

      if (isMatch) {
        const token = signToken({ email: adminEmail, role: 'admin' });
        // Set cookie
        const headers = new Headers();
        headers.append('Set-Cookie', `auth_token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict`);
        return new Response(JSON.stringify({ success: true, redirect: '/admin' }), { status: 200, headers });
      } else {
         return new Response(JSON.stringify({ error: 'Invalid admin credentials' }), { status: 401 });
      }
    } else if (role === 'student') {
      const client = await clientPromise;
      const db = client.db(process.env.MONGODB_DB_NAME || 'ssi_portal');
      
      // Case-insensitive email lookup
      const student = await db.collection('students').findOne({ 
        email: { $regex: new RegExp(`^${email.trim()}$`, "i") } 
      });

      if (!student) {
        return new Response(JSON.stringify({ error: 'Student not found' }), { status: 404 });
      }

      const isMatch = await bcrypt.compare(password, student.password);
      if (!isMatch) {
        return new Response(JSON.stringify({ error: 'Invalid password' }), { status: 401 });
      }

      const token = signToken({ id: student._id.toString(), email: student.email, name: student.name, role: 'student' });
      
      const headers = new Headers();
      headers.append('Set-Cookie', `auth_token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict`);
      return new Response(JSON.stringify({ success: true, redirect: '/dashboard' }), { status: 200, headers });
    }

    return new Response(JSON.stringify({ error: 'Invalid role' }), { status: 400 });

  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
