const { Pool } = require('@neondatabase/serverless')
const fs = require('fs')

// Read .env.local file
const envFile = fs.readFileSync('.env.local', 'utf8')
const envLines = envFile.split('\n')
let databaseUrl = ''

for (const line of envLines) {
  if (line.startsWith('DATABASE_URL=')) {
    databaseUrl = line.substring('DATABASE_URL='.length).trim()
    // Remove quotes if present
    databaseUrl = databaseUrl.replace(/^["']|["']$/g, '')
    break
  }
}

if (!databaseUrl) {
  console.error('DATABASE_URL not found in .env.local')
  process.exit(1)
}

const pool = new Pool({ connectionString: databaseUrl })

async function checkData() {
  try {
    console.log('Connecting to database...')
    
    // Check what's in the database
    const result = await pool.query(`
      SELECT 
        id,
        person_id,
        major_luck_cycles,
        pg_typeof(major_luck_cycles) as data_type
      FROM personal_analysis
      ORDER BY analyzed_at DESC
      LIMIT 1
    `)
    
    if (result.rows.length === 0) {
      console.log('No analysis records found')
      return
    }
    
    const record = result.rows[0]
    console.log('\n=== Database Record ===')
    console.log('ID:', record.id)
    console.log('Person ID:', record.person_id)
    console.log('Data Type:', record.data_type)
    console.log('\nMajor Luck Cycles (raw):')
    console.log(JSON.stringify(record.major_luck_cycles, null, 2))
    
    if (record.major_luck_cycles) {
      console.log('\nIs Array?', Array.isArray(record.major_luck_cycles))
      console.log('Length:', record.major_luck_cycles?.length)
      
      if (Array.isArray(record.major_luck_cycles) && record.major_luck_cycles.length > 0) {
        console.log('\nFirst item structure:')
        console.log(JSON.stringify(record.major_luck_cycles[0], null, 2))
        console.log('\nField names:', Object.keys(record.major_luck_cycles[0]))
      }
    } else {
      console.log('\n⚠️ major_luck_cycles is NULL or empty')
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await pool.end()
  }
}

checkData()
