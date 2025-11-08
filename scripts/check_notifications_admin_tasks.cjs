const { Client } = require('pg');

const q = `WITH profile AS (
  SELECT id FROM public.profiles WHERE email = 'wfss1982@gmail.com' LIMIT 1
)
SELECT n.id, n.user_id, n.title, n.message, n.entity_type, n.entity_id, n.is_read, n.created_at
FROM public.notifications n
JOIN profile p ON p.id = n.user_id
WHERE n.entity_type = 'admin_task'
ORDER BY n.created_at DESC
LIMIT 50;`;

async function run() {
  const dbUrl = process.env.DB_URL;
  if (!dbUrl) {
    console.error('Missing DB_URL');
    process.exit(2);
  }
  const client = new Client({ connectionString: dbUrl });
  await client.connect();
  try {
    const res = await client.query(q);
    console.log(JSON.stringify({ rowCount: res.rowCount, rows: res.rows }, null, 2));
  } catch (err) {
    console.error('Query error', err.message);
  } finally {
    await client.end();
  }
}

run().catch(err => { console.error(err); process.exit(1); });
