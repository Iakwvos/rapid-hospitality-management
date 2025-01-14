"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_1 = require("../config/supabase");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        // Test Supabase connection using our custom health check function
        const { data, error } = await supabase_1.supabase.rpc('check_health');
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            database: error ? 'error' : 'connected',
            database_status: data,
            error: error?.message,
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            database: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
exports.default = router;
