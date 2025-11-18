# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Family Evening** - An interactive event game web application optimized for mobile devices. Designed to support 40-100 concurrent users during live events (typically 4-hour sessions).

### Core Features

**User Side:**
- Name-based session entry (no registration required)
- Question submission form
- Interactive games with multiple-choice questions (4 options, 1 correct answer)

**Admin Side:**
- Event creation and management
- Game builder (questions + 4 answer options)
- Question moderation dashboard with starring capability for speaker
- Event-specific game assignment

## Technology Stack

- **Backend**: Node.js + Express
- **Frontend**: React + Vite
- **Database**: PostgreSQL
- **Deployment**: Docker / Docker Compose
- **Target Platform**: Mobile-optimized web application

## Project Structure

```
familyevening/
├── backend/               # Node.js/Express API server
│   ├── src/
│   │   ├── index.js      # Main server file with all endpoints
│   │   └── db.js         # PostgreSQL connection pool
│   └── database/
│       └── init.sql      # Database schema and initial data
├── frontend/             # React + Vite SPA
│   └── src/
│       ├── pages/        # Page components (Login, Home, Games, Admin, etc.)
│       ├── styles/       # Global CSS
│       └── App.jsx       # Main app with routing
├── docker-compose.yml    # Orchestrates postgres, backend, frontend
└── spec.md              # Original Ukrainian specification
```

### Key Architectural Considerations

1. **Session Management**: User sessions are temporary (≈4 hours), name-based without traditional authentication
2. **Real-time Requirements**: Support for 40-100 concurrent users requires efficient WebSocket or polling strategy
3. **Event Scoping**: All games and questions are scoped to specific events (multi-tenancy)
4. **Mobile-First**: UI/UX must prioritize mobile experience

## Development Commands

### Docker (Production)
```bash
docker-compose up -d          # Start all services
docker-compose down           # Stop all services
docker-compose logs -f        # View logs
```

### Local Development
```bash
# Start only PostgreSQL
docker-compose up -d postgres

# Install dependencies (from root)
npm install
cd backend && npm install
cd ../frontend && npm install

# Run backend (localhost:3000)
cd backend
npm run dev

# Run frontend (localhost:5173)
cd frontend
npm run dev

# Or run both simultaneously from root
npm run dev
```

### Database
```bash
# Access PostgreSQL shell
docker exec -it familyevening-db psql -U familyevening -d familyevening

# Reset database (WARNING: deletes all data)
docker-compose down -v
docker-compose up -d postgres
```

### Building
```bash
# Frontend production build
cd frontend && npm run build

# Backend runs directly (no build needed)
cd backend && npm start
```

## Database Schema

See `backend/database/init.sql` for full schema. Key tables:

- **events**: Event metadata (name, date)
- **user_sessions**: Temporary 4-hour user sessions (session_id, user_name, event_id, expires_at)
- **user_questions**: Questions submitted by users (question_text, stars for moderation)
- **games**: Games created by admin (name, description, is_active flag)
- **game_questions**: Questions within games (question_text, 4 options, correct_option, order_index)
- **game_answers**: User answers to game questions (tracks correctness)
- **admins**: Admin users (future use)

### Important Relationships
- Games belong to Events
- User sessions scoped to Events
- Questions scoped to Events
- Game answers linked to both game questions and user sessions

## API Architecture

All API endpoints are in `backend/src/index.js`:

### User Endpoints (require session)
- `POST /api/user/login` - Create session with name + eventId
- `GET /api/user/session` - Verify active session
- `POST /api/user/logout` - Destroy session
- `POST /api/user/questions` - Submit question
- `GET /api/user/games` - List active games for event
- `GET /api/user/games/:id/questions` - Get game questions (without correct answers)
- `POST /api/user/games/answer` - Submit answer, returns if correct
- `GET /api/user/games/:id/results` - Get user's game statistics

### Admin Endpoints (no auth currently)
- `GET /api/admin/events` - List all events
- `POST /api/admin/events` - Create event
- `GET /api/admin/events/:id/games` - List games for event
- `POST /api/admin/games` - Create game
- `PATCH /api/admin/games/:id/toggle` - Activate/deactivate game
- `GET /api/admin/games/:id/questions` - List game questions
- `POST /api/admin/games/:id/questions` - Add question to game
- `DELETE /api/admin/questions/:id` - Delete question
- `GET /api/admin/events/:id/user-questions` - View submitted questions
- `PATCH /api/admin/user-questions/:id/stars` - Update star rating

## Frontend Routes

- `/login` - LoginPage (select event, enter name)
- `/` - HomePage (main menu: ask question or play games)
- `/question` - QuestionPage (submit question form)
- `/games` - GamesPage (list of active games)
- `/games/:id` - GamePlayPage (play game with questions)
- `/admin/login` - AdminLoginPage (admin login: username `admin`, password `password`)
- `/admin` - AdminPage (protected, full admin panel with tabs)

## Key Implementation Details

- **Sessions**: express-session with 4-hour expiry, stored in memory (consider Redis for production scaling)
- **Ukrainian UI**: All user-facing text is in Ukrainian
- **Mobile-first CSS**: Touch-optimized buttons, responsive design in `frontend/src/styles/index.css`
- **User Authentication**: Name-only, no password required
- **Admin Authentication**: Simple frontend authentication with credentials stored in `AdminAuthContext`. Username: `admin`, Password: `password`. Auth state stored in localStorage.
- **CORS**: Allows all origins with credentials enabled (secure for HTTP, adjust for HTTPS production)
- **Game State**: Answers stored in database, allows resume after disconnect

### Admin Authentication Details
- Protected by `ProtectedAdminRoute` component
- Context: `AdminAuthContext` (`frontend/src/contexts/AdminAuthContext.jsx`)
- Login page: `AdminLoginPage` (`/admin/login`)
- Credentials hardcoded in frontend (for production, move to backend with proper password hashing)
- Logout clears localStorage and redirects to login
