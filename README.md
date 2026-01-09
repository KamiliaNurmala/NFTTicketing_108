# 🎫 NFT Ticketing Open API

Sistem tiket berbasis NFT (Non-Fungible Token) yang menyediakan:
- **Website publik** untuk user membeli tiket NFT
- **Open API** untuk developer pihak ketiga mengintegrasikan sistem ticketing
- **Admin Panel** untuk mengelola data events

---

## 📋 Table of Contents
- [Technology Stack](#technology-stack)
- [User Roles](#user-roles)
- [UI Screenshots](#ui-screenshots)
- [API Endpoints](#api-endpoints)

---

## 🛠 Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | ReactJS |
| Backend | NodeJS, Express.js |
| Database | MySQL, Sequelize ORM |
| Blockchain | Ethereum Sepolia, Ethers.js |
| Auth | JWT, bcrypt, API Key |

---

## 👥 User Roles

| Role | Deskripsi | Authentication |
|------|-----------|----------------|
| **Admin** | Pengelola sistem, CRUD events | JWT Token |
| **Developer** | Developer pihak ketiga yang menggunakan API | JWT Token + API Key |
| **User** | End-user yang membeli tiket via website | JWT Token |

---

## 📸 UI Screenshots

### User Website

#### Homepage
![User Homepage](ss-ticket/UI/user-homepgae.png)

#### User Registration
![User Register](ss-ticket/UI/user-register.png)

#### User Login
![User Login](ss-ticket/UI/user-login.png)

#### After Login (With Wallet Connected)
![After User Login](ss-ticket/UI/after-user-login.png)

#### Event Detail
![Event Detail](ss-ticket/UI/user-detail-event.png)

#### My Tickets
![My Tickets](ss-ticket/UI/user-mytickets.png)

---

### Developer Portal

#### Developer Registration
![Developer Register](ss-ticket/UI/developer-register.png)

#### Developer Login
![Developer Login](ss-ticket/UI/developer-login.png)

#### Developer Dashboard
![Developer Dashboard](ss-ticket/UI/developer-dashboard.png)

#### Developer Dashboard with API Testing
![Developer Dashboard Testing](ss-ticket/UI/developer-dashboard-with-testing.png)

---

### Admin Dashboard

#### Admin Registration (via Seed Script)
![Admin Register](ss-ticket/UI/admin-register.png)

#### Admin Login
![Admin Login](ss-ticket/UI/admin-login.png)

#### View Events
![Admin View Events](ss-ticket/UI/admin-view-events.png)

#### Add New Event
![Admin Add Events](ss-ticket/UI/admin-add-events.png)

#### View Developers
![Admin View Developers](ss-ticket/UI/admin-view-developers.png)

---

### Third-Party API Integration Demo

#### API Key Homepage
![API Key Homepage](ss-ticket/UI/apikey-homepage.png)

#### Try Minting via API
![API Key Try Minting](ss-ticket/UI/apikey-tryminting(post).png)

#### After Minting Success
![API Key After Minting](ss-ticket/UI/apikey-afterminting.png)

---

## 🔌 API Endpoints

Base URL: `http://localhost:3000`

---

### A. User Auth Endpoints

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | `/api/auth/register` | - | User register |
| POST | `/api/auth/login` | - | User login |
| POST | `/api/auth/connect-wallet` | JWT | Connect MetaMask wallet |

#### Register User
![User Register](ss-ticket/Postman/postman-user-register.png)

#### Login User
![User Login](ss-ticket/Postman/postman-user-login.png)

#### Connect Wallet
![User Connect Wallet](ss-ticket/Postman/postman-user-conenctwallet.png)

---

### B. Events Endpoints (Public)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/api/events` | - | List all events |
| GET | `/api/events/:id` | - | Get event detail |

#### List All Events
![Events List](ss-ticket/Postman/postman-events.png)

#### Get Event by ID
![Event Detail](ss-ticket/Postman/postman-event-id.png)

---

### C. Tickets Endpoints (User)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | `/api/tickets/purchase` | JWT | Buy ticket (mint NFT) |
| GET | `/api/tickets/my-tickets` | JWT | Get user's tickets |
| GET | `/api/tickets/verify/:tokenId` | - | Verify ticket on-chain |
| POST | `/api/tickets/transfer` | JWT | Transfer ticket |
| POST | `/api/tickets/sync-transfer` | JWT | Sync transfer from MetaMask |

#### Purchase Ticket
![Purchase Ticket](ss-ticket/Postman/postman-user-purchase.png)

#### My Tickets
![My Tickets](ss-ticket/Postman/postman-user-mytickets.png)

#### Verify Ticket
![Verify Ticket](ss-ticket/Postman/postman-user-verify.png)

#### Transfer Ticket
![Transfer Ticket](ss-ticket/Postman/postman-user-transfer-success.png)

#### Sync Transfer
![Sync Transfer](ss-ticket/Postman/postman-user-sync-transfer.png)

---

### D. Admin Endpoints

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | `/api/admin/login` | - | Admin login |
| GET | `/api/admin/events` | JWT | Get all events |
| POST | `/api/admin/events` | JWT | Create event |
| PUT | `/api/admin/events/:id` | JWT | Update event |
| DELETE | `/api/admin/events/:id` | JWT | Delete event |
| GET | `/api/admin/developers` | JWT | View all developers |
| GET | `/api/admin/usage-logs` | JWT | View API usage logs |

> **Note:** Admin registration dilakukan via seed script (`node seedAdmin.js`) untuk keamanan.

#### Admin Login
![Admin Login](ss-ticket/Postman/postman-admin-login.png)

#### List Events
![Admin Events](ss-ticket/Postman/postman-admin-list-events.png)

#### Create Event
![Admin Add Event](ss-ticket/Postman/postman-admin-add-events.png)

#### Update Event
![Admin Update Event](ss-ticket/Postman/postman-admin-update-events.png)

#### Delete Event
![Admin Delete Event](ss-ticket/Postman/postman-admin-delete-events.png)

#### View Developers
![Admin Developers](ss-ticket/Postman/postman-admin-list-developers.png)

#### View Usage Logs
![Admin Usage Logs](ss-ticket/Postman/postman-admin-usage-logs.png)

---

### E. Developer Portal Endpoints

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | `/api/developers/register` | - | Developer register |
| POST | `/api/developers/login` | - | Developer login |
| GET | `/api/developers/me` | JWT | Get profile & API Key |
| POST | `/api/developers/regenerate-key` | JWT | Regenerate API Key |
| GET | `/api/developers/usage` | JWT | View usage stats |

#### Developer Register
![Developer Register](ss-ticket/Postman/postman-developers-register.png)

#### Developer Login
![Developer Login](ss-ticket/Postman/postman-developers-login.png)

#### Get Profile
![Developer Profile](ss-ticket/Postman/postman-developers-read-profile.png)

#### Regenerate API Key
![Developer Regenerate Key](ss-ticket/Postman/postman-developers-regenerate-key.png)

#### View Usage Stats
![Developer Usage](ss-ticket/Postman/postman-developers-usage.png)

---

### F. Open API v1 Endpoints (Third-Party)

**Header Required:** `X-API-Key: sk_live_xxxxx`

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/v1/events` | List all events |
| GET | `/api/v1/events/:id` | Get event detail |
| POST | `/api/v1/tickets/mint` | Mint NFT ticket |
| GET | `/api/v1/tickets/:tokenId` | Get ticket info |
| GET | `/api/v1/tickets/verify/:tokenId` | Verify on blockchain |
| GET | `/api/v1/blockchain/tx/:txHash` | Check TX status |

#### List Events (API Key)
![API Events](ss-ticket/Postman/postman-apikey-list-events.png)

#### Get Event by ID (API Key)
![API Event Detail](ss-ticket/Postman/postman-apikey-events-id.png)

#### Mint Ticket (API Key)
![API Mint](ss-ticket/Postman/postman-apikey-mint.png)

#### Get Ticket Info (API Key)
![API Ticket Info](ss-ticket/Postman/postman-apikey-ticket-id.png)

#### Verify Ticket (API Key)
![API Verify](ss-ticket/Postman/post,am-apikey-verify-ticket.png)

#### Check Transaction Status (API Key)
![API TX Hash](ss-ticket/Postman/postman-apikey-txhash.png)

---

## 🔐 API Authentication

### Admin & Developer Portal
- Login → dapat JWT Token
- JWT disimpan di localStorage
- Setiap request kirim header: `Authorization: Bearer <token>`

### Open API (Third-Party)
- Developer register → dapat API Key
- API Key format: `sk_live_xxxxxxxxxxxxxxxx`
- Setiap request kirim header: `X-API-Key: sk_live_xxxxx`
- Rate Limit: 100 requests/day

---

## 🚀 How to Run

### Backend
```bash
cd nft-ticket-backend
npm install
node seedAdmin.js  # Create admin account
npm start
```

### Frontend
```bash
cd nft-ticket-frontend
npm install
npm start
```

---

## 📝 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@nftticket.com | admin123 |

---

## 👨‍💻 Author

Kamilia Nurmala - 108
