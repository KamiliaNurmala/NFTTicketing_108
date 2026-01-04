const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  venue: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: false
  },
  totalTickets: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  availableTickets: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'events',
  timestamps: true
});

module.exports = Event;
