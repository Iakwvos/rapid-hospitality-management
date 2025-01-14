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
 * /api/rooms:
 *   get:
 *     summary: Get all rooms
 *     description: Retrieve a list of all rooms
 *     tags: [Rooms]
 *     responses:
 *       200:
 *         description: A list of rooms
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
 *                     $ref: '#/components/schemas/Room'
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
    try {
        const { data: rooms, error } = await supabase_1.supabase
            .from('rooms')
            .select('*');
        if (error)
            throw error;
        res.json({
            success: true,
            count: rooms.length,
            data: rooms
        });
    }
    catch (error) {
        console.error('Error fetching rooms:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch rooms'
        });
    }
});
/**
 * @swagger
 * /api/rooms/{id}:
 *   get:
 *     summary: Get a room by ID
 *     description: Retrieve a room by its ID
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The room ID
 *     responses:
 *       200:
 *         description: Room details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Room'
 *       404:
 *         description: Room not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data: room, error } = await supabase_1.supabase
            .from('rooms')
            .select('*')
            .eq('id', id)
            .single();
        if (error)
            throw error;
        if (!room) {
            return res.status(404).json({
                success: false,
                error: 'Room not found'
            });
        }
        res.json({
            success: true,
            data: room
        });
    }
    catch (error) {
        console.error('Error fetching room:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch room'
        });
    }
});
exports.default = router;
