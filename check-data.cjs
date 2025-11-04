const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://riduqdqarirfqouazgwf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpZHVxZHFhcmlyZnFvdWF6Z3dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMDQzODUsImV4cCI6MjA3NDY4MDM4NX0.sXrlOxHDKde3xo0aKIoIoPsuvEPIqIcvCIzwfegP4T0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndCreateData() {
  try {
    console.log('Verificando dados existentes...');
    
    // Verificar administradoras
    const { data: admins, error: adminError } = await supabase
      .from('administrators')
      .select('*');
    
    if (adminError) {
      console.error('Erro ao buscar administradoras:', adminError);
      return;
    }
    
    console.log('Administradoras encontradas:', admins?.length || 0);
    if (admins && admins.length > 0) {
      console.log('Administradoras:', JSON.stringify(admins, null, 2));
    }
    
    // Usar ID de usuário fixo para teste (você pode obter o ID real do localStorage do navegador)
    const userId = '1d4fb122-6067-4b61-b191-4a2fe5bc654f'; // ID do usuário atual
    console.log('Usando ID de usuário:', userId);
    
    // Se não há administradoras, criar uma de teste
    if (!admins || admins.length === 0) {
      console.log('Criando administradora de teste...');
      
      const { data: newAdmin, error: createError } = await supabase
        .from('administrators')
        .insert({
          name: 'Administradora Teste',
          code: 'ADM001',
          nif: '12345678901',
          user_id: userId,
          responsible_id: userId,
          email: 'admin@teste.com',
          phone: '+55 11 99999-9999'
        })
        .select()
        .single();
      
      if (createError) {
        console.error('Erro ao criar administradora:', createError);
        return;
      }
      
      console.log('Administradora criada:', newAdmin);
      
      // Criar alguns condomínios de teste
      console.log('Criando condomínios de teste...');
      
      const { data: condos, error: condoError } = await supabase
        .from('condominiums')
        .insert([
          {
            name: 'Condomínio Jardim das Flores',
            code: 'JDF001',
            administrator_id: newAdmin.id,
            total_units: 50,
            status: 'active'
          },
          {
            name: 'Residencial Vista Alegre',
            code: 'RVA002',
            administrator_id: newAdmin.id,
            total_units: 30,
            status: 'active'
          },
          {
            name: 'Edifício Central Park',
            code: 'ECP003',
            administrator_id: newAdmin.id,
            total_units: 80,
            status: 'inactive'
          }
        ])
        .select();
      
      if (condoError) {
        console.error('Erro ao criar condomínios:', condoError);
        return;
      }
      
      console.log('Condomínios criados:', condos);
    } else {
      // Se há administradoras, verificar se alguma está associada ao usuário atual
      const userAdmin = admins.find(admin => 
        admin.user_id === userId || admin.responsible_id === userId
      );
      
      if (!userAdmin) {
        console.log('Associando primeira administradora ao usuário atual...');
        
        const { data: updatedAdmin, error: updateError } = await supabase
          .from('administrators')
          .update({
            user_id: userId,
            responsible_id: userId
          })
          .eq('id', admins[0].id)
          .select()
          .single();
        
        if (updateError) {
          console.error('Erro ao associar administradora:', updateError);
          return;
        }
        
        console.log('Administradora associada:', updatedAdmin);
      } else {
        console.log('Usuário já tem administradora associada:', userAdmin.name);
      }
    }
    
    console.log('Verificação e criação de dados concluída!');
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

checkAndCreateData();