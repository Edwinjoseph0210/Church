# St. Mariam Thresia Church — Parish Management System & Digital Portal
**Syro-Malabar Catholic Church**

A complete, production-quality, full-stack website and comprehensive Parish Management System for **St. Mariam Thresia Church**, a parish of the **Syro-Malabar Catholic Church**.

---

## 1. Project Overview

This platform provides a complete digital presence and church administration system:
1. **Public Church Website**: Cinematic hero, parish history, mission, vision, dynamic Holy Qurbana schedules, announcements bulletin, upcoming liturgical events, photo gallery with lightbox, parish organizations catalog, contact form with spam protection, and location map.
2. **Parishioner Member Portal**: Dedicated member dashboard, personal profile management (with restricted field editing), domestic family household roster, secure document downloads, prayer request submissions with priest feedback, pastoral appointment scheduling, and parish broadcast notifications.
3. **Parish Administration & Governance Portal**: Enterprise SaaS-style console with role-based access control, census member management, family unit administration, dynamic Holy Qurbana timing editor, announcement publishing engine with audience targeting, event manager, photo gallery album creator, secure document repository, sacramental register archive, prayer petition review, appointment approval workflow, contact message inbox, Super Admin user management, activity/audit logs, and live parish settings.

---

## 2. Technology Stack

- **Frontend**:
  - React 19
  - TypeScript
  - Tailwind CSS v4
  - Lucide React Icons
  - Motion
  - Google Fonts (`Cinzel` display serif, `Plus Jakarta Sans` body, `Source Serif 4` prose)
- **Backend**:
  - Node.js & Express
  - TypeScript (`tsx`)
  - JSON Web Tokens (`jsonwebtoken`)
  - BCrypt (`bcryptjs`) for password hashing
- **Database & Persistence**:
  - Relational JSON database engine (`data/parish_db.json`) with atomic synchronization, typed foreign keys, relational mapping, and integrity validations.
- **Server Architecture**:
  - Unified full-stack server running on port `3000` via `server.ts` with Vite middlewares in development and static file serving in production.

---

## 3. User Roles & Access Control (RBAC)

The system enforces 5 distinct roles at both the API level and client level:

| Role | Permissions & Scope |
|---|---|
| `SUPER_ADMIN` | Full system access: manage users, assign roles, inspect activity logs, parish settings, plus all administrative features. |
| `PARISH_ADMIN` | Parish trustees and office administrators: manage census members, family households, announcements, events, gallery, documents, Holy Qurbana timings, and reports. |
| `PRIEST` | Pastoral office and parish vicar: review sacramental records, prayer petitions, manage pastoral appointments, view members and families. |
| `ORGANIZATION_COORDINATOR` | Manages only their assigned parish organization (e.g. SMYM Youth, Choir, Catechism), its events, announcements, and rosters. |
| `PARISH_MEMBER` | Accesses only own profile, own family records, authorized member documents, own prayer intentions, and appointment requests. |

### Strict Privacy Invariants
- A parishioner can **never** access another member's private data or family unit by tampering with URL IDs (tested and enforced via HTTP 403 Forbidden).
- Normal members cannot access the `/admin` portal or query `/api/sacramental-records`.
- Documents marked `MEMBERS_ONLY` or `ADMIN_ONLY` cannot be downloaded without authenticating with a verified authorization token.

---

## 4. Demo Accounts & Quick Switcher

For instant testing and evaluation, a **Demo Role Switcher** widget is available in the application (or via direct login):

| Role | Email / Identifier | Password | Access Scope |
|---|---|---|---|
| **Super Admin** | `admin@church.org` | `admin123` | Full System Access |
| **Parish Admin** | `parishadmin@church.org` | `parish123` | Trustee & Admin Console |
| **Parish Priest** | `priest@church.org` | `priest123` | Pastoral & Sacramental |
| **Youth Coordinator** | `youth@church.org` | `youth123` | St. Mariam Thresia Youth Movement |
| **Member John (Fam 1)** | `demo.member@church.org` or `DEMO-001` | `member123` | Member A (Bethlehem House) |
| **Member Thomas (Fam 2)** | `other.member@church.org` or `DEMO-010` | `member123` | Member B (Nazareth Villa) |

---

## 5. Canonical Identity & Placeholders

As required by church guidelines, all non-verified details use clearly marked editable placeholders that can be updated directly through **Admin Console → Parish Settings**:
- `[PARISH PRIEST NAME]`
- `[DIOCESE NAME]`
- `[CHURCH ADDRESS]`
- `[PHONE NUMBER]`
- `[EMAIL ADDRESS]`
- `[HOLY QURBANA TIMINGS]`
- `[PARISH HISTORY TO BE ADDED]`
- `[CHURCH LOCATION]`

When modified in Admin Settings, all placeholders update instantly across the public site header, footer, home page, and member portal.

---

## 6. Local Setup & Execution

### Prerequisites
- Node.js >= 18
- npm >= 9

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd <repository-folder>

# Install dependencies
npm install

# Start full-stack development server (Express backend + Vite frontend on port 3000)
npm run dev
```

### Environment Variables
Create a `.env` file based on `.env.example`:
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=st-mariam-thresia-parish-secret-key-2026
```

---

## 7. Automated Test Suite

A complete verification test suite is provided in `tests/security_tests.sh`:
```bash
bash tests/security_tests.sh
```

Tests verify:
1. Member A login and token validation.
2. Member A accessing own profile (HTTP 200).
3. Member A attempting to access Member B's profile (HTTP 403 Forbidden).
4. Member A accessing own family unit (HTTP 200).
5. Member A attempting to access Member B's family unit (HTTP 403 Forbidden).
6. Normal member attempting to access Sacramental records (HTTP 403 Forbidden).
7. Guest attempting to download member-only document (HTTP 403 Forbidden).
8. Member downloading authorized document (HTTP 200).
9. Member attempting to manage user roles (HTTP 403 Forbidden).
10. Organization coordinator updating assigned organization (HTTP 200).
11. Organization coordinator attempting to update another organization (HTTP 403 Forbidden).
12. Priest accessing canonical sacramental archives (HTTP 200).

---

## 8. Backup Recommendations & Security Considerations

1. **Database Backups**: The persistent relational store is located at `data/parish_db.json`. Schedule automated daily snapshots of this file.
2. **Audit Logging**: All sensitive mutations (sacramental record views, logins, member updates, role promotions) are permanently recorded in the audit log table (`/admin/activity-logs`).
3. **Password Security**: Passwords are cryptographically salted and hashed using bcrypt (10 rounds).
4. **HTTPS / TLS**: In production, ensure traffic is served behind an SSL/TLS terminating reverse proxy.
