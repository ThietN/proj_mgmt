import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL || "", {
    ssl: 'require',
});

async function migrate() {
    console.log('🚀 Starting database migrations...');

    try {
        // 1. Create migration log table if not exists
        await sql`
            CREATE TABLE IF NOT EXISTS _migrations_log (
                id SERIAL PRIMARY KEY,
                filename TEXT UNIQUE NOT NULL,
                applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `;

        const migrationsDir = path.join(process.cwd(), 'migrations');
        const files = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort();

        for (const file of files) {
            const [alreadyApplied] = await sql`
                SELECT filename FROM _migrations_log WHERE filename = ${file}
            `;

            if (alreadyApplied) {
                console.log(`- Skipping ${file} (already applied)`);
                continue;
            }

            console.log(`+ Applying ${file}...`);
            const content = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
            
            // Execute the SQL file
            // Note: This approach handles one file as one block. 
            // If you have multiple statements that need individual handling, 
            // the logic might need splitting, but usually postgres() handles it.
            await sql.unsafe(content);

            await sql`
                INSERT INTO _migrations_log (filename) VALUES (${file})
            `;
            console.log(`  ✓ ${file} applied successfully`);
        }

        console.log('✅ Migrations complete.');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await sql.end();
    }
}

migrate();
