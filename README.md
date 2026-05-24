# DevPulse API

> A collaborative platform for software teams to report bugs, suggest features, and coordinate resolutions.

**Live URL:** `b7-a2-dev-pulse-wheat.vercel.app`
&nbsp;
**GitHub:** `https://github.com/usama-21038/b7-a2-devPulse`

---

## Features

- JWT-based authentication with role-based access control
- Two user roles: `contributor` and `maintainer` with distinct permissions
- Full issue lifecycle management (create, read, update, delete)
- Filter and sort issues by type, status, and date
- Secure password hashing with bcrypt
- Centralized error handling and consistent API response format
- PostgreSQL with raw SQL queries (no ORM)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js (LTS 24.x) |
| Language | TypeScript |
| Framework | Express.js |
| Database | PostgreSQL (native `pg` driver) |
| Auth | JSON Web Tokens (`jsonwebtoken`) |
| Security | `bcrypt` (salt rounds: 10) |
| Deployment | Render / Railway |
| DB Hosting | NeonDB / Supabase |

---

## Getting Started

### Prerequisites

- Node.js v24 or higher
- PostgreSQL database (local or cloud)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/devpulse.git
cd devpulse

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
```

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/devpulse
JWT_SECRET=my_super_secret_jwt_key_here
```

### Running the App

```bash
# Development mode (with hot reload)
npm run dev

# Production build
npm run build
npm start
```

The server will start at `http://localhost:5000`

---

## API Endpoints

### Authentication

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/auth/signup` | Public | Register a new user account |
| `POST` | `/api/auth/login` | Public | Login and receive JWT token |

### Issues

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/issues` | Public | Get all issues (supports filter & sort) |
| `GET` | `/api/issues/:id` | Public | Get a single issue by ID |
| `POST` | `/api/issues` | Authenticated | Create a new issue |
| `PATCH` | `/api/issues/:id` | Authenticated | Update an issue |
| `DELETE` | `/api/issues/:id` | Maintainer only | Delete an issue |

### Query Parameters (GET /api/issues)

| Param | Values | Default |
|-------|--------|---------|
| `sort` | `newest`, `oldest` | `newest` |
| `type` | `bug`, `feature_request` | — |
| `status` | `open`, `in_progress`, `resolved` | — |

**Example:** `GET /api/issues?sort=oldest&type=bug&status=open`

### Authorization Header

Protected endpoints require a JWT token in the request header:

```
Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> Note: Do not prefix with `Bearer` — pass the raw token directly.

---

## Request & Response Examples

### POST /api/auth/signup

```json
// Request Body
{
  "name": "John Doe",
  "email": "john@devpulse.com",
  "password": "securePassword123",
  "role": "contributor"
}

// Response 201
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@devpulse.com",
    "role": "contributor",
    "created_at": "2026-01-20T09:00:00Z",
    "updated_at": "2026-01-20T09:00:00Z"
  }
}
```

### POST /api/issues

```json
// Request Body
{
  "title": "Database connection timeout under load",
  "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
  "type": "bug"
}

// Response 201
{
  "success": true,
  "message": "Issue created successfully",
  "data": {
    "id": 45,
    "title": "Database connection timeout under load",
    "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
    "type": "bug",
    "status": "open",
    "reporter_id": 1,
    "created_at": "2026-01-20T10:30:00Z",
    "updated_at": "2026-01-20T10:30:00Z"
  }
}
```

---

## Database Schema

### `users` table

```sql
CREATE TABLE users (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(255)  NOT NULL,
  email      VARCHAR(255)  UNIQUE NOT NULL,
  password   TEXT          NOT NULL,
  role       VARCHAR(20)   NOT NULL DEFAULT 'contributor'
             CHECK (role IN ('contributor', 'maintainer')),
  created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

| Column | Type | Description |
|--------|------|-------------|
| `id` | `SERIAL` | Auto-incrementing primary key |
| `name` | `VARCHAR(255)` | Full display name |
| `email` | `VARCHAR(255)` | Unique login email |
| `password` | `TEXT` | bcrypt hashed password |
| `role` | `VARCHAR(20)` | `contributor` or `maintainer` |
| `created_at` | `TIMESTAMPTZ` | Account creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | Last update timestamp |

### `issues` table

```sql
CREATE TABLE issues (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(150)  NOT NULL,
  description TEXT          NOT NULL CHECK (LENGTH(description) >= 20),
  type        VARCHAR(20)   NOT NULL CHECK (type IN ('bug', 'feature_request')),
  status      VARCHAR(20)   NOT NULL DEFAULT 'open'
              CHECK (status IN ('open', 'in_progress', 'resolved')),
  reporter_id INTEGER       NOT NULL,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

| Column | Type | Description |
|--------|------|-------------|
| `id` | `SERIAL` | Auto-incrementing primary key |
| `title` | `VARCHAR(150)` | Issue headline (max 150 chars) |
| `description` | `TEXT` | Detailed description (min 20 chars) |
| `type` | `VARCHAR(20)` | `bug` or `feature_request` |
| `status` | `VARCHAR(20)` | `open`, `in_progress`, or `resolved` |
| `reporter_id` | `INTEGER` | References the submitting user's ID |
| `created_at` | `TIMESTAMPTZ` | Issue creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | Last update timestamp |

---

## Project Structure

```
devpulse/
├── src/
│   ├── config/
│   │   ├── db.ts              # PostgreSQL connection pool
│   │   └── initDB.ts          # Table creation & triggers
│   ├── middleware/
│   │   ├── auth.middleware.ts  # JWT verification & role checks
│   │   └── error.middleware.ts # Global error handler
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.controller.ts
│   │   │   └── auth.service.ts
│   │   └── issues/
│   │       ├── issues.routes.ts
│   │       ├── issues.controller.ts
│   │       └── issues.service.ts
│   ├── utils/
│   │   └── response.ts        # Success/error response helpers
│   └── index.ts               # App entry point
├── .env
├── package.json
└── tsconfig.json
```

---

## User Roles & Permissions

| Permission | Contributor | Maintainer |
|-----------|:-----------:|:----------:|
| Register & login | ✅ | ✅ |
| View all issues | ✅ | ✅ |
| Create issues | ✅ | ✅ |
| Update own issue (status: open only) | ✅ | ✅ |
| Update any issue | ❌ | ✅ |
| Delete any issue | ❌ | ✅ |
| Change issue status independently | ❌ | ✅ |

---

## HTTP Status Codes

| Code | Meaning | When used |
|------|---------|-----------|
| `200` | OK | Successful GET, PATCH, DELETE |
| `201` | Created | Successful POST |
| `400` | Bad Request | Validation errors, duplicate email |
| `401` | Unauthorized | Missing or invalid JWT |
| `403` | Forbidden | Insufficient role/permissions |
| `404` | Not Found | Resource does not exist |
| `409` | Conflict | Editing a non-open issue as contributor |
| `500` | Internal Server Error | Unexpected server error |

---

## License

This project is for educational purposes as part of the B7A2 assignment.
