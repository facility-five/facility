import pg from 'pg';
const { Client } = pg;

const dbUrl = process.env.DB_URL;
    if (!dbUrl) {
      console.error('ERROR: set DB_URL environment variable to your Postgres connection string (DB_URL)');
      process.exit(1);
    }

    const client = new Client({ connectionString: dbUrl });

    const queries = {
      functions: `SELECT n.nspname AS schema_name, p.proname AS function_name, pg_get_functiondef(p.oid) AS definition
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE p.proname IN ('create_notification','notify_task_insert','notify_task_status_change')
    ORDER BY function_name;`,

      triggers: `SELECT tg.tgname AS trigger_name,
           c.relname AS table_name,
           pg_get_triggerdef(tg.oid) AS definition
    FROM pg_trigger tg
    JOIN pg_class c ON tg.tgrelid = c.oid
    WHERE c.relname = 'admin_tasks'
      AND tg.tgname IN ('trg_admin_tasks_notify_insert','trg_admin_tasks_notify_status');`,

      notifications_for_email: `WITH profile AS (
      SELECT id, email FROM public.profiles WHERE email = 'wfss1982@gmail.com' LIMIT 1
    )
    SELECT n.id, n.user_id, p.email, n.title, n.message, n.entity_type, n.entity_id, n.is_read, n.created_at
    FROM public.notifications n
    JOIN profile p ON p.id = n.user_id
    ORDER BY n.created_at DESC
    LIMIT 50;`,

      notifications_columns: `SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'notifications'
    ORDER BY ordinal_position;`,

      recent_tasks: `SELECT id, title, created_by, assigned_to, status, created_at
    FROM public.admin_tasks
    ORDER BY created_at DESC
    LIMIT 25;`
    };

    async function run() {
      try {
        await client.connect();
        const out = {};
        for (const [k, q] of Object.entries(queries)) {
          try {
            const res = await client.query(q);
            out[k] = { rowCount: res.rowCount, rows: res.rows };
          } catch (err) {
            out[k] = { error: err.message };
          }
        }
        console.log(JSON.stringify(out, null, 2));

        // If notifications table is missing expected columns, attempt to apply a safe schema fix
        const cols = (out.notifications_columns && out.notifications_columns.rows) || [];
        const colNames = cols.map(c => c.column_name);
        const missing = ['type','entity_type','entity_id','severity'].filter(c => !colNames.includes(c));
        if (missing.length > 0) {
          console.log('\nDetected missing notification columns:', missing.join(', '));
          console.log('Applying schema fixes (ALTER TABLE ADD COLUMN ...)');
          const fixSql = `BEGIN;
    ALTER TABLE public.notifications
      ADD COLUMN IF NOT EXISTS type text,
      ADD COLUMN IF NOT EXISTS entity_type text,
      ADD COLUMN IF NOT EXISTS entity_id text,
      ADD COLUMN IF NOT EXISTS severity text DEFAULT 'info';
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'notifications_severity_check'
      ) THEN
        ALTER TABLE public.notifications
          ADD CONSTRAINT notifications_severity_check CHECK (severity IN ('info','success','warning','error'));
      END IF;
    END;
    $$;
    CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);
    CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON public.notifications(created_at);
    COMMIT;`;

          try {
            await client.query(fixSql);
            console.log('Schema fix applied. Re-running verification queries...');
            const out2 = {};
            for (const [k, q] of Object.entries(queries)) {
              try {
                const res = await client.query(q);
                out2[k] = { rowCount: res.rowCount, rows: res.rows };
              } catch (err) {
                out2[k] = { error: err.message };
              }
            }
            console.log('\n=== After schema fix ===\n');
            console.log(JSON.stringify(out2, null, 2));
          } catch (err) {
            console.error('Failed to apply schema fix:', err.message);
          }
        }
      } catch (err) {
        console.error('Connection error:', err.message);
        process.exit(2);
      } finally {
        try { await client.end(); } catch (_) {}
      }
    }

    run();
