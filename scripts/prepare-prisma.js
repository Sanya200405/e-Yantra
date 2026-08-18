const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
if (fs.existsSync(schemaPath)) {
  let schema = fs.readFileSync(schemaPath, 'utf8');
  const dbUrl = process.env.DATABASE_URL || '';
  const isPostgres = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://');
  const targetProvider = isPostgres ? 'postgresql' : 'sqlite';

  console.log(`[Prisma Config] Configuring provider "${targetProvider}" (PostgreSQL detected: ${isPostgres})`);
  schema = schema.replace(/provider\s*=\s*"(sqlite|postgresql)"/, `provider = "${targetProvider}"`);
  fs.writeFileSync(schemaPath, schema);
}
