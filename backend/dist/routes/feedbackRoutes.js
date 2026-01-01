"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const feedbackController_1 = require("../controllers/feedbackController");
const router = (0, express_1.Router)();
router.get('/order/:orderId', feedbackController_1.getOrderForFeedback);
router.post('/submit', feedbackController_1.submitFeedback);
router.get('/all', feedbackController_1.getAllFeedbacks);
exports.default = router;
