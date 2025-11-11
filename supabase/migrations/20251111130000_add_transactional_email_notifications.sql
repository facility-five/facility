-- Migration: Add transactional email notifications via Resend
-- Created: 2025-11-11
-- Description: Adds Edge Function integration for sending communication notification emails

-- Function to send email notification to residents
CREATE OR REPLACE FUNCTION public.send_communication_email_notification(
  resident_email TEXT,
  resident_name TEXT,
  communication_title TEXT,
  communication_content TEXT,
  communication_priority TEXT,
  condominium_name TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  email_sent BOOLEAN := FALSE;
BEGIN
  -- Only send email if resident has email configured and notifications enabled
  IF resident_email IS NOT NULL AND trim(resident_email) != '' THEN
    -- Call Supabase Edge Function for sending transactional email
    PERFORM public.http((
      'POST',
      current_setting('app.supabase_url', true) || '/functions/v1/send-communication-notification',
      '{"Content-Type": "application/json", "Authorization": "Bearer " || current_setting('app.supabase_anon_key', true)}',
      jsonb_build_object(
        'email', resident_email,
        'residentName', resident_name,
        'title', communication_title,
        'content', communication_content,
        'priority', communication_priority,
        'condominiumName', condominium_name
      )::text
    ));
    
    email_sent := TRUE;
  END IF;
  
  RETURN email_sent;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the whole transaction
    RAISE WARNING 'Failed to send email notification: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Enhanced function to notify residents with email support
CREATE OR REPLACE FUNCTION public.notify_residents_new_communication()
RETURNS TRIGGER AS $$
DECLARE
  resident_rec RECORD;
  condo_name TEXT;
  communication_priority TEXT;
  email_result BOOLEAN;
BEGIN
  -- Get condominium name
  SELECT name INTO condo_name
  FROM public.condos 
  WHERE id = NEW.condo_id;
  
  -- Set default priority if not provided
  communication_priority := COALESCE(NEW.priority, 'medium');
  
  -- Notify all residents of the condominium
  FOR resident_rec IN
    SELECT DISTINCT 
      r.profile_id,
      r.full_name,
      r.email,
      rs.email_notifications,
      rs.communication_notifications
    FROM public.residents r
    LEFT JOIN public.resident_settings rs ON rs.resident_id = r.profile_id
    WHERE r.condo_id = NEW.condo_id
      AND r.profile_id IS NOT NULL
      AND r.deleted_at IS NULL
      AND (r.status = 'active' OR r.status = 'Ativo')
  LOOP
    -- Create in-app notification
    PERFORM public.create_notification(
      resident_rec.profile_id,
      'Nuevo comunicado',
      COALESCE('Título: ' || NEW.title, 'Nuevo comunicado disponible'),
      'communication.new',
      'communication',
      NEW.id
    );
    
    -- Send email notification if enabled
    IF COALESCE(resident_rec.email_notifications, TRUE) = TRUE 
       AND COALESCE(resident_rec.communication_notifications, TRUE) = TRUE 
       AND resident_rec.email IS NOT NULL 
       AND trim(resident_rec.email) != '' THEN
       
      email_result := public.send_communication_email_notification(
        resident_rec.email,
        COALESCE(resident_rec.full_name, 'Residente'),
        NEW.title,
        NEW.content,
        communication_priority,
        COALESCE(condo_name, 'Seu Condomínio')
      );
      
      -- Log successful email sending (optional)
      IF email_result THEN
        RAISE NOTICE 'Email notification sent to: %', resident_rec.email;
      END IF;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.send_communication_email_notification(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.notify_residents_new_communication() TO authenticated;

-- Add comments
COMMENT ON FUNCTION public.send_communication_email_notification(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) 
IS 'Envia email transacional via Resend para notificar morador sobre novo comunicado';

COMMENT ON FUNCTION public.notify_residents_new_communication() 
IS 'Notifica moradores via app + email quando um novo comunicado é criado (versão com Resend)';

-- Note: The http extension needs to be enabled for this to work
-- If not already enabled, uncomment the line below:
-- CREATE EXTENSION IF NOT EXISTS http;