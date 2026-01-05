const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Ticket = sequelize.define('Ticket', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true // Now optional (for API-based minting without user)
  },
  developerId: {
    type: DataTypes.INTEGER,
    allowNull: true // For tracking which developer minted
  },
  eventId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  walletAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  nftTokenId: {
    type: DataTypes.INTEGER
  },
  txHash: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.ENUM('pending', 'minted', 'used', 'transferred'),
    defaultValue: 'pending'
  }
}, {
  tableName: 'tickets',
  timestamps: true
});

module.exports = Ticket;
