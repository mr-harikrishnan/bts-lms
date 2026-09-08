# BSTORM Learning Management System (LMS)

A decoupled learning management platform built with Next.js 15, Tailwind CSS, Express 5, TypeScript (`.ts`), MongoDB, and Razorpay.

---

## 1. Directory Structure

```
bts-lms/
├── frontend/                     # Next.js 15 LMS Client Application
│   ├── src/
│   │   ├── app/                  # App Router Pages & Layouts
│   │   ├── components/           # Modular & Reusable UI Components
│   │   ├── context/              # BstormContext Application State
│   │   ├── middleware.ts         # Route Protection & Auth Guards
│   │   ├── services/             # API Client Layer (Fetch & Axios)
│   │   └── types/                # Shared TypeScript Definitions
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                      # Production Express & TypeScript Backend
│   ├── src/
│   │   ├── config/               # Database, Env, Razorpay configs
│   │   ├── constants/            # Roles, Error codes, Order statuses
│   │   ├── controllers/          # HTTP Controllers (Auth, Courses, Payments, etc.)
│   │   ├── middleware/           # Security, Rate limits, Auth, Validation, Errors
│   │   ├── models/               # Mongoose Models (Strict ObjectIds & Indexes)
│   │   ├── routes/               # Versioned REST Routes (/api/v1/...)
│   │   ├── scripts/              # JSON to MongoDB Migration & Database Seeder
│   │   ├── services/             # Business Logic Layer (IDOR protected, Razorpay)
│   │   ├── utils/                # Password hashing, JWT, ObjectId casting, Logger
│   │   └── validators/           # Payload validation & field whitelisting
│   ├── tests/                    # Automated Security & Integration Test Suite
│   ├── API_DOCUMENTATION.md      # Full REST API Reference
│   ├── package.json
│   └── tsconfig.json
│
├── package.json                  # Root Orchestration & Development Scripts
└── README.md
```

---

## 2. Quick Start

### Prerequisites
- **Node.js**: v18+ or v20+
- **MongoDB**: Active instance running locally on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI

### Installation
Install dependencies for both frontend and backend from the root directory:
```bash
npm run install:all
```

### Environment Configuration
Copy sample environment files:
```bash
# Backend environment setup
cp backend/.env.example backend/.env
```

### Seed MongoDB Database
Populate MongoDB collections with verified course catalogs, lessons, and administrator credentials:
```bash
npm run seed:backend
```

### Run in Development Mode
Launch both the Next.js frontend (`localhost:3000`) and the Express TypeScript backend (`localhost:5000`):
```bash
npm run dev
```

Or run each service individually:
```bash
# Frontend only (port 3000)
npm run dev:frontend

# Backend only (port 5000)
npm run dev:backend
```

---

## 3. Testing & Verification

Run the full automated test suite for the TypeScript backend:
```bash
npm run test:backend
```

### Test Coverage Includes:
- **Authentication & Sessions**: Registration, bcrypt hashing, JWT issuance, refresh token rotation, invalid credentials rejection.
- **Pre-emptive ObjectId Validation**: Non-24-hex string IDs rejected with HTTP 400 before DB queries.
- **IDOR Protection**: Strict tenant isolation preventing Student A from accessing Student B's profile or credentials.
- **Razorpay Security**: Server-side price resolution, HMAC SHA-256 signature verification, and webhook idempotency.
- **Course Catalog**: Filterable and searchable course endpoints.

---

## 4. Production Build

```bash
# Compile TypeScript backend (outputs to backend/dist/)
npm run build:backend

# Build Next.js frontend
npm run build:frontend
```

---

## 5. Security Architecture

- **100% TypeScript**: Type-safe backend architecture with strict compilation (`noEmitOnError`).
- **Standardized MongoDB ObjectIds**: Strict 24-character hexadecimal ObjectId primary and foreign keys across all entities.
- **Defense in Depth**: Helmet headers, restricted CORS (`FRONTEND_URL`), 15kb body limits, and recursive NoSQL injection sanitization.
- **IDOR Protection**: All student data endpoints are strictly scoped to the authenticated caller (`req.user._id`).
- **Payment Tampering Guard**: Razorpay order amounts are resolved server-side from MongoDB to guarantee integrity against client price manipulation.
