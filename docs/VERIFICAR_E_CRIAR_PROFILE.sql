-- Script para verificar e criar profile para usuário específico
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar se há usuários sem profile
SELECT 
    au.id,
    au.email,
    au.created_at,
    p.id as profile_id
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- 2. Se encontrou usuários sem profile, criar profiles para eles
INSERT INTO public.profiles (id, email, role, status, created_at)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'role', 'Morador'),
    'Ativo',
    au.created_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();

-- 3. Verificar profiles criados
SELECT 
    p.id,
    p.email,
    p.role,
    p.status,
    p.created_at
FROM public.profiles p
ORDER BY p.created_at DESC
LIMIT 10;

-- 4. Verificar se há profiles duplicados
SELECT 
    id,
    COUNT(*) as count
FROM public.profiles
GROUP BY id
HAVING COUNT(*) > 1;
