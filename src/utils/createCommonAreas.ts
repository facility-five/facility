import { supabase } from "@/integrations/supabase/client";

export const createTestCommonAreas = async (condoId: string) => {
  try {
    console.log("Criando áreas comuns de teste para condomínio:", condoId);
    
    // Verificar se já existem áreas comuns
    const { data: existingAreas } = await supabase
      .from("common_areas")
      .select("id")
      .eq("condo_id", condoId)
      .limit(1);
    
    if (existingAreas && existingAreas.length > 0) {
      console.log("Áreas comuns já existem");
      return existingAreas;
    }
    
    // Criar áreas comuns de teste
    const commonAreas = [
      {
        name: "Salão de Festas",
        description: "Salão para eventos e comemorações",
        capacity: 50,
        hourly_rate: 100.00,
        condo_id: condoId,
        is_active: true
      },
      {
        name: "Churrasqueira",
        description: "Área de churrasqueira com mesas",
        capacity: 20,
        hourly_rate: 50.00,
        condo_id: condoId,
        is_active: true
      },
      {
        name: "Quadra Esportiva",
        description: "Quadra poliesportiva",
        capacity: 10,
        hourly_rate: 30.00,
        condo_id: condoId,
        is_active: true
      }
    ];
    
    const { data: createdAreas, error } = await supabase
      .from("common_areas")
      .insert(commonAreas)
      .select("id, name");
    
    if (error) {
      console.error("Erro ao criar áreas comuns:", error);
      throw error;
    }
    
    console.log("Áreas comuns criadas com sucesso:", createdAreas);
    return createdAreas;
    
  } catch (error) {
    console.error("Erro ao criar áreas comuns de teste:", error);
    throw error;
  }
};