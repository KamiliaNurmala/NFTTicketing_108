const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const User = require('../models/User');
const web3Service = require('../services/web3Service');

class TicketController {
  async purchase(req, res) {
    try {
      const { eventId } = req.body;
      const userId = req.user.id;

      // Check event
      const event = await Event.findByPk(eventId);
      if (!event) {
        return res.status(404).json({ 
          success: false, 
          message: 'Event not found' 
        });
      }

      if (event.availableTickets <= 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'No tickets available' 
        });
      }

      // Check user wallet
      const user = await User.findByPk(userId);
      if (!user.walletAddress) {
        return res.status(400).json({ 
          success: false, 
          message: 'Please connect wallet first' 
        });
      }

      // Create pending ticket
      const ticket = await Ticket.create({
        userId,
        eventId,
        status: 'pending'
      });

      // Mint NFT
      const mintResult = await web3Service.mintTicket(
        user.walletAddress,
        event.title
      );

      if (mintResult.success) {
        // Update ticket
        ticket.nftTokenId = mintResult.tokenId;
        ticket.txHash = mintResult.txHash;
        ticket.status = 'minted';
        await ticket.save();

        // Decrease available tickets
        event.availableTickets -= 1;
        await event.save();

        res.json({
          success: true,
          message: 'Ticket purchased successfully!',
          ticket: {
            id: ticket.id,
            eventName: event.title,
            nftTokenId: mintResult.tokenId,
            txHash: mintResult.txHash
          }
        });
      } else {
        // Delete ticket if mint failed
        await ticket.destroy();
        res.status(500).json({
          success: false,
          message: 'Failed to mint NFT',
          error: mintResult.error
        });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getMyTickets(req, res) {
    try {
      const userId = req.user.id;
      const user = await User.findByPk(userId);
  
      // If user has wallet, sync tickets from blockchain first
      if (user.walletAddress) {
        await this.syncUserTickets(user);
      }
  
      const tickets = await Ticket.findAll({
        where: { userId, status: 'minted' },
        include: [{
          model: Event,
          attributes: ['title', 'date', 'venue']
        }]
      });
  
      res.json({ success: true, tickets });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async verify(req, res) {
    try {
      const { tokenId } = req.params;

      const ownerResult = await web3Service.getTicketOwner(tokenId);
      
      if (ownerResult.success) {
        const ticket = await Ticket.findOne({
          where: { nftTokenId: tokenId },
          include: [Event]
        });

        res.json({
          success: true,
          valid: true,
          owner: ownerResult.owner,
          eventName: ticket?.Event?.title || 'Unknown',
          status: ticket?.status || 'unknown'
        });
      } else {
        res.json({ 
          success: false, 
          valid: false, 
          error: ownerResult.error 
        });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async transfer(req, res) {
    try {
      const { ticketId, toAddress } = req.body;
      const userId = req.user.id;
  
      // Find the ticket
      const ticket = await Ticket.findOne({
        where: { id: ticketId, userId, status: 'minted' }
      });
  
      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found or not owned by you'
        });
      }
  
      // Get sender's wallet
      const user = await User.findByPk(userId);
      if (!user.walletAddress) {
        return res.status(400).json({
          success: false,
          message: 'Your wallet is not connected'
        });
      }
  
      // Normalize destination address
      const { ethers } = require('ethers');
      const normalizedToAddress = ethers.getAddress(toAddress.toLowerCase());
  
      // Transfer NFT on blockchain
      const transferResult = await web3Service.transferTicket(
        user.walletAddress,
        normalizedToAddress,
        ticket.nftTokenId
      );
  
      if (transferResult.success) {
        // Check if destination wallet belongs to an existing user
        const newOwner = await User.findOne({
          where: { walletAddress: normalizedToAddress }
        });
  
        if (newOwner) {
          // Transfer to existing user - update ownership
          ticket.userId = newOwner.id;
          ticket.status = 'minted';  // Keep as minted so new owner sees it
        } else {
          // External wallet - mark as transferred (no user account)
          ticket.status = 'transferred';
        }
        
        ticket.txHash = transferResult.txHash;
        await ticket.save();
  
        res.json({
          success: true,
          message: newOwner 
            ? `Ticket transferred to ${newOwner.name}!`
            : 'Ticket transferred to external wallet!',
          txHash: transferResult.txHash,
          newOwner: newOwner ? { id: newOwner.id, name: newOwner.name } : null
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Transfer failed',
          error: transferResult.error
        });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
  async syncTransfer(req, res) {
    try {
      const { ticketId, toAddress } = req.body;
      const userId = req.user.id;

      const ticket = await Ticket.findOne({
        where: { id: ticketId, userId }
      });

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found'
        });
      }

      const { ethers } = require('ethers');
      const normalizedToAddress = ethers.getAddress(toAddress.toLowerCase());

      const newOwner = await User.findOne({
        where: { walletAddress: normalizedToAddress }
      });

      if (newOwner) {
        ticket.userId = newOwner.id;
        ticket.status = 'minted';
      } else {
        ticket.status = 'transferred';
      }

      await ticket.save();

      res.json({ success: true, message: 'Database synced' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async syncUserTickets(user) {
    try {
      if (!user || !user.walletAddress) {
        console.log('No wallet address, skipping sync');
        return;
      }
  
      const { ethers } = require('ethers');
      
      // Get all minted tickets from DB
      const allTickets = await Ticket.findAll({
        where: { status: 'minted' }
      });
  
      const userWallet = user.walletAddress.toLowerCase();
  
      for (const ticket of allTickets) {
        try {
          // Check who owns this token on blockchain
          const ownerResult = await web3Service.getTicketOwner(ticket.nftTokenId);
          
          if (ownerResult.success && ownerResult.owner) {
            const blockchainOwner = ownerResult.owner.toLowerCase();
  
            // If blockchain says this user owns the ticket, update DB
            if (blockchainOwner === userWallet && ticket.userId !== user.id) {
              ticket.userId = user.id;
              ticket.status = 'minted';
              await ticket.save();
              console.log(`✅ Synced ticket #${ticket.id} to user ${user.id}`);
            }
            
            // If blockchain says different owner, and DB says this user owns it
            if (blockchainOwner !== userWallet && ticket.userId === user.id) {
              try {
                // Find the actual owner in our system (simple query)
                const users = await User.findAll();
                const actualOwner = users.find(u => 
                  u.walletAddress && u.walletAddress.toLowerCase() === blockchainOwner
                );
                
                if (actualOwner) {
                  ticket.userId = actualOwner.id;
                  await ticket.save();
                  console.log(`✅ Synced ticket #${ticket.id} to actual owner ${actualOwner.id}`);
                }
              } catch (findError) {
                console.log('Could not find owner:', findError.message);
              }
            }
          }
        } catch (ticketError) {
          console.log(`Error syncing ticket ${ticket.id}:`, ticketError.message);
          // Continue to next ticket
        }
      }
    } catch (error) {
      console.error('Sync error:', error.message);
      // Don't throw - just log, so getMyTickets still works
    }
  }
}

module.exports = new TicketController();