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
 * /api/reservations:
 *   get:
 *     summary: Get all reservations
 *     description: Retrieve a list of all reservations with room and guest details
 *     tags: [Reservations]
 *     responses:
 *       200:
 *         description: A list of reservations
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
 *                     $ref: '#/components/schemas/Reservation'
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
    try {
        const { data: reservations, error } = await supabase_1.supabase
            .from('reservations')
            .select(`
        *,
        room:rooms(*),
        guest:guests(*)
      `);
        if (error)
            throw error;
        res.json({
            success: true,
            count: reservations.length,
            data: reservations
        });
    }
    catch (error) {
        console.error('Error fetching reservations:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch reservations'
        });
    }
});
/**
 * @swagger
 * /api/reservations/{id}:
 *   get:
 *     summary: Get a reservation by ID
 *     description: Retrieve a reservation by its ID with room and guest details
 *     tags: [Reservations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The reservation ID
 *     responses:
 *       200:
 *         description: Reservation details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Reservation'
 *       404:
 *         description: Reservation not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data: reservation, error } = await supabase_1.supabase
            .from('reservations')
            .select(`
        *,
        room:rooms(*),
        guest:guests(*)
      `)
            .eq('id', id)
            .single();
        if (error)
            throw error;
        if (!reservation) {
            return res.status(404).json({
                success: false,
                error: 'Reservation not found'
            });
        }
        res.json({
            success: true,
            data: reservation
        });
    }
    catch (error) {
        console.error('Error fetching reservation:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch reservation'
        });
    }
});
/**
 * @swagger
 * /api/reservations:
 *   post:
 *     summary: Create a new reservation
 *     tags: [Reservations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - guest_id
 *               - room_id
 *               - check_in
 *               - check_out
 *               - number_of_guests
 *             properties:
 *               guest_id:
 *                 type: string
 *               room_id:
 *                 type: string
 *               check_in:
 *                 type: string
 *                 format: date-time
 *               check_out:
 *                 type: string
 *                 format: date-time
 *               number_of_guests:
 *                 type: number
 *               special_requests:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [confirmed, cancelled, checked_in, checked_out]
 *               payment_status:
 *                 type: string
 *                 enum: [pending, paid]
 *               payment_method:
 *                 type: string
 *                 enum: [credit_card, bank_transfer, cash]
 *               total_price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Reservation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Reservation'
 */
router.post('/', async (req, res) => {
    try {
        const { data, error } = await supabase_1.supabase
            .from('reservations')
            .insert([req.body])
            .select('*, room:rooms(*), guest:guests(*)')
            .single();
        if (error) {
            console.error('Error creating reservation:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to create reservation'
            });
        }
        return res.status(201).json({
            success: true,
            data
        });
    }
    catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
/**
 * @swagger
 * /api/reservations/{id}:
 *   put:
 *     summary: Update a reservation
 *     tags: [Reservations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reservation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [confirmed, checked_in, checked_out, cancelled]
 *               payment_status:
 *                 type: string
 *                 enum: [pending, paid, refunded]
 *               check_in:
 *                 type: string
 *                 format: date-time
 *               check_out:
 *                 type: string
 *                 format: date-time
 *               special_requests:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reservation updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Reservation'
 *       404:
 *         description: Reservation not found
 *       500:
 *         description: Server error
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, payment_status, check_in, check_out, special_requests } = req.body;
        const { data: existingReservation, error: fetchError } = await supabase_1.supabase
            .from('reservations')
            .select()
            .eq('id', id)
            .single();
        if (fetchError || !existingReservation) {
            return res.status(404).json({
                success: false,
                error: 'Reservation not found'
            });
        }
        const { data: updatedReservation, error: updateError } = await supabase_1.supabase
            .from('reservations')
            .update({
            status,
            payment_status,
            check_in,
            check_out,
            special_requests,
            updated_at: new Date().toISOString()
        })
            .eq('id', id)
            .select(`
        *,
        room:rooms(*),
        guest:guests(*)
      `)
            .single();
        if (updateError) {
            console.error('Error updating reservation:', updateError);
            return res.status(500).json({
                success: false,
                error: 'Failed to update reservation'
            });
        }
        return res.json({
            success: true,
            data: updatedReservation
        });
    }
    catch (err) {
        console.error('Error in PUT /api/reservations/:id:', err);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
exports.default = router;
