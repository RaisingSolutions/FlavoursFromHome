"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const superAdminMiddleware_1 = require("../middleware/superAdminMiddleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 username:
 *                   type: string
 *                 is_super_admin:
 *                   type: boolean
 *                 role:
 *                   type: string
 *                 message:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', adminController_1.loginAdmin);
/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all admin users
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of admin users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Admin'
 */
router.get('/users', adminController_1.getAllAdmins);
/**
 * @swagger
 * /api/admin/drivers:
 *   get:
 *     summary: Get all drivers
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of drivers
 */
router.get('/drivers', adminController_1.getDrivers);
/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     summary: Create new admin user (Super Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               is_super_admin:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Admin user created
 */
router.post('/users', superAdminMiddleware_1.requireSuperAdmin, adminController_1.createAdmin);
/**
 * @swagger
 * /api/admin/drivers:
 *   post:
 *     summary: Create new driver (Super Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Driver created
 */
router.post('/drivers', superAdminMiddleware_1.requireSuperAdmin, adminController_1.createDriver);
/**
 * @swagger
 * /api/admin/users/{id}/status:
 *   put:
 *     summary: Update admin user status (Super Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Admin status updated
 */
router.put('/users/:id/status', superAdminMiddleware_1.requireSuperAdmin, adminController_1.updateAdminStatus);
/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete admin user (Super Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Admin user deleted
 */
router.delete('/users/:id', superAdminMiddleware_1.requireSuperAdmin, adminController_1.deleteAdmin);
exports.default = router;
