const { PrismaClient } = require('@prisma/client');
const { put, del } = require('@vercel/blob');
const crypto = require('crypto');
const fs = require('fs');

const prisma = new PrismaClient();

async function runMigration() {
    console.log('======================================================');
    console.log('🚀 Starting Vercel Blob Data Migration Job');
    console.log('This will find any files stored in the database fallback');
    console.log('and permanently upload them to Vercel Blob.\n');

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        console.error('❌ ERROR: BLOB_READ_WRITE_TOKEN is missing!');
        console.error('Please configure it before running this script.');
        process.exit(1);
    }

    try {
        const filesToMigrate = await prisma.uploadedFile.findMany({
            where: {
                provider: 'DATABASE',
                dataBase64: {
                    not: null,
                }
            },
        });

        if (filesToMigrate.length === 0) {
            console.log('✅ No database-stored files found. Everything is already on Vercel Blob!');
            console.log('You may now safely remove `dataBase64` from your prisma/schema.prisma.');
            process.exit(0);
        }

        console.log(`Found ${filesToMigrate.length} files to migrate to Vercel Blob...`);

        let successCount = 0;
        let failCount = 0;

        for (const file of filesToMigrate) {
            try {
                console.log(`Migrating ID: ${file.id} - ${file.filename}...`);
                const buffer = Buffer.from(file.dataBase64, 'base64');

                // Use exact same naming convention as storage.ts
                const cleanName = file.filename.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/^[._-]+|[._-]+$/g, '') || 'document';
                const uniquePrefix = `${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
                const category = file.category || 'GENERAL';
                const storagePath = `yantrahub/${category.toLowerCase()}/${uniquePrefix}_${cleanName}`;

                const blob = await put(storagePath, buffer, {
                    access: 'public',
                    contentType: file.mimeType || 'application/octet-stream',
                    addRandomSuffix: false,
                });

                // Update database record to point to the new blob
                await prisma.uploadedFile.update({
                    where: { id: file.id },
                    data: {
                        url: blob.url,
                        storageKey: blob.pathname || storagePath,
                        provider: 'VERCEL_BLOB',
                        dataBase64: null, // Clear out the massive string to reclaim DB space!
                    },
                });

                console.log(`✅ Success for ${file.id} -> ${blob.url}`);
                successCount++;
            } catch (uploadError) {
                console.error(`❌ Failed migrating ${file.id}:`, uploadError);
                failCount++;
            }
        }

        console.log('\n======================================================');
        console.log(`Migration Complete:`);
        console.log(`✅ ${successCount} files migrated to Vercel Blob`);
        if (failCount > 0) {
            console.log(`❌ ${failCount} files failed. Check logs.`);
        } else {
            console.log('\nAll files successfully migrated. You can now:');
            console.log('1. Remove `dataBase64   String?` from prisma/schema.prisma');
            console.log('2. Run `npx prisma db push` to drop the column from your database completely.');
        }
        console.log('======================================================');

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

runMigration();
