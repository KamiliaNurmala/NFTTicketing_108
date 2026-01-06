const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const web3Service = require('../services/web3Service');

const openApiController = {
    // Get all events
    async getEvents(req, res) {
        try {
            const events = await Event.findAll({
                order: [['date', 'ASC']]
            });

            res.json({
                success: true,
                data: {
                    events: events.map(event => ({
                        id: event.id,
                        title: event.title,
                        description: event.description,
                        date: event.date,
                        venue: event.venue,
                        totalTickets: event.totalTickets,
                        availableTickets: event.availableTickets,
                        price: event.price
                    }))
                }
            });
        } catch (error) {
            console.error('API Get events error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to fetch events'
                }
            });
        }
    },

    // Get single event
    async getEvent(req, res) {
        try {
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

            res.json({
                success: true,
                data: { event }
            });
        } catch (error) {
            console.error('API Get event error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to fetch event'
                }
            });
        }
    },

    // Mint NFT ticket
    async mintTicket(req, res) {
        try {
            const { eventId, walletAddress } = req.body;

            // Validate input
            if (!eventId || !walletAddress) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'MISSING_FIELDS',
                        message: 'eventId and walletAddress are required'
                    }
                });
            }

            // Find event
            const event = await Event.findByPk(eventId);
            if (!event) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'EVENT_NOT_FOUND',
                        message: 'Event not found'
                    }
                });
            }

            // Check availability
            if (event.availableTickets <= 0) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'SOLD_OUT',
                        message: 'No tickets available for this event'
                    }
                });
            }

            // Create ticket record
            const ticket = await Ticket.create({
                eventId: event.id,
                developerId: req.developer.id,
                walletAddress,
                status: 'pending'
            });

            // Mint NFT on blockchain
            const mintResult = await web3Service.mintTicket(walletAddress, event.title);

            // Update ticket with blockchain data
            ticket.nftTokenId = mintResult.tokenId;
            ticket.txHash = mintResult.txHash;
            ticket.status = 'minted';
            await ticket.save();

            // Decrease available tickets
            event.availableTickets -= 1;
            await event.save();

            res.status(201).json({
                success: true,
                data: {
                    ticket: {
                        id: ticket.id,
                        tokenId: ticket.nftTokenId,
                        txHash: ticket.txHash,
                        eventName: event.title,
                        walletAddress: ticket.walletAddress,
                        status: ticket.status
                    }
                }
            });
        } catch (error) {
            console.error('API Mint ticket error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'MINT_FAILED',
                    message: error.message || 'Failed to mint ticket'
                }
            });
        }
    },

    // Get ticket by token ID
    async getTicket(req, res) {
        try {
            const { tokenId } = req.params;

            const ticket = await Ticket.findOne({
                where: { nftTokenId: tokenId },
                include: [{ model: Event }]
            });

            if (!ticket) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Ticket not found'
                    }
                });
            }

            res.json({
                success: true,
                data: {
                    ticket: {
                        id: ticket.id,
                        tokenId: ticket.nftTokenId,
                        txHash: ticket.txHash,
                        walletAddress: ticket.walletAddress,
                        status: ticket.status,
                        event: ticket.Event ? {
                            id: ticket.Event.id,
                            title: ticket.Event.title,
                            date: ticket.Event.date,
                            venue: ticket.Event.venue
                        } : null
                    }
                }
            });
        } catch (error) {
            console.error('API Get ticket error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to fetch ticket'
                }
            });
        }
    },

    // Verify ticket on blockchain
    async verifyTicket(req, res) {
        try {
            const { tokenId } = req.params;

            // Get ticket from database
            const ticket = await Ticket.findOne({
                where: { nftTokenId: tokenId },
                include: [{ model: Event }]
            });

            if (!ticket) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Ticket not found in database'
                    }
                });
            }

            // Verify on blockchain
            const verifyResult = await web3Service.verifyTicket(tokenId);

            res.json({
                success: true,
                data: {
                    verified: verifyResult.isValid,
                    ticket: {
                        tokenId: parseInt(tokenId),
                        ownerOnChain: verifyResult.owner,
                        ownerInDb: ticket.walletAddress,
                        eventName: verifyResult.eventName,
                        status: ticket.status
                    }
                }
            });
        } catch (error) {
            console.error('API Verify ticket error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'VERIFICATION_FAILED',
                    message: error.message || 'Failed to verify ticket'
                }
            });
        }
    },

    // Transfer ticket
    async transferTicket(req, res) {
        try {
            const { tokenId, fromAddress, toAddress } = req.body;

            // Validate input
            if (!tokenId || !fromAddress || !toAddress) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'MISSING_FIELDS',
                        message: 'tokenId, fromAddress, and toAddress are required'
                    }
                });
            }

            // Find ticket
            const ticket = await Ticket.findOne({ where: { nftTokenId: tokenId } });
            if (!ticket) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Ticket not found'
                    }
                });
            }

            // Update wallet address in database
            ticket.walletAddress = toAddress;
            await ticket.save();

            res.json({
                success: true,
                data: {
                    message: 'Ticket transfer recorded. Note: On-chain transfer must be done by wallet owner.',
                    ticket: {
                        tokenId: ticket.nftTokenId,
                        newOwner: toAddress
                    }
                }
            });
        } catch (error) {
            console.error('API Transfer ticket error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'TRANSFER_FAILED',
                    message: error.message || 'Failed to transfer ticket'
                }
            });
        }
    },

    // Check transaction status
    async getTransaction(req, res) {
        try {
            const { txHash } = req.params;

            const txStatus = await web3Service.getTransactionStatus(txHash);

            if (!txStatus.success) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'TX_NOT_FOUND',
                        message: txStatus.error || 'Transaction not found'
                    }
                });
            }

            res.json({
                success: true,
                data: {
                    transaction: txStatus.transaction
                }
            });
        } catch (error) {
            console.error('API Get transaction error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Failed to fetch transaction status'
                }
            });
        }
    }
};

module.exports = openApiController;
