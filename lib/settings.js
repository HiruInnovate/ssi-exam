import clientPromise from './mongodb';

export async function getSettings() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'ssi_portal');
    
    const settings = await db.collection('global_settings').findOne({ _id: 'global_settings' });

    // Fallback to environment variables if settings don't exist yet
    const smtpFallback = {
      host: process.env.SMTP_HOST || '',
      port: process.env.SMTP_PORT || '587',
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
      from: process.env.SMTP_FROM || ''
    };

    return {
      adminPasswordHash: settings?.adminPasswordHash || null,
      smtp: {
        host: settings?.smtp?.host || smtpFallback.host,
        port: settings?.smtp?.port || smtpFallback.port,
        user: settings?.smtp?.user || smtpFallback.user,
        pass: settings?.smtp?.pass || smtpFallback.pass,
        from: settings?.smtp?.from || smtpFallback.from
      },
    };
  } catch (error) {
    console.error('Error fetching global settings:', error);
    return {
      adminPasswordHash: null,
      smtp: {
        host: process.env.SMTP_HOST || '',
        port: process.env.SMTP_PORT || '587',
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
        from: process.env.SMTP_FROM || ''
      }
    };
  }
}
