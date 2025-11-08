import pg from 'pg';
const { Client } = pg;

const dbUrl = process.env.DB_URL;
const profileId = process.env.PROFILE_ID;
if (!dbUrl || !profileId) {
  console.error('ERROR: set DB_URL and PROFILE_ID environment variables');
  process.exit(1);
}

const client = new Client({ connectionString: dbUrl });

async function run() {
  try {
    await client.connect();
    const insertSql = `INSERT INTO public.admin_tasks (title, description, created_by, assigned_to)
VALUES ($1, $2, $3, $4) RETURNING id, created_at;`;
    const title = 'Automated test: gerar notificação';
    const desc = 'Teste automático para validar trigger e notifications';
    const res = await client.query(insertSql, [title, desc, profileId, profileId]);
    const taskId = res.rows[0].id;
    console.log('Inserted task id:', taskId);

    // Query notifications for this task
    const q = `SELECT id, user_id, title, message, type, entity_type, entity_id, is_read, created_at
FROM public.notifications
WHERE entity_type = 'admin_task' AND entity_id = $1
ORDER BY created_at DESC`;
    const nots = await client.query(q, [taskId]);
    console.log('Notifications for inserted task:', JSON.stringify(nots.rows, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(2);
  } finally {
    try { await client.end(); } catch (_) {}
  }
}

run();
