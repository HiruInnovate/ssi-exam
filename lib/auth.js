import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';

export const signToken = (payload, expiresIn = '24h') => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export async function getUserFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return null;
  }

  return verifyToken(token);
}

export async function requireAuth(roles = []) {
  const user = await getUserFromCookie();

  if (!user) {
    return { error: 'Unauthorized', status: 401 };
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return { error: 'Forbidden', status: 403 };
  }

  return { user };
}
