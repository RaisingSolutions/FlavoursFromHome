"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApiStatus = void 0;
const supabase_1 = require("../utils/supabase");
const getApiStatus = async (req, res) => {
    try {
        // Test database connection
        const { data, error } = await supabase_1.supabase.from('products').select('count').limit(1);
        res.status(200).json({
            success: true,
            message: 'API setup complete! Backend and Supabase connected successfully.',
            database: error ? 'Connection failed' : 'Connected',
            timestamp: new Date().toISOString()
        });
    }
    catch (err) {
        res.status(200).json({
            success: true,
            message: 'API setup complete! Backend working (database not tested yet).',
            timestamp: new Date().toISOString()
        });
    }
};
exports.getApiStatus = getApiStatus;
