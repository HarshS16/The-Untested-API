# Finance Dashboard API

A comprehensive backend system for a finance dashboard, featuring role-based access control, transaction management, and analytics insights. Built with Node.js, Express, Prisma, and PostgreSQL.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Architecture](#architecture)
- [RBAC Permissions](#rbac-permissions)
- [API Documentation](#api-documentation)

## Features
- **Authentication**: JWT-based login and registration with hashed passwords.
- **Role-Based Access Control (RBAC)**: Support for VIEWER, ANALYST, and ADMIN roles.
- **Financial Records**: Full CRUD for income and expense transactions.
- **Dashboard Analytics**: Summaries, category breakdowns, trends (weekly/monthly), and recent activity.
- **Security**: Rate limiting, security headers (Helmet), and strict input validation (Zod).

## Tech Stack
- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Documentation**: Swagger/OpenAPI

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL database

### Setup
1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Setup environment variables**:
   Create a `.env` file based on `.env.example`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/finance_dashboard"
   JWT_SECRET="your-secret-key"
   PORT=3000
   ```
4. **Generate Prisma client**:
   ```bash
   npm run db:generate
   ```
5. **Apply migrations**:
   ```bash
   npm run db:push
   ```
6. **Seed the database**:
   ```bash
   npm run db:seed
   ```
7. **Start the server**:
   ```bash
   npm run dev
   ```

## Architecture
The project follows a modular structure:
- `src/modules`: Each module (auth, user, record, dashboard) contains its own routes, controller, service, and validation schema.
- `src/middleware`: Global and specific route middlewares (auth, authorize, validation).
- `src/utils`: Reusable helper classes for API errors and responses.
- `src/config`: Application-wide configuration.

## RBAC Permissions

| Role | Dashboard | Financial Records | User Management |
| :--- | :--- | :--- | :--- |
| **VIEWER** | View Summary, Trends, Breakdown | No Access | No Access |
| **ANALYST** | View Summary, Trends, Breakdown | View Records | No Access |
| **ADMIN** | Full Access | Full CRUD | Full Management |

## API Documentation
Once the server is running, visit:
- **Swagger UI**: `http://localhost:3000/api/docs`
- **Health Check**: `http://localhost:3000/api/health`

## Assumptions
- Viewers are interested in the high-level dashboard but shouldn't see granular, anonymized, or sensitive individual records.
- Soft-deletion is used for financial records to preserve data history.
- The system defaults to standard ISO currencies (Decimal usage in DB).
