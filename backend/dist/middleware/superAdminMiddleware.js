"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.requireSuperAdmin = void 0;
const supabase_1 = require("../utils/supabase");
// For now, we'll use a simple approach - in production you'd use JWT tokens
const requireSuperAdmin = async (req, res, next) => {
    try {
        // Get admin ID from request headers (you'd normally get this from JWT token)
        const adminId = req.headers['admin-id'];
        if (!adminId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        // Check if the admin is a super admin
        const { data, error } = await supabase_1.supabase
            .from('admin_users')
            .select('is_super_admin, location')
            .eq('id', adminId)
            .eq('is_active', true)
            .single();
        if (error || !data || !data.is_super_admin) {
            return res.status(403).json({ error: 'Super admin access required' });
        }
        next();
    }
    catch (err) {
        res.status(500).json({ error: 'Authorization check failed' });
    }
};
exports.requireSuperAdmin = requireSuperAdmin;
const requireAdmin = async (req, res, next) => {
    try {
        const adminId = req.headers['admin-id'];
        if (!adminId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const { data, error } = await supabase_1.supabase
            .from('admin_users')
            .select('is_super_admin, role, location')
            .eq('id', adminId)
            .eq('is_active', true)
            .single();
        if (error || !data) {
            return res.status(403).json({ error: 'Admin access required' });
        }
        // Attach admin info to request for use in controllers
        req.admin = data;
        next();
    }
    catch (err) {
        res.status(500).json({ error: 'Authorization check failed' });
    }
};
exports.requireAdmin = requireAdmin;
