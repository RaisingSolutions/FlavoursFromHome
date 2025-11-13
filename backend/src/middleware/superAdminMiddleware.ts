import { Request, Response, NextFunction } from 'express';
import { supabase } from '../utils/supabase';

// For now, we'll use a simple approach - in production you'd use JWT tokens
export const requireSuperAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get admin ID from request headers (you'd normally get this from JWT token)
    const adminId = req.headers['admin-id'];
    
    if (!adminId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if the admin is a super admin
    const { data, error } = await supabase
      .from('admin_users')
      .select('is_super_admin')
      .eq('id', adminId)
      .eq('is_active', true)
      .single();

    if (error || !data || !data.is_super_admin) {
      return res.status(403).json({ error: 'Super admin access required' });
    }

    next();
  } catch (err) {
    res.status(500).json({ error: 'Authorization check failed' });
  }
};