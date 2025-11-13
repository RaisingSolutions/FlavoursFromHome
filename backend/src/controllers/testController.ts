import { Request, Response } from 'express';

export const getApiStatus = (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'API setup complete! Backend is working perfectly.',
    timestamp: new Date().toISOString()
  });
};