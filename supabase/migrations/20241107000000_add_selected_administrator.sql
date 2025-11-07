-- Adicionar coluna selected_administrator_id na tabela profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS selected_administrator_id UUID REFERENCES administrators(id) ON DELETE SET NULL;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_profiles_selected_administrator 
ON profiles(selected_administrator_id);

-- Comentário explicativo
COMMENT ON COLUMN profiles.selected_administrator_id IS 'ID da administradora atualmente selecionada pelo usuário';
