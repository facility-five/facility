-- Criar ou substituir a função RPC para buscar administradoras com detalhes do responsável
CREATE OR REPLACE FUNCTION get_administrators_with_details()
RETURNS TABLE (
  id UUID,
  code TEXT,
  name TEXT,
  nif TEXT,
  condos_count BIGINT,
  first_name TEXT,
  last_name TEXT,
  responsible_email TEXT
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
    p.email as responsible_email
  FROM administrators a
  LEFT JOIN condominiums c ON c.administrator_id = a.id
  LEFT JOIN profiles p ON p.id = a.responsible_id  -- Buscar pelo responsible_id (gestor)
  GROUP BY a.id, a.code, a.name, a.nif, p.first_name, p.last_name, p.email
  ORDER BY a.name;
END;
$$;

-- Comentário explicativo
COMMENT ON FUNCTION get_administrators_with_details() IS 'Retorna todas as administradoras com contagem de condomínios e dados do responsável (gestor)';
