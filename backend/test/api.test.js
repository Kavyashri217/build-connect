const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { execSync } = require('node:child_process');

// Use a throwaway database, recreated and seeded before the tests run.
const backendDir = path.join(__dirname, '..');
process.env.DATABASE_URL = 'file:./test.db';
fs.rmSync(path.join(backendDir, 'prisma', 'test.db'), { force: true });
execSync('npx prisma migrate deploy && node prisma/seed.js', { cwd: backendDir, env: process.env, stdio: 'ignore' });

const { createApp } = require('../src/app');
const prisma = require('../src/db');

let server;
let base;

before(async () => {
  server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://localhost:${server.address().port}`;
});

after(async () => {
  server.close();
  await prisma.$disconnect();
});

const get = (p) => fetch(base + p);
const post = (p, body) =>
  fetch(base + p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

test('lists professionals sorted by rating', async () => {
  const res = await get('/api/professionals');
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.length, 8);
  assert.equal(data[0].name, 'Priya Sharma');
  assert.ok(Array.isArray(data[0].skills));
});

test('filters by search, specialization, experience and rating', async () => {
  const bySearch = await (await get('/api/professionals?q=bengaluru')).json();
  assert.deepEqual(bySearch.map((p) => p.name).sort(), ['Karthik Rao', 'Rajesh Kumar']);

  const bySpec = await (await get('/api/professionals?specialization=structural-engineer')).json();
  assert.ok(bySpec.length === 2 && bySpec.every((p) => p.specialization === 'Structural Engineer'));

  const byExp = await (await get('/api/professionals?experience=4-5')).json();
  assert.ok(byExp.length > 0 && byExp.every((p) => p.experienceYears >= 4 && p.experienceYears <= 5));

  const byRating = await (await get('/api/professionals?minRating=4.7&sort=rate-asc')).json();
  assert.ok(byRating.every((p) => p.rating >= 4.7));
  const rates = byRating.map((p) => p.hourlyRate);
  assert.deepEqual(rates, [...rates].sort((a, b) => a - b));

  const unknown = await (await get('/api/professionals?specialization=plumber')).json();
  assert.equal(unknown.length, 0);
});

test('returns a single professional with projects, or 404', async () => {
  const [first] = await (await get('/api/professionals')).json();
  const res = await get(`/api/professionals/${first.id}`);
  assert.equal(res.status, 200);
  const prof = await res.json();
  assert.equal(prof.name, first.name);
  assert.ok(Array.isArray(prof.projects));

  assert.equal((await get('/api/professionals/99999')).status, 404);
  assert.equal((await get('/api/professionals/abc')).status, 404);
});

test('creates an enquiry for a professional', async () => {
  const [first] = await (await get('/api/professionals')).json();
  const res = await post('/api/enquiries', {
    name: 'Test Client',
    email: 'client@example.com',
    message: 'I need help designing a two-storey house.',
    professionalId: String(first.id),
  });
  assert.equal(res.status, 201);
  const { id } = await res.json();
  const saved = await prisma.enquiry.findUnique({ where: { id } });
  assert.equal(saved.professionalId, first.id);
});

test('creates a general enquiry without a professional', async () => {
  const res = await post('/api/enquiries', { name: 'A', email: 'a@example.com', message: 'General question here.', professionalId: '' });
  assert.equal(res.status, 201);
});

test('rejects invalid enquiries with field errors', async () => {
  const res = await post('/api/enquiries', { name: '', email: 'not-an-email', phone: 'abc', message: 'short' });
  assert.equal(res.status, 400);
  const { errors } = await res.json();
  assert.deepEqual(Object.keys(errors).sort(), ['email', 'message', 'name', 'phone']);

  const missing = await post('/api/enquiries', {
    name: 'A', email: 'a@example.com', message: 'Long enough message.', professionalId: 99999,
  });
  assert.equal(missing.status, 400);
  assert.ok((await missing.json()).errors.professionalId);
});

test('rejects malformed JSON', async () => {
  const res = await fetch(`${base}/api/enquiries`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad' });
  assert.equal(res.status, 400);
});

test('serves frontend pages but not backend files', async () => {
  assert.equal((await get('/')).status, 200);
  assert.equal((await get('/professionals.html')).status, 200);
  assert.equal((await get('/profile.html')).status, 200);
  assert.equal((await get('/css/base.css')).status, 200);
  assert.equal((await get('/js/building.js')).status, 200);
  assert.equal((await get('/backend/package.json')).status, 404);
  assert.equal((await get('/backend/prisma/dev.db')).status, 404);
});
