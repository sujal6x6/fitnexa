// Generates admin.sql (an INSERT for your admin login). Run it against D1 with:
//   npx wrangler d1 execute fitnexa --remote --file=admin.sql      (or --local for local testing)
import { pbkdf2Sync, randomBytes, randomUUID } from 'node:crypto';
import { writeFileSync } from 'node:fs';
const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME = 'Owner' } = process.env;
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) { console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .dev.vars'); process.exit(1); }
if (ADMIN_PASSWORD.length < 10) { console.error('Use an admin password of at least 10 characters.'); process.exit(1); }
const iter = Math.min(100000, Math.max(1000, Number(process.env.PBKDF2_ITERATIONS) || 100000));
const salt = randomBytes(16);
const hash = `pbkdf2-sha512$${iter}$${salt.toString('base64')}$${pbkdf2Sync(ADMIN_PASSWORD, salt, iter, 64, 'sha512').toString('base64')}`;
const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
writeFileSync('admin.sql', `INSERT INTO admins (id, name, email, password_hash, is_active) VALUES (${q(randomUUID())}, ${q(ADMIN_NAME)}, ${q(ADMIN_EMAIL.toLowerCase())}, ${q(hash)}, 1)\n  ON CONFLICT(email) DO UPDATE SET password_hash = excluded.password_hash, name = excluded.name, is_active = 1;\n`);
console.log('Wrote admin.sql. Now run: npx wrangler d1 execute fitnexa --remote --file=admin.sql   (then delete admin.sql)');
