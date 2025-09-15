import { Router } from 'express';
import { logger } from '../utils/logger';
import { healthCheck } from '../utils/database';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const dbHealth = await healthCheck();

    res.status(200).json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        connected: dbHealth,
        status: dbHealth ? 'healthy' : 'unhealthy'
      }
    });
  } catch (error) {
    logger.error('Health check failed', { error });
    res.status(503).json({
      success: false,
      message: 'Service unavailable',
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        status: 'unhealthy'
      }
    });
  }
});

router.get('/detailed', async (req, res) => {
  logger.info('Detailed health check requested', { userAgent: req.get('User-Agent') });

  try {
    const dbHealth = await healthCheck();
    const startTime = Date.now();

    // Test database query performance
    await healthCheck();
    const dbResponseTime = Date.now() - startTime;

    res.status(200).json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      environment: process.env.NODE_ENV || 'development',
      version: process.version,
      platform: process.platform,
      database: {
        connected: dbHealth,
        status: dbHealth ? 'healthy' : 'unhealthy',
        responseTime: `${dbResponseTime}ms`
      },
      services: {
        database: dbHealth ? 'operational' : 'down'
      }
    });
  } catch (error) {
    logger.error('Detailed health check failed', { error });
    res.status(503).json({
      success: false,
      message: 'Service unavailable',
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      services: {
        database: 'down'
      }
    });
  }
});

router.get('/database', async (req, res) => {
  try {
    const dbHealth = await healthCheck();

    if (dbHealth) {
      res.status(200).json({
        success: true,
        message: 'Database connection is healthy',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        success: false,
        message: 'Database connection is unhealthy',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    logger.error('Database health check failed', { error });
    res.status(503).json({
      success: false,
      message: 'Database health check failed',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;