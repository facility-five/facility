-- Migration: Create resident_requests table
-- Created: 2024-01-02

CREATE TABLE IF NOT EXISTS public.resident_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Informações básicas da solicitação
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL CHECK (category IN ('manutencao', 'limpeza', 'seguranca', 'infraestrutura', 'outros')),
    priority VARCHAR(50) NOT NULL DEFAULT 'media' CHECK (priority IN ('baixa', 'media', 'alta', 'urgente')),
    status VARCHAR(50) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluida', 'cancelada')),
    
    -- Relacionamentos
    resident_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    condominium_id UUID NOT NULL,
    unit_number VARCHAR(20),
    
    -- Informações adicionais
    location VARCHAR(255), -- Local específico (ex: "Apartamento 101", "Área da piscina")
    urgency_reason TEXT, -- Justificativa para urgência
    preferred_contact VARCHAR(50) DEFAULT 'email' CHECK (preferred_contact IN ('email', 'telefone', 'whatsapp')),
    
    -- Anexos e imagens
    attachments JSONB DEFAULT '[]', -- Array de URLs de imagens/documentos
    
    -- Informações de atendimento
    assigned_to UUID REFERENCES auth.users(id), -- Funcionário/técnico responsável
    estimated_completion_date DATE,
    actual_completion_date DATE,
    resolution_notes TEXT,
    
    -- Avaliação do serviço
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX idx_resident_requests_resident_id ON public.resident_requests(resident_id);
CREATE INDEX idx_resident_requests_condominium_id ON public.resident_requests(condominium_id);
CREATE INDEX idx_resident_requests_status ON public.resident_requests(status);
CREATE INDEX idx_resident_requests_category ON public.resident_requests(category);
CREATE INDEX idx_resident_requests_created_at ON public.resident_requests(created_at);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_resident_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_resident_requests_updated_at
    BEFORE UPDATE ON public.resident_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_resident_requests_updated_at();

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.resident_requests ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
-- Moradores podem ver apenas suas próprias solicitações
CREATE POLICY "Residents can view own requests" ON public.resident_requests
    FOR SELECT USING (auth.uid() = resident_id);

-- Moradores podem criar suas próprias solicitações
CREATE POLICY "Residents can create own requests" ON public.resident_requests
    FOR INSERT WITH CHECK (auth.uid() = resident_id);

-- Moradores podem atualizar suas próprias solicitações (apenas alguns campos)
CREATE POLICY "Residents can update own requests" ON public.resident_requests
    FOR UPDATE USING (auth.uid() = resident_id)
    WITH CHECK (auth.uid() = resident_id);

-- Administradores podem ver todas as solicitações de seus condomínios
-- (Esta política será implementada quando tivermos a estrutura de administradores)

-- Comentários para documentação
COMMENT ON TABLE public.resident_requests IS 'Solicitações de manutenção e serviços dos moradores';
COMMENT ON COLUMN public.resident_requests.category IS 'Categoria da solicitação: manutenção, limpeza, segurança, infraestrutura, outros';
COMMENT ON COLUMN public.resident_requests.priority IS 'Prioridade: baixa, média, alta, urgente';
COMMENT ON COLUMN public.resident_requests.status IS 'Status: pendente, em_andamento, concluída, cancelada';
COMMENT ON COLUMN public.resident_requests.attachments IS 'Array JSON com URLs de imagens e documentos anexados';
COMMENT ON COLUMN public.resident_requests.rating IS 'Avaliação do serviço de 1 a 5 estrelas';