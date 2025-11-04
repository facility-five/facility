import { supabase } from "@/integrations/supabase/client";
import { createTestCommonAreas } from "./createCommonAreas";

export const createTestResidentData = async (userId: string) => {
  try {
    console.log("Criando dados de teste para usuário:", userId);
    
    // Verificar se já existe um residente para este usuário
    const { data: existingResident } = await supabase
      .from("residents")
      .select("id")
      .eq("profile_id", userId)
      .single();
    
    if (existingResident) {
      console.log("Residente já existe:", existingResident.id);
      return existingResident;
    }
    
    // Buscar ou criar administrador
    let { data: admin } = await supabase
      .from("administrators")
      .select("id")
      .limit(1)
      .single();
    
    if (!admin) {
      const { data: newAdmin } = await supabase
        .from("administrators")
        .insert({
          name: "Administradora Teste",
          email: "admin@teste.com",
          phone: "(11) 99999-9999"
        })
        .select("id")
        .single();
      admin = newAdmin;
    }
    
    // Buscar ou criar condomínio
    let { data: condo } = await supabase
      .from("condos")
      .select("id")
      .limit(1)
      .single();
    
    if (!condo) {
      const { data: newCondo } = await supabase
        .from("condos")
        .insert({
          name: "Condomínio Teste",
          address: "Rua Teste, 123",
          city: "São Paulo",
          state: "SP",
          zip_code: "01234-567",
          administrator_id: admin.id
        })
        .select("id")
        .single();
      condo = newCondo;
    }
    
    // Buscar ou criar bloco
    let { data: block } = await supabase
      .from("blocks")
      .select("id")
      .eq("condo_id", condo.id)
      .limit(1)
      .single();
    
    if (!block) {
      const { data: newBlock } = await supabase
        .from("blocks")
        .insert({
          name: "Bloco A",
          condo_id: condo.id
        })
        .select("id")
        .single();
      block = newBlock;
    }
    
    // Buscar ou criar unidade
    let { data: unit } = await supabase
      .from("units")
      .select("id")
      .eq("block_id", block.id)
      .limit(1)
      .single();
    
    if (!unit) {
      const { data: newUnit } = await supabase
        .from("units")
        .insert({
          number: "101",
          block_id: block.id,
          floor: 1,
          bedrooms: 2,
          bathrooms: 1,
          area: 65.0
        })
        .select("id")
        .single();
      unit = newUnit;
    }
    
    // Buscar dados do usuário
    const { data: userData } = await supabase.auth.getUser();
    const userEmail = userData.user?.email || "teste@teste.com";
    
    // Criar residente
    const { data: resident, error } = await supabase
      .from("residents")
      .insert({
        code: "RES001",
        full_name: "Morador Teste",
        email: userEmail,
        phone: "(11) 99999-9999",
        document: "123.456.789-00",
        birth_date: "1990-01-01",
        entry_date: new Date().toISOString().split('T')[0],
        is_owner: true,
        is_tenant: false,
        status: "Ativo",
        condo_id: condo.id,
        block_id: block.id,
        unit_id: unit.id,
        profile_id: userId
      })
      .select("id")
      .single();
    
    if (error) {
      console.error("Erro ao criar residente:", error);
      throw error;
    }
    
    console.log("Residente criado com sucesso:", resident.id);
    
    // Criar áreas comuns de teste
    await createTestCommonAreas(condo.id);
    
    return resident;
    
  } catch (error) {
    console.error("Erro ao criar dados de teste:", error);
    throw error;
  }
};