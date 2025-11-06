-- Migration: Create support_requests and admin_tasks tables
-- Created: 2025-11-06

-- Ensure required extension for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Support Requests: solicitudes de clientes hacia el equipo de soporte
CREATE TABLE IF NOT EXISTS public.support_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100),
    priority VARCHAR(50) NOT NULL DEFAULT 'media' CHECK (priority IN ('baja','media','alta','urgente')),
    status VARCHAR(50) NOT NULL DEFAULT 'abierto' CHECK (status IN ('abierto','en_progreso','resuelto','cerrado')),

    requester_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    administrator_id UUID REFERENCES public.administrators(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

    attachments JSONB DEFAULT '[]',
    last_comment_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- Indexes for support_requests
CREATE INDEX IF NOT EXISTS idx_support_requests_requester ON public.support_requests(requester_user_id);
CREATE INDEX IF NOT EXISTS idx_support_requests_admin ON public.support_requests(administrator_id);
CREATE INDEX IF NOT EXISTS idx_support_requests_assigned ON public.support_requests(assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_requests_status ON public.support_requests(status);
CREATE INDEX IF NOT EXISTS idx_support_requests_priority ON public.support_requests(priority);
CREATE INDEX IF NOT EXISTS idx_support_requests_created_at ON public.support_requests(created_at);

-- Trigger to keep updated_at fresh
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER support_requests_set_updated
    BEFORE UPDATE ON public.support_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_timestamp();

-- Enable RLS
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

-- Policies
-- Users can see and create their own requests
CREATE POLICY "support_requests_select_own" ON public.support_requests
    FOR SELECT USING (auth.uid() = requester_user_id);

CREATE POLICY "support_requests_insert_own" ON public.support_requests
    FOR INSERT WITH CHECK (auth.uid() = requester_user_id);

-- Admins (SaaS) can manage all support requests
CREATE POLICY "support_requests_admin_manage" ON public.support_requests
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM public.profiles WHERE role = 'Admin do SaaS'
        )
    );

-- Admins can insert any support request
CREATE POLICY "support_requests_admin_insert" ON public.support_requests
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT id FROM public.profiles WHERE role = 'Admin do SaaS'
        )
    );

COMMENT ON TABLE public.support_requests IS 'Solicitudes de soporte de clientes (módulo Soporte)';

-- Admin Tasks: gestión interna de tareas
CREATE TABLE IF NOT EXISTS public.admin_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente','en_progreso','bloqueada','finalizada')),
    priority VARCHAR(50) NOT NULL DEFAULT 'media' CHECK (priority IN ('baja','media','alta','urgente')),
    due_date DATE,

    administrator_id UUID REFERENCES public.administrators(id) ON DELETE SET NULL,
    related_support_id UUID REFERENCES public.support_requests(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

    tags TEXT[] DEFAULT '{}',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- Indexes for admin_tasks
CREATE INDEX IF NOT EXISTS idx_admin_tasks_admin ON public.admin_tasks(administrator_id);
CREATE INDEX IF NOT EXISTS idx_admin_tasks_assigned ON public.admin_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_admin_tasks_status ON public.admin_tasks(status);
CREATE INDEX IF NOT EXISTS idx_admin_tasks_priority ON public.admin_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_admin_tasks_due_date ON public.admin_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_admin_tasks_created_by ON public.admin_tasks(created_by);

-- Trigger for updated_at
CREATE TRIGGER admin_tasks_set_updated
    BEFORE UPDATE ON public.admin_tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_timestamp();

-- Enable RLS
ALTER TABLE public.admin_tasks ENABLE ROW LEVEL SECURITY;

-- Policies
-- Admins (SaaS) can manage all tasks
CREATE POLICY "admin_tasks_admin_manage" ON public.admin_tasks
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM public.profiles WHERE role = 'Admin do SaaS'
        )
    );

-- Admins can insert any task
CREATE POLICY "admin_tasks_admin_insert" ON public.admin_tasks
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT id FROM public.profiles WHERE role = 'Admin do SaaS'
        )
    );

-- Creators can view and update their own tasks
CREATE POLICY "admin_tasks_creator_manage_own" ON public.admin_tasks
    FOR ALL USING (auth.uid() = created_by)
    WITH CHECK (auth.uid() = created_by);

-- Assignees can view and update tasks assigned to them
CREATE POLICY "admin_tasks_assignee_select" ON public.admin_tasks
    FOR SELECT USING (auth.uid() = assigned_to);

CREATE POLICY "admin_tasks_assignee_update" ON public.admin_tasks
    FOR UPDATE USING (auth.uid() = assigned_to);

COMMENT ON TABLE public.admin_tasks IS 'Tareas internas de administración (módulo Tareas)';