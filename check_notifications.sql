-- 1) Funções relacionadas a notifications
SELECT n.nspname AS schema_name, p.proname AS function_name, pg_get_functiondef(p.oid) AS definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname IN ('create_notification','notify_task_insert','notify_task_status_change')
ORDER BY function_name;

-- 2) Triggers sobre admin_tasks (insert/status)
SELECT tg.tgname AS trigger_name,
       c.relname AS table_name,
       pg_get_triggerdef(tg.oid) AS definition
FROM pg_trigger tg
JOIN pg_class c ON tg.tgrelid = c.oid
WHERE c.relname = 'admin_tasks'
  AND tg.tgname IN ('trg_admin_tasks_notify_insert','trg_admin_tasks_notify_status');

-- 3) Verificar existência da tabela notifications e suas policies básicas
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_name = 'notifications';

-- Mostrar definições de políticas na tabela notifications (se houver)
SELECT policyname, policydef
FROM pg_policies
WHERE tablename = 'notifications';

-- 4) Procurar notificações recentes para o e-mail de teste
WITH profile AS (
  SELECT id, email FROM public.profiles WHERE email = 'wfss1982@gmail.com' LIMIT 1
)
SELECT n.id, n.user_id, p.email, n.title, n.message, n.entity_type, n.entity_id, n.is_read, n.created_at
FROM public.notifications n
JOIN profile p ON p.id = n.user_id
ORDER BY n.created_at DESC
LIMIT 50;

-- 5) Exibir as últimas 25 inserções na tabela admin_tasks para referência
SELECT id, title, created_by, assigned_to, status, created_at
FROM public.admin_tasks
ORDER BY created_at DESC
LIMIT 25;
