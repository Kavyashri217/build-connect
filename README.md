# BuildConnect

BuildConnect is a construction-services marketplace that connects property owners and developers with verified architects, civil engineers, structural engineers, and site engineers. Clients can browse professionals, filter by specialization and experience, compare profiles, and send enquiries directly.

## Overview

The project combines a lightweight static frontend with a Node.js + Express API and SQLite database powered by Prisma. The backend serves the UI pages and exposes the professional directory and enquiry endpoints.

## Features

- Browse and search professionals by name, specialization, location, and skills
- Filter by trade, experience, minimum rating, and price
- View detailed professional profiles with past projects and qualifications
- Submit enquiry forms with validation
- Seed sample data and reset the database locally with a single command

## Tech stack

- Frontend: HTML, CSS, and JavaScript
- Backend: Node.js + Express
- Database: SQLite with Prisma ORM
- Testing: Node.js built-in test runner

## Project structure

```text
.
├── index.html                Landing page and contact form
├── professionals.html        Directory with search and filters
├── profile.html              Detailed professional profile page
├── css/                     Frontend styles
│   └── ...
├── js/                      Frontend scripts
│   ├── api.js               API helpers and enquiry logic
│   ├── script.js            UI interactions and page behavior
│   └── skyline.js           Animated skyline footer
├── backend/
│   ├── .env.example         Sample environment values
│   ├── package.json         Backend scripts and dependencies
│   ├── prisma/
│   │   ├── schema.prisma     Database schema
│   │   ├── migrations/      Prisma migration history
│   │   └── seed.js          Seed data for professionals and projects
│   └── src/
│       ├── app.js           Express app and route definitions
│       ├── db.js            Prisma client setup
│       └── server.js        HTTP server bootstrap
├── package.json             Root scripts for setup and running the app
├── package-lock.json
├── README.md
└── .gitignore
```

## Getting started

Requirements:

- Node.js 20 or newer
- npm

Install and start the app:

```bash
git clone https://github.com/Kavyashri217/build-connect.git
cd build-connect
npm install
cp backend/.env.example backend/.env
npm run setup
npm start
```

Then open:

- http://localhost:3000/
- http://localhost:3000/professionals.html

### Development mode

```bash
npm run dev
```

This runs the backend with Node's watch mode so the server restarts when files change.

## Database setup

The project uses Prisma with SQLite. The setup command creates or updates the database and seeds it with sample professionals:

```bash
npm run setup
```

This runs:

```bash
npm --prefix backend run db:setup
```

The database reset operation removes existing professional and enquiry data before repopulating it with seed data.

## API

### GET /api/professionals

Returns a list of professionals. Supports query parameters:

- q: text search across name, specialization, location, and skills
- specialization: architect, civil-engineer, structural-engineer, or site-engineer
- experience: 0-3, 4-5, or 6+
- minRating: minimum rating threshold
- sort: rating, experience, rate-asc, or rate-desc

### GET /api/professionals/:id

Returns a single professional profile, including their past projects.

### POST /api/enquiries

Creates an enquiry for a professional or general project request.

Request body:

```json
{
  "name": "Asha Patel",
  "email": "asha@example.com",
  "phone": "+91 98765 43210",
  "message": "We need a structural engineer for a 3-storey residential project.",
  "professionalId": 1
}
```

Validation errors are returned with a 400 status if the payload is invalid.

## Scripts

From the project root:

```bash
npm install      # installs root dependencies and backend dependencies
npm run setup    # applies Prisma migrations and seeds the database
npm start        # starts the backend server
npm run dev      # starts the backend in watch mode
npm test         # runs backend tests
```

## Notes

- The Express server serves the static frontend files from the repository root.
- The backend directory is not exposed publicly; only the CSS, JS, and HTML pages are served.
- The app is designed for local development and demo use, with SQLite as the default database.

## Roadmap

- Professional sign-up and login
- Client reviews and ratings
- Email notifications for new enquiries
- Dedicated dashboard for professionals to manage enquiries

