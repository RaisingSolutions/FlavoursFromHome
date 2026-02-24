"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dealController_1 = require("../controllers/dealController");
const router = (0, express_1.Router)();
router.get('/', dealController_1.getAllDeals);
router.post('/', dealController_1.createDeal);
router.delete('/:id', dealController_1.deleteDeal);
exports.default = router;
