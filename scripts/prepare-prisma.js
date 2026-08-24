const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
if (fs.existsSync(schemaPath)) {
  let schema = fs.readFileSync(schemaPath, 'utf8');
  const dbUrl = process.env.DATABASE_URL || '';
  
  if (process.env.NODE_ENV === 'production' && !dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
    console.warn('\n======================================================');
    console.warn('⚠️  WARNING: Production deployment detected but DATABASE_URL');
    console.warn('is not pointing to PostgreSQL. Using SQLite on a platform like Vercel');
    console.warn('WILL cause catastrophic data loss upon server recycle!');
    console.warn('======================================================\n');
  }

  const isPostgres = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://');
  const targetProvider = isPostgres ? 'postgresql' : 'sqlite';

  console.log(`[Prisma Config] Configuring provider "${targetProvider}" (PostgreSQL detected: ${isPostgres})`);
  schema = schema.replace(/provider\s*=\s*"(sqlite|postgresql)"/, `provider = "${targetProvider}"`);
  fs.writeFileSync(schemaPath, schema);
}
