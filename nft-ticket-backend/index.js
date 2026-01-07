require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');

// Import models
const User = require('./models/User');
const Event = require('./models/Event');
const Ticket = require('./models/Ticket');
const Admin = require('./models/Admin');
const Developer = require('./models/Developer');
const ApiUsageLog = require('./models/ApiUsageLog');

// Model associations
User.hasMany(Ticket, { foreignKey: 'userId' });
Ticket.belongsTo(User, { foreignKey: 'userId' });
Event.hasMany(Ticket, { foreignKey: 'eventId' });
Ticket.belongsTo(Event, { foreignKey: 'eventId' });
Developer.hasMany(Ticket, { foreignKey: 'developerId' });
Ticket.belongsTo(Developer, { foreignKey: 'developerId' });
Developer.hasMany(ApiUsageLog, { foreignKey: 'developerId' });
ApiUsageLog.belongsTo(Developer, { foreignKey: 'developerId' });

// Import routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const ticketRoutes = require('./routes/tickets');
const blockchainRoutes = require('./routes/blockchain');
const adminRoutes = require('./routes/adminRoutes');
const developerRoutes = require('./routes/developerRoutes');
const openApiRoutes = require('./routes/openApiRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Original routes (for your demo frontend)
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/blockchain', blockchainRoutes);

// Open API routes
app.use('/api/admin', adminRoutes);
app.use('/api/developers', developerRoutes);
app.use('/api/v1', openApiRoutes);

// API Info route
app.get('/', (req, res) => {
  res.json({
    message: 'NFT Ticketing Open API',
    version: '1.0.0',
    documentation: {
      admin: '/api/admin/*',
      developer: '/api/developers/*',
      openApi: '/api/v1/*'
    },
    endpoints: {
      admin: [
        'POST /api/admin/login',
        'GET /api/admin/events',
        'POST /api/admin/events',
        'PUT /api/admin/events/:id',
        'DELETE /api/admin/events/:id',
        'GET /api/admin/developers',
        'GET /api/admin/usage-logs'
      ],
      developer: [
        'POST /api/developers/register',
        'POST /api/developers/login',
        'GET /api/developers/me',
        'POST /api/developers/regenerate-key',
        'GET /api/developers/usage'
      ],
      openApi: [
        'GET /api/v1/events',
        'GET /api/v1/events/:id',
        'POST /api/v1/tickets/mint',
        'GET /api/v1/tickets/:tokenId',
        'GET /api/v1/tickets/verify/:tokenId',
        'POST /api/v1/tickets/transfer',
        'GET /api/v1/blockchain/tx/:txHash'
      ]
    }
  });
});

// Sync database & start server
const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ Database synced!');
    app.listen(PORT, () => {
      console.log(`🚀 NFT Ticketing Open API running on port ${PORT}`);
      console.log(`📡 Blockchain: ${process.env.SEPOLIA_RPC_URL}`);
    });
  })
  .catch(err => console.error('❌ Database sync error:', err));
