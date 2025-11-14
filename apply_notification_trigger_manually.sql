-- Apply only the resident notification migration manually
-- This script can be run in Supabase dashboard

-- Function to notify residents when a new communication is created
CREATE OR REPLACE FUNCTION public.notify_residents_new_communication()
RETURNS TRIGGER AS $$
DECLARE
  resident_rec RECORD;
BEGIN
  -- Notify all residents of the condominium
  FOR resident_rec IN
    SELECT DISTINCT r.profile_id
    FROM public.residents r
    WHERE r.condo_id = NEW.condo_id
      AND r.profile_id IS NOT NULL
  LOOP
    PERFORM public.create_notification(
      resident_rec.profile_id,
      'Nuevo comunicado',
      COALESCE('Título: ' || NEW.title, 'Nuevo comunicado disponible'),
      'communication.new',
      'communication',
      NEW.id
    );
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for resident notifications
DROP TRIGGER IF EXISTS trg_communications_notify_residents ON public.communications;
CREATE TRIGGER trg_communications_notify_residents
  AFTER INSERT ON public.communications
  FOR EACH ROW EXECUTE FUNCTION public.notify_residents_new_communication();

-- Grant permissions for the function
GRANT EXECUTE ON FUNCTION public.notify_residents_new_communication() TO authenticated;

-- Add a comment for documentation
COMMENT ON FUNCTION public.notify_residents_new_communication() 
IS 'Notifica a todos os moradores do condomínio quando um novo comunicado é criado';

COMMENT ON TRIGGER trg_communications_notify_residents ON public.communications 
IS 'Trigger que executa notificações automáticas para moradores quando um comunicado é criado';

-- Test if function exists
SELECT 'Function created successfully' as status WHERE EXISTS (
  SELECT 1 FROM pg_proc WHERE proname = 'notify_residents_new_communication'
);

-- Test if trigger exists
SELECT 'Trigger created successfully' as status WHERE EXISTS (
  SELECT 1 FROM pg_trigger WHERE tgname = 'trg_communications_notify_residents'
);
