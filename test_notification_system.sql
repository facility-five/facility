-- Test script to validate notification system
-- Run this in Supabase Dashboard SQL Editor

-- First, check if the functions exist
SELECT 'Functions check:' as info, count(*) as functions_found 
FROM pg_proc 
WHERE proname IN ('create_notification', 'notify_residents_new_communication');

-- Check if trigger exists
SELECT 'Trigger check:' as info, count(*) as triggers_found 
FROM pg_trigger 
WHERE tgname = 'trg_communications_notify_residents';

-- Sample test: insert a test communication (you can run this after applying the migration)
-- Note: Replace condo_id with an actual condominium ID from your database
/*
INSERT INTO public.communications (
  title, 
  content, 
  condo_id, 
  created_by, 
  code
) VALUES (
  'Teste de Notificação',
  'Este é um teste para verificar se as notificações automáticas funcionam para moradores.',
  'YOUR_CONDO_ID_HERE', 
  auth.uid(),
  'CO-TEST123'
);
*/

-- Check if notifications table has recent data
SELECT 'Recent notifications:' as info, 
       count(*) as total_notifications,
       count(*) FILTER (WHERE type = 'communication.new') as communication_notifications
FROM public.notifications 
WHERE created_at > NOW() - INTERVAL '1 hour';