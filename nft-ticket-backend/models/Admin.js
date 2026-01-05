const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcrypt');

const Admin = sequelize.define('Admin', {
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
    }
}, {
    tableName: 'admins',
    timestamps: true,
    hooks: {
        beforeCreate: async (admin) => {
            admin.password = await bcrypt.hash(admin.password, 10);
        }
    }
});

Admin.prototype.validatePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = Admin;
