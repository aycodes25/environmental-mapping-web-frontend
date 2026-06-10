# EMP — Environmental Mapping Project

A 3D facility model management platform for environmental sampling, incident tracking, and compliance reporting. EMP enables teams to upload 3D facility models (GLB/GLTF), place sampling and incident tags directly on models, manage evidence, generate audit-ready reports, and track environmental data across facilities.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Module Inventory](#module-inventory)
  - [3D Model Management](#3d-model-management)
  - [Tagging System](#tagging-system)
  - [Evidence Management](#evidence-management)
  - [Location / Facility Management](#location--facility-management)
  - [Report Generation](#report-generation)
  - [User Management](#user-management)
  - [Feedback System](#feedback-system)
  - [Comments System](#comments-system)
  - [Sample Management](#sample-management)
  - [Incident Tracking](#incident-tracking)
  - [Dashboard & Analytics](#dashboard--analytics)
- [Critical Automation Test Flows](#critical-automation-test-flows)
- [Pull Request Checklist](#pull-request-checklist)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  React 18 + Vite 5 + Tailwind CSS + Babylon.js + shadcn/ui │
│  Redux Toolkit · React Query · MUI                          │
│  Deployed: Vercel (staging) / Docker on EC2                 │
└──────────────────────────┬───────────────────────────────────┘
                           │ REST API
┌──────────────────────────▼───────────────────────────────────┐
│                       SERVER LAYER                           │
│  TypeScript · Express.js · Node.js                          │
│  JWT Auth + 2FA (TOTP) · Role-based access control          │
│  Deployed: Docker on EC2 · GitHub Actions CI/CD             │
└──────────────────────────┬───────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────┐
│                        DATA LAYER                            │
│  MongoDB (Mongoose 8.1.3)                                   │
│  10 resource domains                                        │
└──────────────────────────────────────────────────────────────┘
```

**Request lifecycle:** Client → API Gateway (Express) → Auth middleware (JWT + 2FA) → Route handler → Mongoose model → MongoDB → JSON response.

---

## Tech Stack

| Layer         | Technology                                  | Version / Notes                          |
|---------------|---------------------------------------------|------------------------------------------|
| Language      | TypeScript                                  | Backend + Frontend                       |
| Runtime       | Node.js                                     | LTS                                      |
| Backend       | Express.js                                  | REST API on port 8000                    |
| Database      | MongoDB (Mongoose)                          | Mongoose 8.1.3                           |
| Frontend      | React + Vite                                | React 18, Vite 5                         |
| CSS           | Tailwind CSS                                | Utility-first                            |
| UI Components | shadcn/ui + MUI                             | Hybrid component library                 |
| 3D Rendering  | Babylon.js                                  | GLB/GLTF model viewer                    |
| State         | Redux Toolkit + React Query                 | Client state + server cache              |
| Auth          | JWT + TOTP (2FA)                            | Role-based access                        |
| CI/CD         | GitHub Actions                              | Automated test + deploy                  |
| Containers    | Docker                                      | Backend + Frontend on EC2                |
| Hosting       | AWS EC2 + Vercel                            | Backend on EC2, Frontend on Vercel       |

---

## Module Inventory

### 3D Model Management

Upload, view, edit, and manage 3D facility models. Supports GLB and GLTF formats with full model viewer powered by Babylon.js.

| Capability       | Description                                         |
|------------------|-----------------------------------------------------|
| Upload           | GLB/GLTF upload with metadata (name, facility, tags)|
| View             | Interactive 3D viewer with orbit, zoom, pan controls |
| Edit             | Rename, reassign facility, update metadata           |
| Trash / Restore  | Soft-delete models with restore capability            |
| Trash Purge      | Permanent deletion (admin-only)                      |

### Tagging System

Place sampling and incident tags at precise 3D coordinates on models. Tags link to granular classification and evidence.

| Capability        | Description                                          |
|-------------------|------------------------------------------------------|
| Sampling Tags     | Environmental sampling points on 3D models           |
| Incident Tags     | Incident location markers on 3D models               |
| Granular Tags     | Hierarchical classification system for tags           |
| Tag Placement     | Click-to-place with 3D coordinate capture             |
| Tag Status        | Draft → Active → Resolved workflow                    |
| Heatmap           | Color-coded density visualization of tag distribution |

### Evidence Management

Upload and attach evidence files (images, documents) to samples, incidents, and tags.

| Capability      | Description                                      |
|-----------------|--------------------------------------------------|
| Upload          | File upload to local storage (EC2)               |
| Attach          | Link evidence to samples, incidents, or tags      |
| View            | Preview and download attached evidence            |
| Evidence Types  | Support for images, PDFs, documents              |

### Location / Facility Management

Manage facilities and locations that house 3D models.

| Capability      | Description                                      |
|-----------------|--------------------------------------------------|
| CRUD            | Create, read, update, delete facilities           |
| Hierarchy       | Location tree with parent/child relationships     |
| Assignment      | Link 3D models to specific facilities              |
| Filtering       | Filter models and tags by facility                 |

### Report Generation

Export audit-ready reports in PDF and CSV formats.

| Capability      | Description                                      |
|-----------------|--------------------------------------------------|
| PDF Export      | Formatted reports with model renders, tag data    |
| CSV Export      | Raw data export for samples, incidents, tags      |
| Filtering       | Filter by date range, facility, status, assignee  |
| Screenshot      | Capture 3D model viewport as image                |
| Video Recording | Screen capture of model navigation                 |

### User Management

Full CRUD for users with role-based access control and two-factor authentication.

| Capability      | Description                                      |
|-----------------|--------------------------------------------------|
| CRUD            | Create, read, update, delete user accounts        |
| Roles           | superAdmin, admin, reviewer, tagger, sampler       |
| 2FA             | TOTP-based two-factor authentication              |
| JWT Auth        | Stateless session with refresh token               |
| Profile         | Update profile, avatar, and preferences            |

### Feedback System

Submit and resolve user feedback within the application.

| Capability      | Description                                      |
|-----------------|--------------------------------------------------|
| Submit          | Users submit feedback with category and detail     |
| List / Filter   | View feedback with status filtering                |
| Resolve         | Mark feedback as resolved with notes               |
| Status          | Open → In Progress → Resolved                      |

### Comments System

Threaded commenting on samples, incidents, and tags.

| Capability      | Description                                      |
|-----------------|--------------------------------------------------|
| Create          | Add comments to any resource                       |
| Edit / Delete   | Authors can edit or delete their comments          |
| Thread          | Threaded replies for context                        |
| Notifications   | Notify relevant users of new comments               |

### Sample Management

Track environmental samples linked to 3D model locations.

| Capability      | Description                                      |
|-----------------|--------------------------------------------------|
| CRUD            | Create, read, update, delete samples               |
| Link to Tag     | Associate samples with 3D-placed tags              |
| Status          | Pending → Collected → Analyzed → Reported          |
| Evidence        | Attach evidence files to sample records            |

### Incident Tracking

Log, assign, and resolve environmental incidents.

| Capability      | Description                                      |
|-----------------|--------------------------------------------------|
| CRUD            | Create, read, update, delete incidents             |
| Assign          | Assign incidents to team members                   |
| Priority        | Low, Medium, High, Critical                        |
| Status          | Open → Investigating → Resolved → Closed           |
| Evidence        | Attach evidence files to incident records          |
| Link to Tag     | Associate incidents with 3D-placed tags            |

### Dashboard & Analytics

Overview dashboard with key metrics and visualizations.

| Capability      | Description                                      |
|-----------------|--------------------------------------------------|
| Stats Cards     | Total models, samples, incidents, users             |
| Heatmap         | Tag density heatmap on 3D models                   |
| Charts          | Incident trends, sample status breakdown            |
| Recent Activity | Feed of recent actions across the platform          |

---

## Critical Automation Test Flows

### 1. Auth Flow

```
Register → Login → 2FA Setup → 2FA Verify → Role-Based Dashboard Redirect
```

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | POST /auth/register | Account created, confirmation response |
| 2 | POST /auth/login | JWT token returned |
| 3 | POST /auth/2fa/setup | TOTP secret + QR code returned |
| 4 | POST /auth/2fa/verify | 2FA enabled, session established |
| 5 | GET /auth/me | User profile with role returned |
| 6 | GET /dashboard | Role-appropriate dashboard data |

### 2. 3D Model Upload and Rendering

```
Upload Model → Store Metadata → Load in Viewer → Verify Rendering
```

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | POST /models (multipart) | Model file uploaded, metadata saved |
| 2 | GET /models/:id | Model metadata returned |
| 3 | GET /models/:id/file | GLB/GLTF file stream returned |
| 4 | Client loads Babylon.js | 3D model renders correctly |
| 5 | Verify orbit/zoom/pan | Navigation controls functional |

### 3. Tag Creation and Placement on Model

```
Create Tag → Place on 3D Coordinates → Attach to Model → Verify Persistence
```

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | POST /tags | Tag created with metadata |
| 2 | PUT /tags/:id/location | 3D coordinates saved |
| 3 | GET /tags?model=:modelId | Tags filtered by model |
| 4 | Load model in viewer | Tag markers visible at correct positions |
| 5 | Verify heatmap | Density visualization renders |

### 4. Evidence Upload Workflow

```
Create Resource → Upload Evidence → Attach to Resource → Verify Link
```

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | POST /samples | Sample record created |
| 2 | POST /evidence (multipart) | Evidence file uploaded |
| 3 | PUT /samples/:id/evidence | Evidence linked to sample |
| 4 | GET /samples/:id | Sample with evidence returned |
| 5 | GET /evidence/:id/file | Evidence file downloadable |

### 5. Report Generation (PDF/CSV)

```
Select Filters → Request Export → Verify File Content
```

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | GET /reports/pdf?facility=&dateRange= | PDF file streamed |
| 2 | GET /reports/csv?facility=&status= | CSV file streamed |
| 3 | Verify PDF content | Headers, data, formatting correct |
| 4 | Verify CSV columns | All requested fields present |

### 6. User Role Assignment and Access Control

```
Create Users with Roles → Test Endpoint Access → Verify Denials
```

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create superAdmin, admin, reviewer, tagger, sampler | All accounts created |
| 2 | sampler → POST /users | 403 Forbidden |
| 3 | tagger → POST /reports/export | 403 Forbidden |
| 4 | reviewer → DELETE /models/:id | 403 Forbidden |
| 5 | admin → PUT /users/:id/role | 200 OK |
| 6 | superAdmin → DELETE /users/:id | 200 OK |

### 7. Feedback Submission and Resolution

```
Submit Feedback → Admin Reviews → Resolves → Verify Status
```

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | POST /feedback | Feedback created (status: open) |
| 2 | GET /feedback | Feedback listed for admins |
| 3 | PUT /feedback/:id/resolve | Status updated to resolved |
| 4 | GET /feedback/:id | Resolution notes returned |

---

## Pull Request Checklist

- [ ] Code compiles without errors (`npm run build`)
- [ ] Lint passes (`npm run lint`)
- [ ] Type checks pass (`npm run typecheck`)
- [ ] New features have corresponding test coverage
- [ ] API changes are documented (OpenAPI / inline comments)
- [ ] Database migrations are reversible
- [ ] Environment variables are added to `.env.example`
- [ ] Sensitive data is not committed (keys, tokens, passwords)
- [ ] Frontend changes are responsive (mobile + desktop)
- [ ] 3D model changes tested in Babylon.js viewer
- [ ] Role-based access verified for all new endpoints
- [ ] PR description explains **what** and **why**
- [ ] Screenshots / recordings attached for UI changes
- [ ] No breaking changes without team discussion

---

## Getting Started

### Prerequisites

- Node.js (LTS)
- MongoDB 6+
- Docker (for containerized deployment)
- npm or yarn

### Backend Setup

```bash
# Clone the repository
git clone <repo-url>
cd emp/backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Seed the database (optional)
npm run seed

# Start development server
npm run dev
# Server runs on http://localhost:8000
```

### Frontend Setup

```bash
cd emp/frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
# App runs on http://localhost:5173
```

### Docker Setup

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable                  | Description                              | Required |
|---------------------------|------------------------------------------|----------|
| `PORT`                    | Server port                              | Yes (8000) |
| `MONGODB_URI`             | MongoDB connection string                | Yes      |
| `JWT_SECRET`              | JWT signing secret                       | Yes      |
| `JWT_EXPIRES_IN`          | JWT expiration (e.g., 7d)               | Yes      |
| `TOTP_ISSUER`             | TOTP issuer name for 2FA                 | Yes      |
| `AWS_REGION`              | AWS region for S3 (if applicable)        | No       |
| `AWS_S3_BUCKET`           | S3 bucket name (if applicable)           | No       |
| `SMTP_HOST`               | Email server host                        | No       |
| `SMTP_PORT`               | Email server port                        | No       |
| `SMTP_USER`               | Email server user                        | No       |
| `SMTP_PASS`               | Email server password                    | No       |
| `NODE_ENV`                | Environment (development/production)     | Yes      |

### Frontend (`frontend/.env`)

| Variable                  | Description                              | Required |
|---------------------------|------------------------------------------|----------|
| `VITE_API_URL`            | Backend API base URL                     | Yes      |
| `VITE_WS_URL`             | WebSocket URL (if applicable)            | No       |
| `VITE_APP_NAME`           | Application display name                 | No       |
| `VITE_BABYLON_DEBUG`      | Enable Babylon.js debug layer            | No       |

---

## Deployment

### Backend (Docker on EC2)

- Dockerized Express.js application
- GitHub Actions CI/CD pipeline:
  - On push to `main`: build → test → deploy
  - Automated health checks post-deployment
- Running on port 8000

### Frontend (Vercel + Docker)

- **Staging:** [environmental-mapping-web-staging.vercel.app](https://environmental-mapping-web-staging.vercel.app)
- **Production:** Docker container on EC2
- GitHub Actions triggers Vercel preview deployments on PRs

### CI/CD Pipeline

```
Push to main
  → GitHub Actions
    → Lint + Typecheck + Test
    → Build Docker images
    → Push to container registry
    → Deploy backend to EC2
    → Deploy frontend to Vercel / EC2
    → Health check verification
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit with conventional commits (`feat:`, `fix:`, `chore:`, `docs:`)
4. Push to your branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request against `main`

### Branch Naming

- `feature/<description>` — New features
- `fix/<description>` — Bug fixes
- `chore/<description>` — Maintenance tasks
- `docs/<description>` — Documentation changes

### Commit Convention

```
feat: add evidence upload to samples
fix: resolve tag placement offset on large models
chore: update Mongoose to 8.1.3
docs: update API endpoints in README
```

### Code Standards

- TypeScript strict mode enabled
- ESLint + Prettier for formatting
- Conventional commits enforced
- Minimum test coverage for new features
- No `any` types without justification

---

## License

Proprietary — Internal use only.

---

<p align="center">Built with Babylon.js · React · Express · MongoDB</p>
