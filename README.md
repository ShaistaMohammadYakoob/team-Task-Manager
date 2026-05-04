# Team Task Manager

Team Task Manager is a project workspace for small teams to plan projects, assign work, and track progress on a Kanban board. The app uses Express and MongoDB for the API, with a React and Tailwind interface served by the same backend in production.

## Features

- JWT access and refresh token flow with logout invalidation
- Admin/member access control
- Admin panel for user search, permissions, and team designations
- Project membership with owner and project-admin controls
- Drag-and-drop Kanban board for task status changes
- Dashboard cards, recent activity, and upcoming task preview
- Team roles such as Frontend Developer, QA Tester, Task Manager, and Project Manager
- Profile editing and password changes
- Light, dark, and system theme support
- Responsive UI with loading and empty states

## Project Structure

```txt
/server
  /models
  /routes
  /controllers
  /middleware
  /config
  server.js

/client
  /src/components
  /src/pages
  /src/context
  /src/hooks
  /src/api
  /src/utils
```

## Environment Variables

Copy `.env.example` to `.env` for local development:

```bash
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/team-task-manager
JWT_SECRET=replace-with-a-long-random-access-secret
JWT_REFRESH_SECRET=replace-with-a-long-random-refresh-secret
NODE_ENV=development
CLIENT_URL=http://localhost:5173
PROD_CLIENT_URL=https://your-railway-app.up.railway.app
```

The first registered user is automatically created as `admin`; later signups are `member`.

## Local Setup

```bash
npm run install:all
npm run dev
```

Client: `http://localhost:5173`
Server: `http://localhost:5000`
Health check: `http://localhost:5000/api/health`

## Production Build

```bash
npm run build
npm start
```

In production, Express serves the React build from `client/dist`.

## API Summary

Auth:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `PATCH /api/auth/me`
- `PATCH /api/auth/password`

Users, admin only:

- `GET /api/users`
- `GET /api/users/:id`
- `PATCH /api/users/:id`
- `DELETE /api/users/:id`

Projects:

- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:id`
- `PATCH /api/projects/:id`
- `DELETE /api/projects/:id`
- `POST /api/projects/:id/members`
- `DELETE /api/projects/:id/members/:userId`

Tasks:

- `GET /api/tasks?projectId=&status=&assignee=&priority=`
- `POST /api/tasks`
- `GET /api/tasks/:id`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`

Errors use:

```json
{ "error": "message" }
```

## Railway Deploy

1. Push this repo to GitHub.
2. Create a new Railway project from the GitHub repo.
3. Add a MongoDB service or provide a MongoDB Atlas connection string.
4. Set Railway variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `NODE_ENV=production`
   - `PROD_CLIENT_URL=https://your-railway-app.up.railway.app`
5. Railway uses `railway.toml` to run `npm run build`, start with `npm start`, and health check `/api/health`.

## Validation And Access

- Passwords must be at least 8 characters and include a number.
- Emails are validated on client and server.
- Project titles are required and capped at 80 characters.
- Task due dates cannot be in the past on creation.
- Unauthenticated requests return `401`.
- Unauthorized requests return `403`.
