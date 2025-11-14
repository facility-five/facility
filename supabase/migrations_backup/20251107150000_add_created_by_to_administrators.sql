-- Drop e recriar a função RPC para incluir dados de quem cadastrou a administradora
DROP FUNCTION IF EXISTS get_administrators_with_details();

CREATE FUNCTION get_administrators_with_details()
RETURNS TABLE (
  id UUID,
  code TEXT,
  name TEXT,
  nif TEXT,
  condos_count BIGINT,
  first_name TEXT,
  last_name TEXT,
  responsible_email TEXT,
  created_by_first_name TEXT,
  created_by_last_name TEXT,
  created_by_email TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.code,
    a.name,
    a.nif,
    COUNT(c.id) as condos_count,
    p.first_name,
    p.last_name,
    p.email as responsible_email,
    creator.first_name as created_by_first_name,
    creator.last_name as created_by_last_name,
    creator.email as created_by_email
  FROM administrators a
  LEFT JOIN condominiums c ON c.administrator_id = a.id
  LEFT JOIN profiles p ON p.id = a.responsible_id  -- Responsável (gestor)
  LEFT JOIN profiles creator ON creator.id = a.user_id  -- Quem cadastrou
  GROUP BY a.id, a.code, a.name, a.nif, p.first_name, p.last_name, p.email, 
           creator.first_name, creator.last_name, creator.email
  ORDER BY a.name;
END;
$$;

-- Comentário explicativo
COMMENT ON FUNCTION get_administrators_with_details() IS 'Retorna todas as administradoras com contagem de condomínios, dados do responsável (gestor) e dados de quem cadastrou';
