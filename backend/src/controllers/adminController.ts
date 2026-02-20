import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { supabase } from '../utils/supabase';

export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, data.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({
      id: data.id,
      username: data.username,
      is_super_admin: data.is_super_admin,
      role: data.role || 'admin',
      location: data.location,
      discount_code: data.discount_code || null,
      discount_percentage: data.discount_percentage || null,
      message: 'Login successful'
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

export const getAllAdmins = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, username, is_active, is_super_admin, location, role, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch admin users' });
  }
};

export const createAdmin = async (req: Request, res: Response) => {
  try {
    const { username, password, is_super_admin, location } = req.body;

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const { data, error } = await supabase
      .from('admin_users')
      .insert({
        username,
        password_hash,
        is_super_admin: is_super_admin || false,
        location: is_super_admin ? null : location // Super admin has no location
      })
      .select('id, username, is_active, is_super_admin, location, created_at')
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create admin user' });
  }
};

export const updateAdminStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const { data, error } = await supabase
      .from('admin_users')
      .update({
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('id, username, is_active, is_super_admin')
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update admin status' });
  }
};

export const deleteAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Admin user deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete admin user' });
  }
};

export const getDrivers = async (req: Request, res: Response) => {
  try {
    const location = req.query.location as string;
    
    let query = supabase
      .from('admin_users')
      .select('id, username')
      .eq('is_active', true)
      .eq('role', 'driver');
    
    // Filter by location if specified
    if (location) {
      query = query.eq('location', location);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch drivers' });
  }
};

export const createPartner = async (req: Request, res: Response) => {
  try {
    const { username, password, discount_code, discount_percentage } = req.body;

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const { data, error } = await supabase
      .from('admin_users')
      .insert({
        username,
        password_hash,
        is_super_admin: false,
        role: 'partner',
        discount_code,
        discount_percentage
      })
      .select('id, username, discount_code, discount_percentage, created_at')
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create partner' });
  }
};

export const getPartners = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, username, discount_code, discount_percentage, is_active, created_at')
      .eq('role', 'partner')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch partners' });
  }
};

export const getPartnerOrders = async (req: Request, res: Response) => {
  try {
    const partnerId = req.headers['admin-id'];
    
    // Get partner's discount code
    const { data: partner, error: partnerError } = await supabase
      .from('admin_users')
      .select('discount_code')
      .eq('id', partnerId)
      .eq('role', 'partner')
      .single();

    if (partnerError || !partner) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    // Get orders using this partner's discount code
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id, 
        total_amount, 
        discount_amount, 
        created_at,
        order_items (
          quantity,
          products (
            name
          )
        )
      `)
      .eq('discount_code', partner.discount_code)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Format the response to match frontend expectations
    const formattedOrders = data.map(order => ({
      ...order,
      items: order.order_items.map((item: any) => ({
        product_name: item.products.name,
        quantity: item.quantity
      }))
    }));

    res.json(formattedOrders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch partner orders' });
  }
};

export const createDriver = async (req: Request, res: Response) => {
  try {
    const { username, password, location } = req.body;
    const admin = (req as any).admin;

    const driverLocation = admin.is_super_admin ? location : admin.location;

    if (!driverLocation) {
      return res.status(400).json({ error: 'Location is required' });
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const { data, error } = await supabase
      .from('admin_users')
      .insert({
        username,
        password_hash,
        is_super_admin: false,
        role: 'driver',
        location: driverLocation
      })
      .select('id, username, is_active, role, location, created_at')
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create driver' });
  }
};

export const validateDiscountCode = async (req: Request, res: Response) => {
  try {
    const { discount_code } = req.body;

    const { data, error } = await supabase
      .from('admin_users')
      .select('discount_code, discount_percentage')
      .eq('discount_code', discount_code)
      .eq('role', 'partner')
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Invalid discount code' });
    }

    res.json({
      valid: true,
      discount_percentage: data.discount_percentage
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to validate discount code' });
  }
};