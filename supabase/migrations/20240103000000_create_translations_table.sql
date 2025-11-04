-- Create translations table for managing system translations
CREATE TABLE IF NOT EXISTS public.translations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    language_code VARCHAR(5) NOT NULL DEFAULT 'es',
    category VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID,
    updated_by UUID
);

-- Create unique constraint to prevent duplicate keys per language
CREATE UNIQUE INDEX IF NOT EXISTS translations_key_language_unique 
ON public.translations (key, language_code);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS translations_language_code_idx ON public.translations (language_code);
CREATE INDEX IF NOT EXISTS translations_category_idx ON public.translations (category);
CREATE INDEX IF NOT EXISTS translations_key_idx ON public.translations (key);

-- Enable RLS (Row Level Security)
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

-- Create policies for translations table
-- All authenticated users can manage translations (adjust as needed)
CREATE POLICY "Authenticated users can manage translations" ON public.translations
    FOR ALL USING (auth.role() = 'authenticated');

-- All authenticated users can read translations
-- (This policy is redundant since we already have a policy for ALL operations above)
-- CREATE POLICY "Authenticated users can read translations" ON public.translations
--     FOR SELECT USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    NEW.updated_by = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER handle_translations_updated_at
    BEFORE UPDATE ON public.translations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Insert default Spanish translations from the existing es.json structure
INSERT INTO public.translations (key, value, language_code, category, description) VALUES
-- Common actions
('save', 'Guardar', 'es', 'common', 'Botón para guardar cambios'),
('cancel', 'Cancelar', 'es', 'common', 'Botón para cancelar acción'),
('delete', 'Eliminar', 'es', 'common', 'Botón para eliminar elemento'),
('edit', 'Editar', 'es', 'common', 'Botón para editar elemento'),
('add', 'Agregar', 'es', 'common', 'Botón para agregar nuevo elemento'),
('search', 'Buscar', 'es', 'common', 'Campo de búsqueda'),
('filter', 'Filtrar', 'es', 'common', 'Opción de filtro'),
('loading', 'Cargando...', 'es', 'common', 'Mensaje de carga'),
('error', 'Error', 'es', 'common', 'Mensaje de error'),
('success', 'Éxito', 'es', 'common', 'Mensaje de éxito'),

-- Authentication
('login', 'Iniciar Sesión', 'es', 'auth', 'Título de página de login'),
('logout', 'Cerrar Sesión', 'es', 'auth', 'Opción de logout'),
('email', 'Correo Electrónico', 'es', 'auth', 'Campo de email'),
('password', 'Contraseña', 'es', 'auth', 'Campo de contraseña'),
('forgotPassword', 'Olvidé mi contraseña', 'es', 'auth', 'Link para recuperar contraseña'),
('resetPassword', 'Restablecer Contraseña', 'es', 'auth', 'Título de página de reset'),
('signUp', 'Registrarse', 'es', 'auth', 'Opción de registro'),
('verifyEmail', 'Verificar Email', 'es', 'auth', 'Título de verificación de email'),

-- Navigation
('dashboard', 'Panel de Control', 'es', 'navigation', 'Título del dashboard'),
('settings', 'Configuraciones', 'es', 'navigation', 'Página de configuraciones'),
('profile', 'Perfil', 'es', 'navigation', 'Página de perfil de usuario'),
('users', 'Usuarios', 'es', 'navigation', 'Gestión de usuarios'),
('reports', 'Reportes', 'es', 'navigation', 'Página de reportes'),

-- Forms
('name', 'Nombre', 'es', 'forms', 'Campo de nombre'),
('description', 'Descripción', 'es', 'forms', 'Campo de descripción'),
('status', 'Estado', 'es', 'forms', 'Campo de estado'),
('date', 'Fecha', 'es', 'forms', 'Campo de fecha'),
('time', 'Hora', 'es', 'forms', 'Campo de hora'),
('phone', 'Teléfono', 'es', 'forms', 'Campo de teléfono'),
('address', 'Dirección', 'es', 'forms', 'Campo de dirección'),

-- Messages
('confirmDelete', '¿Estás seguro de que deseas eliminar este elemento?', 'es', 'messages', 'Confirmación de eliminación'),
('itemSaved', 'Elemento guardado exitosamente', 'es', 'messages', 'Mensaje de guardado exitoso'),
('itemDeleted', 'Elemento eliminado exitosamente', 'es', 'messages', 'Mensaje de eliminación exitosa'),
('noResults', 'No se encontraron resultados', 'es', 'messages', 'Mensaje cuando no hay resultados'),
('requiredField', 'Este campo es obligatorio', 'es', 'messages', 'Mensaje de campo requerido')

ON CONFLICT (key, language_code) DO NOTHING;

-- Create a view for easy translation retrieval
CREATE OR REPLACE VIEW public.translations_view AS
SELECT 
    key,
    value,
    language_code,
    category,
    description,
    updated_at
FROM public.translations
ORDER BY category, key;

-- Grant permissions
GRANT SELECT ON public.translations_view TO authenticated;
GRANT ALL ON public.translations TO authenticated;