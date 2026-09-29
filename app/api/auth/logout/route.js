export async function POST() {
  const headers = new Headers();
  headers.append('Set-Cookie', `auth_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict`);
  return new Response(JSON.stringify({ success: true }), { status: 200, headers });
}
