-- Fix notify_residents_new_communication: remove reference to r.deleted_at (column may not exist)
CREATE OR REPLACE FUNCTION public.notify_residents_new_communication()
RETURNS TRIGGER AS $$
DECLARE
  resident_rec RECORD;
BEGIN
  FOR resident_rec IN
    SELECT DISTINCT r.profile_id
    FROM public.residents r
    WHERE r.condo_id = NEW.condo_id
      AND r.profile_id IS NOT NULL
  LOOP
    PERFORM public.create_notification(
      resident_rec.profile_id,
      'Nuevo comunicado',
      COALESCE('Título: ' || NEW.title, 'Nuevo comunicado disponível'),
      'communication.new',
      'communication',
      NEW.id
    );
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_communications_notify_residents ON public.communications;
CREATE TRIGGER trg_communications_notify_residents
  AFTER INSERT ON public.communications
  FOR EACH ROW EXECUTE FUNCTION public.notify_residents_new_communication();

GRANT EXECUTE ON FUNCTION public.notify_residents_new_communication() TO authenticated;
