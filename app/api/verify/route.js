import clientPromise from '@/lib/mongodb';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const certId = searchParams.get('id');

    if (!certId) {
      return new Response(JSON.stringify({ valid: false, error: 'Certificate ID is required' }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'ssi_portal');

    const certConfig = await db.collection('issued_certificates').findOne({ certId: certId.toUpperCase() });

    if (!certConfig) {
      return new Response(JSON.stringify({ valid: false, error: 'Certificate not found in database.' }), { status: 404 });
    }

    return new Response(JSON.stringify({ 
       valid: true, 
       certificate: {
          name: certConfig.name,
          course: certConfig.course,
          issuedAt: certConfig.issuedAt,
          certId: certConfig.certId
       } 
    }), { status: 200 });

  } catch (error) {
    console.error('Verification Error:', error);
    return new Response(JSON.stringify({ valid: false, error: 'Internal Server Error' }), { status: 500 });
  }
}
