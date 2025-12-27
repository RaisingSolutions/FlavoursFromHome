import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { supabase } from '../utils/supabase';

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const { data: user, error } = await supabase
      .from('halfway_users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};
