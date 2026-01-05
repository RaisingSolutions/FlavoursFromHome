"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updatePassword = exports.getUsers = exports.createUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const supabase_1 = require("../utils/supabase");
const createUser = async (req, res) => {
    try {
        const { username, password, name, role } = req.body;
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const { data, error } = await supabase_1.supabase
            .from('halfway_users')
            .insert({ username, password: hashedPassword, name, role })
            .select()
            .single();
        if (error)
            throw error;
        res.status(201).json(data);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create user' });
    }
};
exports.createUser = createUser;
const getUsers = async (req, res) => {
    try {
        const { data, error } = await supabase_1.supabase
            .from('halfway_users')
            .select('id, username, name, role, created_at')
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};
exports.getUsers = getUsers;
const updatePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const { error } = await supabase_1.supabase
            .from('halfway_users')
            .update({ password: hashedPassword })
            .eq('id', id);
        if (error)
            throw error;
        res.json({ message: 'Password updated' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update password' });
    }
};
exports.updatePassword = updatePassword;
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase_1.supabase
            .from('halfway_users')
            .delete()
            .eq('id', id);
        if (error)
            throw error;
        res.json({ message: 'User deleted' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
};
exports.deleteUser = deleteUser;
