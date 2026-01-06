const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

const adminController = {
    // Admin register
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

            // Check if admin already exists
            const existingAdmin = await Admin.findOne({ where: { email } });
            if (existingAdmin) {
                return res.status(409).json({
                    success: false,
                    error: {
                        code: 'EMAIL_EXISTS',
                        message: 'Admin with this email already exists'
                    }
                });
            }

            // Create admin (password will be hashed by model hook)
            const admin = await Admin.create({ name, email, password });

            // Generate JWT
            const token = jwt.sign(
                { id: admin.id, email: admin.email, role: 'admin' },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.status(201).json({
                success: true,
                data: {
                    token,
                    admin: {
                        id: admin.id,
                        name: admin.name,
                        email: admin.email
                    }
                }
            });
        } catch (error) {
            console.error('Admin register error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Internal server error'
                }
            });
        }
    },

    // Admin login
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

            // Find admin
            const admin = await Admin.findOne({ where: { email } });
            if (!admin) {
                return res.status(401).json({
                    success: false,
                    error: {
                        code: 'INVALID_CREDENTIALS',
                        message: 'Invalid email or password'
                    }
                });
            }

            // Validate password
            const isValid = await admin.validatePassword(password);
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
                { id: admin.id, email: admin.email, role: 'admin' },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                success: true,
                data: {
                    token,
                    admin: {
                        id: admin.id,
                        name: admin.name,
                        email: admin.email
                    }
                }
            });
        } catch (error) {
            console.error('Admin login error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Internal server error'
                }
            });
        }
    },

    // Get all events (admin view)
    async getEvents(req, res) {
        try {
            const Event = require('../models/Event');
            const events = await Event.findAll({
                order: [['createdAt', 'DESC']]
            });

            res.json({
                success: true,
                data: { events }
            });
        } catch (error) {
            console.error('Get events error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to fetch events'
                }
            });
        }
    },

    // Create event
    async createEvent(req, res) {
        try {
            const Event = require('../models/Event');
            const { title, description, date, venue, totalTickets, price } = req.body;

            // Validate required fields
            if (!title || !date || !venue || !totalTickets || !price) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'MISSING_FIELDS',
                        message: 'Title, date, venue, totalTickets, and price are required'
                    }
                });
            }

            const event = await Event.create({
                title,
                description,
                date,
                venue,
                totalTickets,
                availableTickets: totalTickets,
                price
            });

            res.status(201).json({
                success: true,
                data: { event }
            });
        } catch (error) {
            console.error('Create event error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to create event'
                }
            });
        }
    },

    // Update event
    async updateEvent(req, res) {
        try {
            const Event = require('../models/Event');
            const { id } = req.params;
            const { title, description, date, venue, totalTickets, price } = req.body;

            const event = await Event.findByPk(id);
            if (!event) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Event not found'
                    }
                });
            }

            // Calculate available tickets adjustment
            if (totalTickets) {
                const ticketDiff = totalTickets - event.totalTickets;
                event.availableTickets = Math.max(0, event.availableTickets + ticketDiff);
                event.totalTickets = totalTickets;
            }

            if (title) event.title = title;
            if (description) event.description = description;
            if (date) event.date = date;
            if (venue) event.venue = venue;
            if (price) event.price = price;

            await event.save();

            res.json({
                success: true,
                data: { event }
            });
        } catch (error) {
            console.error('Update event error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to update event'
                }
            });
        }
    },

    // Delete event
    async deleteEvent(req, res) {
        try {
            const Event = require('../models/Event');
            const { id } = req.params;

            const event = await Event.findByPk(id);
            if (!event) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Event not found'
                    }
                });
            }

            await event.destroy();

            res.json({
                success: true,
                data: { message: 'Event deleted successfully' }
            });
        } catch (error) {
            console.error('Delete event error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to delete event'
                }
            });
        }
    },

    // Get all developers
    async getDevelopers(req, res) {
        try {
            const Developer = require('../models/Developer');
            const developers = await Developer.findAll({
                attributes: ['id', 'name', 'email', 'tier', 'requestCount', 'requestLimit', 'isActive', 'createdAt'],
                order: [['createdAt', 'DESC']]
            });

            res.json({
                success: true,
                data: { developers }
            });
        } catch (error) {
            console.error('Get developers error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to fetch developers'
                }
            });
        }
    },

    // Get usage logs
    async getUsageLogs(req, res) {
        try {
            const ApiUsageLog = require('../models/ApiUsageLog');
            const Developer = require('../models/Developer');

            const logs = await ApiUsageLog.findAll({
                limit: 100,
                order: [['createdAt', 'DESC']],
                include: [{
                    model: Developer,
                    attributes: ['name', 'email']
                }]
            });

            res.json({
                success: true,
                data: { logs }
            });
        } catch (error) {
            console.error('Get usage logs error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to fetch usage logs'
                }
            });
        }
    }
};

module.exports = adminController;
