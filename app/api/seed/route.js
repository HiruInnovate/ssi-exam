import clientPromise from '@/lib/mongodb';

export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'ssi_portal');
    
    // Check if empty
    const count = await db.collection('courses').countDocuments();
    if (count > 0) return new Response(JSON.stringify({ message: 'Already seeded' }), { status: 200 });

    const courses = [
      {
        title: 'Python Online Course',
        description: 'Comprehensive Python programming course for all levels.',
        razorpayLink: 'https://pages.razorpay.com/python-online-course',
        createdAt: new Date()
      },
      {
        title: 'C Programming (Bangla)',
        description: 'Learn C Programming language from scratch in Bangla.',
        razorpayLink: 'https://pages.razorpay.com/c-programming-course-in-bangla',
        createdAt: new Date()
      },
      {
        title: 'Java Online Course',
        description: 'Master Java development and build enterprise applications.',
        razorpayLink: 'https://pages.razorpay.com/java-online-course',
        createdAt: new Date()
      }
    ];

    await db.collection('courses').insertMany(courses);
    return new Response(JSON.stringify({ success: true, message: 'Seeded' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
