import pg from 'pg';
const { Client } = pg;

const dbUrl = process.env.DB_URL;
if (!dbUrl) {
  console.error('ERROR: set DB_URL env var to Postgres connection string');
  process.exit(1);
}

const client = new Client({ connectionString: dbUrl });

const sql = `
CREATE OR REPLACE FUNCTION public.notify_task_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify assignee if present
  IF NEW.assigned_to IS NOT NULL THEN
    PERFORM public.create_notification(
      NEW.assigned_to,
      'Nueva tarea asignada',
      COALESCE('Has recibido la tarea: ' || NEW.title, 'Tarea asignada'),
      'task.assigned',
      'admin_task',
      NEW.id
    );
  END IF;

  -- Notify creator only if different from assignee to avoid duplicate notifications
  IF NEW.created_by IS NOT NULL AND (NEW.created_by IS DISTINCT FROM NEW.assigned_to) THEN
    PERFORM public.create_notification(
      NEW.created_by,
      'Tarea creada',
      COALESCE('Se creó la tarea: ' || NEW.title, 'Tarea creada'),
      'task.created',
      'admin_task',
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
`;

async function run() {
  try {
    await client.connect();
    await client.query(sql);
    console.log('notify_task_insert function replaced successfully.');
  } catch (err) {
    console.error('Failed to apply function:', err.message);
    process.exit(2);
  } finally {
    await client.end();
  }
}

run();
