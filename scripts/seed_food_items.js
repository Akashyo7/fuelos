const fs = require('fs')
const { Client } = require('pg')

async function main() {
  const sql = fs.readFileSync('supabase/seed/food_items.sql', 'utf8')
  const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL
  if (!databaseUrl) {
    console.error('Please set DATABASE_URL or SUPABASE_DB_URL to your Supabase Postgres connection string.')
    process.exit(1)
  }

  const client = new Client({ connectionString: databaseUrl })
  await client.connect()
  try {
    await client.query(sql)
    console.log('Seed applied successfully')
  } catch (err) {
    console.error('Error applying seed:', err)
    process.exitCode = 1
  } finally {
    await client.end()
  }
}

main()
