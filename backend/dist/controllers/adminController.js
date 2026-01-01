"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDriver = exports.getDrivers = exports.deleteAdmin = exports.updateAdminStatus = exports.createAdmin = exports.getAllAdmins = exports.loginAdmin = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const supabase_1 = require("../utils/supabase");
const loginAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const { data, error } = await supabase_1.supabase
            .from('admin_users')
            .select('*')
            .eq('username', username)
            .eq('is_active', true)
            .single();
        if (error || !data) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const isValidPassword = await bcrypt_1.default.compare(password, data.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        res.json({
            id: data.id,
            username: data.username,
            is_super_admin: data.is_super_admin,
            role: data.role || 'admin',
            message: 'Login successful'
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
};
exports.loginAdmin = loginAdmin;
const getAllAdmins = async (req, res) => {
    try {
        const { data, error } = await supabase_1.supabase
            .from('admin_users')
            .select('id, username, is_active, is_super_admin, created_at')
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch admin users' });
    }
};
exports.getAllAdmins = getAllAdmins;
const createAdmin = async (req, res) => {
    try {
        const { username, password, is_super_admin } = req.body;
        const saltRounds = 10;
        const password_hash = await bcrypt_1.default.hash(password, saltRounds);
        const { data, error } = await supabase_1.supabase
            .from('admin_users')
            .insert({
            username,
            password_hash,
            is_super_admin: is_super_admin || false
        })
            .select('id, username, is_active, is_super_admin, created_at')
            .single();
        if (error)
            throw error;
        res.status(201).json(data);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to create admin user' });
    }
};
exports.createAdmin = createAdmin;
const updateAdminStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;
        const { data, error } = await supabase_1.supabase
            .from('admin_users')
            .update({
            is_active,
            updated_at: new Date().toISOString()
        })
            .eq('id', id)
            .select('id, username, is_active, is_super_admin')
            .single();
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to update admin status' });
    }
};
exports.updateAdminStatus = updateAdminStatus;
const deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase_1.supabase
            .from('admin_users')
            .delete()
            .eq('id', id);
        if (error)
            throw error;
        res.json({ message: 'Admin user deleted successfully' });
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to delete admin user' });
    }
};
exports.deleteAdmin = deleteAdmin;
const getDrivers = async (req, res) => {
    try {
        const { data, error } = await supabase_1.supabase
            .from('admin_users')
            .select('id, username')
            .eq('is_active', true)
            .eq('role', 'driver');
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch drivers' });
    }
};
exports.getDrivers = getDrivers;
const createDriver = async (req, res) => {
    try {
        const { username, password } = req.body;
        const saltRounds = 10;
        const password_hash = await bcrypt_1.default.hash(password, saltRounds);
        const { data, error } = await supabase_1.supabase
            .from('admin_users')
            .insert({
            username,
            password_hash,
            is_super_admin: false,
            role: 'driver'
        })
            .select('id, username, is_active, role, created_at')
            .single();
        if (error)
            throw error;
        res.status(201).json(data);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to create driver' });
    }
};
exports.createDriver = createDriver;
