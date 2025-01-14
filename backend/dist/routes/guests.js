"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supabase_1 = require("../config/supabase");
const router = express_1.default.Router();
/**
 * @swagger
 * /api/guests:
 *   get:
 *     summary: Get all guests
 *     description: Retrieve a list of all guests
 *     tags: [Guests]
 *     responses:
 *       200:
 *         description: A list of guests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Guest'
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
    try {
        const { data: guests, error } = await supabase_1.supabase
            .from('guests')
            .select('*');
        if (error)
            throw error;
        res.json({
            success: true,
            count: guests.length,
            data: guests
        });
    }
    catch (error) {
        console.error('Error fetching guests:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch guests'
        });
    }
});
/**
 * @swagger
 * /api/guests/{id}:
 *   get:
 *     summary: Get a guest by ID
 *     description: Retrieve a guest by their ID
 *     tags: [Guests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The guest ID
 *     responses:
 *       200:
 *         description: Guest details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Guest'
 *       404:
 *         description: Guest not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data: guest, error } = await supabase_1.supabase
            .from('guests')
            .select('*')
            .eq('id', id)
            .single();
        if (error)
            throw error;
        if (!guest) {
            return res.status(404).json({
                success: false,
                error: 'Guest not found'
            });
        }
        res.json({
            success: true,
            data: guest
        });
    }
    catch (error) {
        console.error('Error fetching guest:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch guest'
        });
    }
});
/**
 * @swagger
 * /api/guests:
 *   post:
 *     summary: Create a new guest
 *     description: Create a new guest with the provided information
 *     tags: [Guests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *               - email
 *               - phone
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               preferences:
 *                 type: object
 *                 properties:
 *                   room_type:
 *                     type: array
 *                     items:
 *                       type: string
 *                   special_requests:
 *                     type: array
 *                     items:
 *                       type: string
 *                   dietary_restrictions:
 *                     type: array
 *                     items:
 *                       type: string
 *     responses:
 *       201:
 *         description: Guest created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Guest'
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Server error
 */
router.post('/', async (req, res) => {
    try {
        const { first_name, last_name, email, phone, address, preferences } = req.body;
        // Validate required fields
        if (!first_name || !last_name || !email || !phone) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }
        const { data: guest, error } = await supabase_1.supabase
            .from('guests')
            .insert([
            {
                first_name,
                last_name,
                email,
                phone,
                address,
                preferences
            }
        ])
            .select()
            .single();
        if (error)
            throw error;
        res.status(201).json({
            success: true,
            data: guest
        });
    }
    catch (error) {
        console.error('Error creating guest:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create guest'
        });
    }
});
exports.default = router;
