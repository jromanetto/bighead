/**
 * Script to run SQL migrations against Supabase
 * Usage: node scripts/run-migration.js [migration-file]
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables manually
const envPath = path.join(__dirname, '../apps/mobile/.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const SUPABASE_URL = envVars.EXPO_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

// Create admin client with service role
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration(sqlFile) {
  const sqlPath = path.resolve(sqlFile);

  if (!fs.existsSync(sqlPath)) {
    console.error(`SQL file not found: ${sqlPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, 'utf-8');
  console.log(`\n📦 Running migration: ${path.basename(sqlFile)}\n`);

  // Split SQL into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  let successCount = 0;
  let errorCount = 0;

  for (const statement of statements) {
    const preview = statement.substring(0, 60).replace(/\n/g, ' ');
    process.stdout.write(`  → ${preview}...`);

    try {
      const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });

      if (error) {
        // If exec_sql doesn't exist, the statement might still work via other means
        // Try a different approach for certain statements
        if (error.message.includes('function') || error.message.includes('does not exist')) {
          // Some statements can be executed via specific table operations
          console.log(' ⚠️  (skipped - needs manual execution)');
          continue;
        }
        throw error;
      }

      console.log(' ✅');
      successCount++;
    } catch (err) {
      console.log(` ❌ ${err.message || err}`);
      errorCount++;
    }
  }

  console.log(`\n📊 Results: ${successCount} succeeded, ${errorCount} failed\n`);

  if (errorCount > 0) {
    console.log('⚠️  Some statements failed. You may need to run them manually in Supabase Dashboard.\n');
  }
}

// Get migration file from args
const migrationFile = process.argv[2] || path.join(__dirname, '../supabase/migrations/003_game_results.sql');
runMigration(migrationFile);
