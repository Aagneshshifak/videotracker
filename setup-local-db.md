# Local Database Setup Guide

## Option 1: Local PostgreSQL (Recommended for Development)

1. **Install PostgreSQL locally:**
   - macOS: `brew install postgresql`
   - Ubuntu/Debian: `sudo apt-get install postgresql postgresql-contrib`
   - Windows: Download from https://www.postgresql.org/download/

2. **Create a database:**
   ```bash
   # Start PostgreSQL service
   brew services start postgresql  # macOS
   # or
   sudo systemctl start postgresql  # Linux

   # Create database and user
   createdb videotracker
   psql videotracker
   ```

3. **Set environment variables:**
   Create a `.env` file in the project root:
   ```
   DATABASE_URL=postgresql://your_username@localhost:5432/videotracker
   SESSION_SECRET=your-super-secret-session-key-change-in-production
   NODE_ENV=development
   ```

4. **Run database migrations:**
   ```bash
   npm run db:push
   ```

## Option 2: Docker PostgreSQL

1. **Run PostgreSQL in Docker:**
   ```bash
   docker run --name videotracker-postgres \
     -e POSTGRES_DB=videotracker \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=password \
     -p 5432:5432 \
     -d postgres:15
   ```

2. **Set environment variables:**
   ```
   DATABASE_URL=postgresql://postgres:password@localhost:5432/videotracker
   SESSION_SECRET=your-super-secret-session-key-change-in-production
   NODE_ENV=development
   ```

3. **Run database migrations:**
   ```bash
   npm run db:push
   ```

## Option 3: Neon (Cloud PostgreSQL)

1. **Sign up at https://neon.tech**
2. **Create a new project**
3. **Copy the connection string**
4. **Set environment variables:**
   ```
   DATABASE_URL=your_neon_connection_string
   SESSION_SECRET=your-super-secret-session-key-change-in-production
   NODE_ENV=development
   ```

5. **Run database migrations:**
   ```bash
   npm run db:push
   ```

## After Setup

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Create an admin user:**
   Make a POST request to `/api/admin/setup` or create a user with admin role through the database.

## Troubleshooting

- Make sure PostgreSQL is running
- Check that the DATABASE_URL is correct
- Ensure the database exists
- Verify network connectivity to the database
