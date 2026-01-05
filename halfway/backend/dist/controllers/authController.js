"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const supabase_1 = require("../utils/supabase");
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const { data: user, error } = await supabase_1.supabase
            .from('halfway_users')
            .select('*')
            .eq('username', username)
            .single();
        if (error || !user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const validPassword = await bcrypt_1.default.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        res.json({
            id: user.id,
            username: user.username,
            role: user.role,
            name: user.name
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
};
exports.login = login;
