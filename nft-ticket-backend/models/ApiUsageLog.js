const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ApiUsageLog = sequelize.define('ApiUsageLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    developerId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    endpoint: {
        type: DataTypes.STRING,
        allowNull: false
    },
    method: {
        type: DataTypes.STRING,
        allowNull: false
    },
    statusCode: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    responseTime: {
        type: DataTypes.INTEGER, // in milliseconds
        allowNull: true
    },
    ipAddress: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'api_usage_logs',
    timestamps: true,
    updatedAt: false // Only need createdAt for logs
});

module.exports = ApiUsageLog;
