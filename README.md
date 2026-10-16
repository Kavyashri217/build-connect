# BuildConnect

BuildConnect helps property owners and developers find and contact verified architects and civil engineers. Visitors can browse professionals, filter by specialization, experience and rating, view detailed profiles with past projects, and send an enquiry directly to a professional or to the BuildConnect team.

## Tech stack

- **Frontend:** plain HTML, CSS and JavaScript (`index.html`, `professionals.html`, `profile.html`, `css/`, `js/`)
- **Backend:** Node.js + [Express 5](https://expressjs.com/) (`backend/src/`)
- **Database:** SQLite through [Prisma ORM](https://www.prisma.io/) (`backend/prisma/`)

The Express server serves both the API and the frontend pages, so there is only one thing to run.

## Getting started

Requires Node.js 20 or newer.

```bash
git clone https://github.com/Kavyashri217/build-connect.git
cd build-connect
npm install                                   # installs backend deps and generates the Prisma client
cp backend/.env.example backend/.env          # local SQLite database settings
npm run setup                                 # creates the database and loads sample professionals
npm start                                     # http://localhost:3000
```

Use `npm run dev` instead of `npm start` to restart the server automatically when files change.

Re-running `npm run setup` re-seeds the database, which **deletes all existing professionals and enquiries**.

## API

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/professionals` | List professionals. Query params: `q` (search name, specialization, skills, city), `specialization` (`architect`, `civil-engineer`, `structural-engineer`, `site-engineer`), `experience` (`0-3`, `4-5`, `6+`), `minRating`, `sort` (`rating`, `experience`, `rate-asc`, `rate-desc`). |
| `GET` | `/api/professionals/:id` | A single professional, including their past projects. |
| `POST` | `/api/enquiries` | Send an enquiry. JSON body: `name`, `email`, `message`, optional `phone` and `professionalId`. Returns `201` or `400` with per-field `errors`. |

## Project structure

```
├── index.html            Landing page: dream picker, scroll-built journey, contact form
├── professionals.html    Search and filter professionals ("site pass" cards)
├── profile.html          Professional profile and enquiry form
├── css/
│   ├── base.css          Design tokens, type, buttons, nav, footer skyline
│   ├── building.css      Blueprint / finished / under-construction drawings
│   ├── components.css    Forms, chips, site-pass cards, directory
│   ├── home.css          Landing hero and scroll journey
│   ├── sections.css      Landing crew, featured, stories and start sections
│   └── profile.css       Profile page
├── js/
│   ├── api.js            Fetch helpers, card markup and enquiry form handling
│   ├── building.js       Procedural building drawings
│   ├── home.js           Landing page interactions
│   ├── script.js         Navigation, scroll meter, reveals, stars
│   ├── skyline.js        Interactive footer skyline
│   └── celebrate.js      Confetti and "approved" stamp
└── backend/
    ├── prisma/           Schema, migrations and seed data
    ├── src/              Express app (app.js) and entry point (server.js)
    └── test/             API tests (node:test)
```

## Tests

```bash
npm test
```

The tests use a separate throwaway database (`backend/prisma/test.db`), so they never touch your development data.

## Roadmap

- Professional sign-up and login so engineers can manage their own profiles
- Client reviews and ratings
- Email notifications when an enquiry arrives
- Dashboard for professionals to view and reply to enquiries
