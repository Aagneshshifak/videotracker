# Student Progress Tracker

A comprehensive video-based learning management system that enables students to track their progress through organized course content while providing administrators with oversight capabilities.

## Features

- **Student Dashboard**: Track progress through video content organized in folders
- **Admin Dashboard**: Manage students, videos, and monitor progress
- **Role-based Access**: Separate interfaces for students and administrators
- **Progress Tracking**: Mark videos as complete and track completion status
- **Video Management**: Organize videos into structured folders (batches)

## Technology Stack

- **Frontend**: React 18 with TypeScript, Vite, Tailwind CSS
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with bcrypt password hashing
- **UI Components**: shadcn/ui built on Radix UI primitives

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with:
   ```
   DATABASE_URL=your_postgresql_connection_string
   SESSION_SECRET=your_session_secret_key
   ```

4. Set up the database:
   ```bash
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:8080`

### Default Admin Account

After setting up the database, you can create an admin account by making a POST request to `/api/admin/setup` or by creating a user with the "admin" role through the database.

## Project Structure

```
├── src/                    # Frontend React application
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── contexts/          # React contexts (Auth)
│   └── lib/               # Utilities and API client
├── server/                # Backend Express server
│   ├── db.ts             # Database connection
│   ├── storage.ts        # Data access layer
│   └── routes.ts         # API routes
├── shared/               # Shared types and schemas
└── scripts/              # Utility scripts
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/session` - Get current session

### Videos
- `GET /api/videos` - Get all videos (authenticated)
- `POST /api/videos` - Create video (admin only)
- `PATCH /api/videos/:id` - Update video (admin only)
- `DELETE /api/videos/:id` - Delete video (admin only)

### Progress
- `GET /api/progress` - Get user progress (authenticated)
- `POST /api/progress` - Update progress (authenticated)

### Admin
- `GET /api/admin/students` - Get all students (admin only)
- `GET /api/admin/students/:userId/progress` - Get student progress (admin only)
- `GET /api/admin/progress` - Get all progress data (admin only)

## Development

### Database Schema

The application uses the following main tables:
- `profiles` - User account information
- `user_roles` - Role-based access control
- `videos` - Course content organization
- `student_progress` - Completion tracking

### Building for Production

```bash
npm run build
```

The built application will be in the `dist/` directory.

## License

This project is licensed under the MIT License.