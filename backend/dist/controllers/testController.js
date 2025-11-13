"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApiStatus = void 0;
const getApiStatus = (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API setup complete! Backend is working perfectly.',
        timestamp: new Date().toISOString()
    });
};
exports.getApiStatus = getApiStatus;
