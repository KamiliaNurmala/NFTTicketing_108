const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const Developer = sequelize.define('Developer', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    apiKey: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    tier: {
        type: DataTypes.ENUM('free', 'pro', 'enterprise'),
        defaultValue: 'free'
    },
    requestLimit: {
        type: DataTypes.INTEGER,
        defaultValue: 100 // 100 requests per day for free tier
    },
    requestCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    lastRequestDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'developers',
    timestamps: true,
    hooks: {
        beforeCreate: async (developer) => {
            developer.password = await bcrypt.hash(developer.password, 10);
            developer.apiKey = Developer.generateApiKey();
        }
    }
});

// Generate API Key
Developer.generateApiKey = function () {
    const randomBytes = crypto.randomBytes(24).toString('hex');
    return `sk_live_${randomBytes}`;
};

// Validate password
Developer.prototype.validatePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Regenerate API Key
Developer.prototype.regenerateApiKey = function () {
    this.apiKey = Developer.generateApiKey();
    return this.apiKey;
};

// Check rate limit
Developer.prototype.checkRateLimit = function () {
    const today = new Date().toISOString().split('T')[0];

    // Reset count if new day
    if (this.lastRequestDate !== today) {
        this.requestCount = 0;
        this.lastRequestDate = today;
    }

    return this.requestCount < this.requestLimit;
};

// Increment request count
Developer.prototype.incrementRequestCount = async function () {
    const today = new Date().toISOString().split('T')[0];

    if (this.lastRequestDate !== today) {
        this.requestCount = 1;
        this.lastRequestDate = today;
    } else {
        this.requestCount += 1;
    }

    await this.save();
};

module.exports = Developer;
