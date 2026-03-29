# LeetCode Tracker

A fullstack interview prep tracker to replace a Google Spreadsheet. Track problems, progress, and notes across a 6-month study plan.

## Tech Stack

- **Frontend**: React 18 + Vite, TypeScript, TailwindCSS, React Query, React Router
- **Backend**: NestJS, TypeORM, TypeScript
- **Database**: SQLite (file-based via `better-sqlite3`, zero configuration)

## Prerequisites

- Node.js 18+
- npm 9+

## Installation

Install all dependencies in one step:

```bash
# From the repo root
npm run install:all
```

Or install manually:

```bash
npm install                # root (installs concurrently)
cd client && npm install   # React app
cd ../server && npm install # NestJS app
```

## Running in Development

```bash
# From the repo root — starts both client and server concurrently
npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:3000
- API base: http://localhost:5173/api (proxied to server)

The SQLite database file (`leetcode-tracker.sqlite`) is auto-created in the `server/` directory on first run.

## Seeding Sample Data

After starting the server at least once (to create the database), run:

```bash
npm run seed
# or: cd server && npm run seed
```

This creates:
- 6 categories: Arrays, Strings, Trees, Graphs, Dynamic Programming, Binary Search
- 8 tags: sliding-window, two-pointers, must-revisit, dfs, bfs, memoization, greedy, divide-and-conquer
- 18 sample problems with notes, tags, and varied statuses

The seed script is idempotent — it skips if data already exists.

## API Endpoints

All routes are prefixed with `/api`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/categories | List all categories with stats |
| POST | /api/categories | Create category |
| PATCH | /api/categories/:id | Update category |
| DELETE | /api/categories/:id | Delete category |
| GET | /api/problems | List problems (filterable) |
| GET | /api/problems/:id | Get single problem |
| POST | /api/problems | Create problem |
| PATCH | /api/problems/:id | Update problem |
| DELETE | /api/problems/:id | Delete problem |
| GET | /api/tags | List all tags |
| POST | /api/tags | Create tag |
| DELETE | /api/tags/:id | Delete tag |
| GET | /api/stats/overview | Overall + per-difficulty + per-category stats |

### Problem Filters (query params)

`GET /api/problems?category=Arrays&difficulty=Medium&status=Attempted&search=sum`

## Project Structure

```
leetcode-tracker/
├── package.json              # Root scripts (dev, install:all, seed)
├── client/                   # Vite + React
│   └── src/
│       ├── api/              # Axios API functions
│       ├── components/       # UI components
│       ├── hooks/            # React Query hooks
│       ├── pages/            # Route pages
│       └── types/            # Shared TypeScript types
└── server/                   # NestJS
    └── src/
        ├── categories/       # Category CRUD
        ├── problems/         # Problem CRUD
        ├── tags/             # Tag CRUD
        ├── stats/            # Aggregated stats
        ├── common/           # Global exception filter
        └── database/         # Seed script
```
