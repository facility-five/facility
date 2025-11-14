-- Migration: Event-driven notifications for Admin environment
-- Created: 2025-11-08

-- Functions run as SECURITY DEFINER to bypass RLS when inserting notifications

-- Helper: create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_title text,
  p_message text,
  p_type text,
  p_entity_type text,
  p_entity_id uuid
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.notifications(user_id, title, message, type, entity_type, entity_id, is_read)
  VALUES (p_user_id, COALESCE(p_title, ''), COALESCE(p_message, ''), p_type, p_entity_type, p_entity_id, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 1) Communications: notify SaaS Admins on insert
CREATE OR REPLACE FUNCTION public.notify_admins_new_communication()
RETURNS TRIGGER AS $$
DECLARE
  admin_rec RECORD;
BEGIN
  FOR admin_rec IN
    SELECT p.id AS user_id
    FROM public.profiles p
    WHERE p.role = 'Admin do SaaS'
  LOOP
    PERFORM public.create_notification(
      admin_rec.user_id,
      'Nuevo comunicado',
      COALESCE('Título: ' || NEW.title, 'Comunicado registrado'),
      'communications.new',
      'communication',
      NEW.id
    );
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_communications_notify_admins ON public.communications;
CREATE TRIGGER trg_communications_notify_admins
  AFTER INSERT ON public.communications
  FOR EACH ROW EXECUTE FUNCTION public.notify_admins_new_communication();

-- 2) Support Requests: notify assignee on assignment and requester on status changes
CREATE OR REPLACE FUNCTION public.notify_support_assignment_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.assigned_to IS DISTINCT FROM OLD.assigned_to AND NEW.assigned_to IS NOT NULL THEN
    PERFORM public.create_notification(
      NEW.assigned_to,
      'Solicitud asignada',
      COALESCE('Has sido asignado a la solicitud: ' || NEW.title, 'Nueva asignación de solicitud'),
      'support.assigned',
      'support_request',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_support_requests_notify_assignment ON public.support_requests;
CREATE TRIGGER trg_support_requests_notify_assignment
  AFTER UPDATE ON public.support_requests
  FOR EACH ROW EXECUTE FUNCTION public.notify_support_assignment_change();

CREATE OR REPLACE FUNCTION public.notify_support_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    -- Notify requester
    PERFORM public.create_notification(
      NEW.requester_user_id,
      'Estado de solicitud actualizado',
      COALESCE('La solicitud "' || NEW.title || '" cambió a: ' || NEW.status, 'Estado actualizado'),
      'support.status_changed',
      'support_request',
      NEW.id
    );
    -- Notify assignee if present
    IF NEW.assigned_to IS NOT NULL THEN
      PERFORM public.create_notification(
        NEW.assigned_to,
        'Estado de solicitud actualizado',
        COALESCE('La solicitud "' || NEW.title || '" cambió a: ' || NEW.status, 'Estado actualizado'),
        'support.status_changed',
        'support_request',
        NEW.id
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_support_requests_notify_status ON public.support_requests;
CREATE TRIGGER trg_support_requests_notify_status
  AFTER UPDATE ON public.support_requests
  FOR EACH ROW EXECUTE FUNCTION public.notify_support_status_change();

-- 3) Admin Tasks: notify assignee on insert and notify creator/assignee on status changes
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

DROP TRIGGER IF EXISTS trg_admin_tasks_notify_insert ON public.admin_tasks;
CREATE TRIGGER trg_admin_tasks_notify_insert
  AFTER INSERT ON public.admin_tasks
  FOR EACH ROW EXECUTE FUNCTION public.notify_task_insert();

CREATE OR REPLACE FUNCTION public.notify_task_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    -- Notify creator
    IF NEW.created_by IS NOT NULL THEN
      PERFORM public.create_notification(
        NEW.created_by,
        'Estado de tarea actualizado',
        COALESCE('La tarea "' || NEW.title || '" cambió a: ' || NEW.status, 'Estado actualizado'),
        'task.status_changed',
        'admin_task',
        NEW.id
      );
    END IF;
    -- Notify assignee
    IF NEW.assigned_to IS NOT NULL THEN
      PERFORM public.create_notification(
        NEW.assigned_to,
        'Estado de tarea actualizado',
        COALESCE('La tarea "' || NEW.title || '" cambió a: ' || NEW.status, 'Estado actualizado'),
        'task.status_changed',
        'admin_task',
        NEW.id
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_admin_tasks_notify_status ON public.admin_tasks;
CREATE TRIGGER trg_admin_tasks_notify_status
  AFTER UPDATE ON public.admin_tasks
  FOR EACH ROW EXECUTE FUNCTION public.notify_task_status_change();

-- Notes:
-- - Functions are SECURITY DEFINER to allow inserts into notifications regardless of actor.
-- - Titles/messages kept simple; can be localized later via app i18n.