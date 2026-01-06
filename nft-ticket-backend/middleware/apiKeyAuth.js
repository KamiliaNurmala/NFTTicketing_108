const Developer = require('../models/Developer');
const ApiUsageLog = require('../models/ApiUsageLog');

const apiKeyAuth = async (req, res, next) => {
    const startTime = Date.now();

    try {
        const apiKey = req.headers['x-api-key'];

        if (!apiKey) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'MISSING_API_KEY',
                    message: 'X-API-Key header is required'
                }
            });
        }

        // Find developer by API key
        const developer = await Developer.findOne({ where: { apiKey } });

        if (!developer) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_API_KEY',
                    message: 'Invalid API key'
                }
            });
        }

        // Check if account is active
        if (!developer.isActive) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'ACCOUNT_DISABLED',
                    message: 'Developer account has been disabled'
                }
            });
        }

        // Check rate limit
        if (!developer.checkRateLimit()) {
            return res.status(429).json({
                success: false,
                error: {
                    code: 'RATE_LIMIT_EXCEEDED',
                    message: `Rate limit exceeded. Your limit is ${developer.requestLimit} requests per day.`
                }
            });
        }

        // Increment request count
        await developer.incrementRequestCount();

        // Attach developer to request
        req.developer = developer;
        req.apiStartTime = startTime;

        // Log usage after response
        res.on('finish', async () => {
            try {
                await ApiUsageLog.create({
                    developerId: developer.id,
                    endpoint: req.originalUrl,
                    method: req.method,
                    statusCode: res.statusCode,
                    responseTime: Date.now() - startTime,
                    ipAddress: req.ip || req.connection.remoteAddress
                });
            } catch (logError) {
                console.error('Failed to log API usage:', logError);
            }
        });

        next();
    } catch (error) {
        console.error('API Key auth error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Authentication failed'
            }
        });
    }
};

module.exports = apiKeyAuth;
