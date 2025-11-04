import { supabase } from "@/integrations/supabase/client";

export const createLandingPageTable = async () => {
  try {
    // Tentar inserir dados diretamente - se a tabela não existir, o Supabase retornará erro específico
    // Primeiro, verificar se já existe configuração
    const { data: existingConfig, error: selectError } = await supabase
      .from('landing_page_settings')
      .select('id')
      .limit(1);

    // Se a tabela não existir, o erro será relacionado à tabela não encontrada
    if (selectError && selectError.message.includes('does not exist')) {
      console.log('Tabela não existe, tentando criar via inserção direta...');
      
      // Tentar criar inserindo dados com ON CONFLICT
      const { error: insertError } = await supabase
        .from('landing_page_settings')
        .insert({
          id: 1,
          hero_title: 'Gestão Inteligente para Condomínios',
          hero_subtitle: 'Simplifique a administração do seu condomínio com nossa plataforma completa de gestão.',
          hero_cta_text: 'Começar Agora',
          features: [
            {
              title: "Comunicação Interna",
              description: "Sistema completo de comunicação entre moradores e administração",
              enabled: true
            },
            {
              title: "Gestão Financeira", 
              description: "Controle total de receitas, despesas e relatórios financeiros",
              enabled: true
            },
            {
              title: "Controle de Demandas",
              description: "Gerenciamento eficiente de solicitações e manutenções", 
              enabled: true
            },
            {
              title: "Acesso de Moradores",
              description: "Portal exclusivo para moradores com funcionalidades personalizadas",
              enabled: true
            },
            {
              title: "Painel Administrativo",
              description: "Dashboard completo com todas as informações em tempo real",
              enabled: true
            }
          ],
          testimonials: [
            {
              name: "Maria Silva",
              role: "Síndica", 
              building: "Residencial Jardim das Flores",
              rating: 5,
              content: "Excelente plataforma! Revolucionou a gestão do nosso condomínio.",
              enabled: true
            }
          ],
          is_active: true,
          maintenance_mode: false,
          contact_email: 'contato@facility.com',
          contact_phone: '+55 (11) 99999-9999',
          meta_title: 'Facility - Gestão Inteligente para Condomínios',
          meta_description: 'Simplifique a administração do seu condomínio com nossa plataforma completa de gestão.'
        });

      if (insertError) {
        console.error('Erro ao inserir dados iniciais:', insertError);
        return { success: false, error: `Tabela não existe e não foi possível criar: ${insertError.message}` };
      }
      
      return { success: true, message: 'Tabela criada e configuração inicial inserida com sucesso' };
    }

    // Se chegou até aqui, a tabela existe, verificar se já tem dados
    if (existingConfig && existingConfig.length > 0) {
      return { success: true, message: 'Configuração já existe' };
    }

    // Se a tabela existe mas não tem dados, inserir configuração inicial
    const { error } = await supabase
      .from('landing_page_settings')
      .insert({
        id: 1,
        hero_title: 'Gestão Inteligente para Condomínios',
        hero_subtitle: 'Simplifique a administração do seu condomínio com nossa plataforma completa de gestão.',
        hero_cta_text: 'Começar Agora',
        features: [
          {
            title: "Comunicação Interna",
            description: "Sistema completo de comunicação entre moradores e administração",
            enabled: true
          },
          {
            title: "Gestão Financeira", 
            description: "Controle total de receitas, despesas e relatórios financeiros",
            enabled: true
          },
          {
            title: "Controle de Demandas",
            description: "Gerenciamento eficiente de solicitações e manutenções", 
            enabled: true
          },
          {
            title: "Acesso de Moradores",
            description: "Portal exclusivo para moradores com funcionalidades personalizadas",
            enabled: true
          },
          {
            title: "Painel Administrativo",
            description: "Dashboard completo com todas as informações em tempo real",
            enabled: true
          }
        ],
        testimonials: [
          {
            name: "Maria Silva",
            role: "Síndica", 
            building: "Residencial Jardim das Flores",
            rating: 5,
            content: "Excelente plataforma! Revolucionou a gestão do nosso condomínio.",
            enabled: true
          }
        ],
        is_active: true,
        maintenance_mode: false,
        contact_email: 'contato@facility.com',
        contact_phone: '+55 (11) 99999-9999',
        meta_title: 'Facility - Gestão Inteligente para Condomínios',
        meta_description: 'Simplifique a administração do seu condomínio com nossa plataforma completa de gestão.'
      });

    if (error) {
      console.error('Erro ao criar configuração:', error);
      return { success: false, error: error.message };
    }

    return { success: true, message: 'Configuração criada com sucesso' };
  } catch (error) {
    console.error('Erro:', error);
    return { success: false, error: 'Erro ao criar configuração' };
  }
};

export const checkLandingPageTableExists = async () => {
  try {
    const { error } = await supabase
      .from('landing_page_settings')
      .select('id')
      .limit(1);
    return !error;
  } catch {
    return false;
  }
};