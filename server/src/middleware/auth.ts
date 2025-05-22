import { Request, Response, NextFunction } from 'express';
import { getAuth } from 'firebase-admin/auth';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email: string;
  };
}

export const authenticateUser = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  console.log('Auth headers:', req.headers.authorization);
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    console.error('No Bearer token found in headers');
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const token = authHeader.split('Bearer ')[1];
  console.log('Verifying token...');
  getAuth()
    .verifyIdToken(token)
    .then((decodedToken) => {
      console.log('Token verified for user:', decodedToken.email);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email || ''
      };
      next();
    })
    .catch((error) => {
      console.error('Error verifying token:', error);
      res.status(401).json({ error: 'Invalid token' });
    });
}; 