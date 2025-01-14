import { Router } from 'express'
import { supabase } from '../config/supabase'

const router = Router()

router.get('/', async (req, res) => {
  try {
    // Test Supabase connection using our custom health check function
    const { data, error } = await supabase.rpc('check_health')
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: error ? 'error' : 'connected',
      database_status: data,
      error: error?.message,
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

export default router 