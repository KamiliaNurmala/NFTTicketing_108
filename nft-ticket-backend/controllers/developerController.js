const Developer = require('../models/Developer');
const jwt = require('jsonwebtoken');

const developerController = {
    // Register developer
    async register(req, res) {
        try {
            const { name, email, password } = req.body;

            // Validate input
            if (!name || !email || !password) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'MISSING_FIELDS',
                        message: 'Name, email, and password are required'
                    }
                });
            }

            // Check if email already exists
            const existingDev = await Developer.findOne({ where: { email } });
            if (existingDev) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'EMAIL_EXISTS',
                        message: 'Email already registered'
                    }
                });
            }

            // Create developer (API key auto-generated in hook)
            const developer = await Developer.create({ name, email, password });

            res.status(201).json({
                success: true,
                data: {
                    message: 'Registration successful. Please login to get your API key.',
                    developer: {
                        id: developer.id,
                        name: developer.name,
                        email: developer.email
                    }
                }
            });
        } catch (error) {
            console.error('Developer register error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Internal server error'
                }
            });
        }
    },

    // Developer login
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Validate input
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'MISSING_FIELDS',
                        message: 'Email and password are required'
                    }
                });
            }

            // Find developer
            const developer = await Developer.findOne({ where: { email } });
            if (!developer) {
                return res.status(401).json({
                    success: false,
                    error: {
                        code: 'INVALID_CREDENTIALS',
                        message: 'Invalid email or password'
                    }
                });
            }

            // Check if active
            if (!developer.isActive) {
                return res.status(403).json({
                    success: false,
                    error: {
                        code: 'ACCOUNT_DISABLED',
                        message: 'Your account has been disabled'
                    }
                });
            }

            // Validate password
            const isValid = await developer.validatePassword(password);
            if (!isValid) {
                return res.status(401).json({
                    success: false,
                    error: {
                        code: 'INVALID_CREDENTIALS',
                        message: 'Invalid email or password'
                    }
                });
            }

            // Generate JWT
            const token = jwt.sign(
                { id: developer.id, email: developer.email, role: 'developer' },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.json({
                success: true,
                data: {
                    token,
                    developer: {
                        id: developer.id,
                        name: developer.name,
                        email: developer.email,
                        apiKey: developer.apiKey,
                        tier: developer.tier,
                        requestLimit: developer.requestLimit,
                        requestCount: developer.requestCount
                    }
                }
            });
        } catch (error) {
            console.error('Developer login error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Internal server error'
                }
            });
        }
    },

    // Get developer profile (including API key)
    async getProfile(req, res) {
        try {
            const developer = await Developer.findByPk(req.developer.id);

            if (!developer) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Developer not found'
                    }
                });
            }

            res.json({
                success: true,
                data: {
                    developer: {
                        id: developer.id,
                        name: developer.name,
                        email: developer.email,
                        apiKey: developer.apiKey,
                        tier: developer.tier,
                        requestLimit: developer.requestLimit,
                        requestCount: developer.requestCount,
                        createdAt: developer.createdAt
                    }
                }
            });
        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Internal server error'
                }
            });
        }
    },

    // Regenerate API key
    async regenerateKey(req, res) {
        try {
            const developer = await Developer.findByPk(req.developer.id);

            if (!developer) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Developer not found'
                    }
                });
            }

            const newApiKey = developer.regenerateApiKey();
            await developer.save();

            res.json({
                success: true,
                data: {
                    message: 'API key regenerated successfully',
                    apiKey: newApiKey
                }
            });
        } catch (error) {
            console.error('Regenerate key error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Internal server error'
                }
            });
        }
    },

    // Get usage statistics
    async getUsage(req, res) {
        try {
            const ApiUsageLog = require('../models/ApiUsageLog');
            const developer = await Developer.findByPk(req.developer.id);

            // Get recent logs
            const logs = await ApiUsageLog.findAll({
                where: { developerId: req.developer.id },
                limit: 50,
                order: [['createdAt', 'DESC']]
            });

            // Calculate stats
            const today = new Date().toISOString().split('T')[0];
            const todayLogs = logs.filter(log =>
                log.createdAt.toISOString().split('T')[0] === today
            );

            res.json({
                success: true,
                data: {
                    usage: {
                        tier: developer.tier,
                        requestLimit: developer.requestLimit,
                        requestsToday: developer.requestCount,
                        remainingToday: Math.max(0, developer.requestLimit - developer.requestCount)
                    },
                    recentRequests: logs.slice(0, 10).map(log => ({
                        endpoint: log.endpoint,
                        method: log.method,
                        statusCode: log.statusCode,
                        responseTime: log.responseTime,
                        timestamp: log.createdAt
                    }))
                }
            });
        } catch (error) {
            console.error('Get usage error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Internal server error'
                }
            });
        }
    }
};

module.exports = developerController;
