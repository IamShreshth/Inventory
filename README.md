# BERM - Borrowing Equipment and Resources Management

A modern, full-stack inventory management system for tracking equipment, managing borrowing workflows, and streamlining institutional resource management.

## 🚀 Features

- **Asset Management** - Track equipment with QR codes, categories, and real-time availability
- **Borrowing Workflow** - Streamlined request, approval, and return process
- **Role-Based Access Control** - Support for Super Admin, Org Admin, BERM Incharge, Borrower, and Auditor roles
- **Dashboard & Analytics** - Comprehensive reporting and audit logs
- **Drop Box System** - Flexible equipment return system
- **Responsive Design** - Works seamlessly on desktop and mobile devices

## 📋 Tech Stack

### Backend
- **Node.js** with Express
- **SQLite** database
- **PASETO** tokens for authentication
- **Zod** for validation
- RESTful API architecture

### Frontend
- **React 19** with TypeScript
- **Vite** for fast builds
- **Tailwind CSS 4** for styling
- **React Query (TanStack)** for server state
- **Zustand** for client state
- **React Router 7** for routing

## 🛠️ Installation

### Prerequisites
- Node.js 18+ and npm

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/youngoat911/Inventory.git
cd Inventory
```

2. **Install backend dependencies**
```bash
npm install
```

3. **Install frontend dependencies**
```bash
cd frontend
npm install
cd ..
```

4. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=./database.db
JWT_SECRET=your-secret-key-here
JWT_EXPIRY=1h
REFRESH_TOKEN_EXPIRY=7d
```

5. **Run database migrations**
```bash
npm run db:migrate
```

## 🚀 Running the Application

### Development Mode (Frontend + Backend)

Run both frontend and backend concurrently:
```bash
npm run dev
```

This will start:
- Backend API on `http://localhost:5000`
- Frontend dev server on `http://localhost:3000`

### Backend Only
```bash
npm run dev:backend
```

### Frontend Only
```bash
npm run dev:frontend
```

### Production Mode

1. **Build the frontend**
```bash
npm run build
```

2. **Start the server**
```bash
NODE_ENV=production npm start
```

The application will be available at `http://localhost:5000`

In production mode, the backend serves the frontend build files automatically.

## 📱 Application Pages

### Public Pages
- **Landing Page** (`/`) - Marketing page with features overview
- **Login Page** (`/login`) - User authentication
- **Signup Page** (`/signup`) - New user registration

### Protected Pages (Requires Authentication)
- **Dashboard** (`/dashboard`) - Overview with statistics
- **Assets** (`/assets`) - Equipment inventory management
- **My Loans** (`/my-loans`) - Borrower's active loans
- **Issue Requests** (`/issues`) - Staff issue queue
- **Active Issues** (`/issues/active`) - Currently borrowed items
- **Overdue** (`/issues/overdue`) - Overdue items
- **Admin Pages** - Users, Categories, Locations, Vendors, etc.
- **Reports** (`/reports`) - Analytics and reporting
- **Audit Log** (`/audit-log`) - System audit trail

## 🔐 Default Roles

The system supports the following roles:
- **super_admin** - Full system access
- **org_admin** - Organization-level administration
- **berm_incharge** - Equipment management staff
- **borrower** - Can borrow equipment
- **auditor** - Read-only audit access

## 📝 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - User logout

### Assets
- `GET /api/v1/assets` - List all assets
- `POST /api/v1/assets` - Create new asset
- `GET /api/v1/assets/:id` - Get asset details
- `PUT /api/v1/assets/:id` - Update asset
- `DELETE /api/v1/assets/:id` - Delete asset

### Issues (Borrowing)
- `GET /api/v1/issues` - List issues
- `POST /api/v1/issues` - Create issue request
- `PATCH /api/v1/issues/:id/approve` - Approve issue
- `PATCH /api/v1/issues/:id/issue` - Issue equipment
- `PATCH /api/v1/issues/:id/return` - Return equipment

See `api.md` for complete API documentation.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

## 📦 Project Structure

```
inventory/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── store/           # Zustand state management
│   │   ├── api/             # API client functions
│   │   ├── types/           # TypeScript types
│   │   └── lib/             # Utilities
│   └── dist/                # Production build (gitignored)
│
├── src/                      # Backend source
│   ├── modules/             # Feature modules
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Express middleware
│   ├── db/                  # Database connection
│   └── shared/              # Shared utilities
│
├── migrations/              # Database migrations
├── tests/                   # Test files
└── server.js               # Entry point
```

## 🔧 Configuration

### Backend Configuration
Edit `.env` file for backend settings.

### Frontend Configuration
Edit `frontend/.env.example` and create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
```

## 📄 License

ISC

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ for efficient equipment management
