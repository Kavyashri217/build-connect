const path = require('node:path');
const express = require('express');
const prisma = require('./db');

const SPECIALIZATIONS = ['Architect', 'Civil Engineer', 'Structural Engineer', 'Site Engineer'];

// Experience filter buckets used by the frontend dropdown.
const EXPERIENCE_RANGES = {
  '0-3': { lte: 3 },
  '4-5': { gte: 4, lte: 5 },
  '6+': { gte: 6 },
};

const SORTS = {
  rating: [{ rating: 'desc' }, { reviewCount: 'desc' }],
  experience: [{ experienceYears: 'desc' }],
  'rate-asc': [{ hourlyRate: 'asc' }],
  'rate-desc': [{ hourlyRate: 'desc' }],
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function serializeProfessional(prof) {
  return { ...prof, skills: prof.skills.split(',').map((s) => s.trim()).filter(Boolean) };
}

function str(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function validateEnquiry(body) {
  const errors = {};
  const enquiry = {
    name: str(body.name),
    email: str(body.email),
    phone: str(body.phone) || null,
    message: str(body.message),
    professionalId: body.professionalId == null || body.professionalId === '' ? null : Number(body.professionalId),
  };

  if (!enquiry.name) errors.name = 'Please enter your name.';
  else if (enquiry.name.length > 100) errors.name = 'Name must be 100 characters or fewer.';

  if (!EMAIL_RE.test(enquiry.email) || enquiry.email.length > 200) errors.email = 'Please enter a valid email address.';

  if (enquiry.phone && !/^[+\d][\d\s-]{6,19}$/.test(enquiry.phone)) errors.phone = 'Please enter a valid phone number.';

  if (enquiry.message.length < 10) errors.message = 'Message must be at least 10 characters.';
  else if (enquiry.message.length > 2000) errors.message = 'Message must be 2000 characters or fewer.';

  if (enquiry.professionalId !== null && !Number.isInteger(enquiry.professionalId)) {
    errors.professionalId = 'Invalid professional.';
  }

  return { enquiry, errors };
}

function createApp() {
  const app = express();
  app.use(express.json({ limit: '10kb' }));

  app.get('/api/professionals', async (req, res) => {
    const q = str(req.query.q);
    const specialization = str(req.query.specialization);
    const experience = str(req.query.experience);
    const minRating = Number(req.query.minRating);
    const sort = SORTS[str(req.query.sort)] ? str(req.query.sort) : 'rating';

    const where = {};
    if (q) {
      // SQLite's LIKE (used by `contains`) is case-insensitive for ASCII.
      where.OR = ['name', 'specialization', 'location', 'skills'].map((field) => ({ [field]: { contains: q } }));
    }
    if (specialization) {
      const match = SPECIALIZATIONS.find((s) => s.toLowerCase() === specialization.toLowerCase().replace(/-/g, ' '));
      // Unknown specialization: match nothing rather than ignoring the filter.
      where.specialization = match ?? '__none__';
    }
    if (EXPERIENCE_RANGES[experience]) where.experienceYears = EXPERIENCE_RANGES[experience];
    if (Number.isFinite(minRating) && minRating > 0) where.rating = { gte: minRating };

    const professionals = await prisma.professional.findMany({ where, orderBy: SORTS[sort] });
    res.json(professionals.map(serializeProfessional));
  });

  app.get('/api/professionals/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(404).json({ error: 'Professional not found.' });

    const professional = await prisma.professional.findUnique({
      where: { id },
      include: { projects: { orderBy: { year: 'desc' } } },
    });
    if (!professional) return res.status(404).json({ error: 'Professional not found.' });
    res.json(serializeProfessional(professional));
  });

  app.post('/api/enquiries', async (req, res) => {
    const { enquiry, errors } = validateEnquiry(req.body ?? {});

    if (enquiry.professionalId !== null && !errors.professionalId) {
      const exists = await prisma.professional.findUnique({ where: { id: enquiry.professionalId }, select: { id: true } });
      if (!exists) errors.professionalId = 'That professional no longer exists.';
    }
    if (Object.keys(errors).length) return res.status(400).json({ errors });

    const created = await prisma.enquiry.create({ data: enquiry });
    res.status(201).json({ id: created.id });
  });

  app.use('/api', (req, res) => res.status(404).json({ error: 'Not found.' }));

  // Serve the static frontend from the repo root. Only the public folders and pages
  // are exposed so the backend directory (database, .env) is never served.
  const root = path.join(__dirname, '..', '..');
  app.use('/css', express.static(path.join(root, 'css')));
  app.use('/js', express.static(path.join(root, 'js')));
  const pages = { '/': 'index.html', '/index.html': 'index.html', '/professionals.html': 'professionals.html', '/profile.html': 'profile.html' };
  for (const [route, file] of Object.entries(pages)) {
    app.get(route, (req, res) => res.sendFile(file, { root }));
  }

  app.use((err, req, res, next) => {
    const status = err.status || err.statusCode || 500;
    if (status >= 500) console.error(err);
    res.status(status).json({ error: status >= 500 ? 'Something went wrong.' : err.message });
  });

  return app;
}

module.exports = { createApp };
