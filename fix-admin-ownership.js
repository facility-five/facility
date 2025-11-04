// Script para corrigir o owner_id e responsible_id da administradora Test2
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://riduqdqarirfqouazgwf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpZHVxZHFhcmlyZnFvdWF6Z3dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMDQzODUsImV4cCI6MjA3NDY4MDM4NX0.sXrlOxHDKde3xo0aKIoIoPsuvEPIqIcvCIzwfegP4T0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixAdministratorOwnership() {
  try {
    console.log('Iniciando correção da administradora...')
    
    // ID do usuário atual (do log)
    const currentUserId = '1d4fb122-6067-4b61-b191-4a2fe5bc654f'
    
    // ID da administradora Test2 (do log) - corrigindo o UUID
    const adminId = 'f4604273-b2d4-4d80-acb3-a61887a7dd77'
    
    // Atualizar a administradora
    const { data, error } = await supabase
      .from('administrators')
      .update({
        user_id: currentUserId,
        responsible_id: currentUserId
      })
      .eq('id', adminId)
      .select()
    
    if (error) {
      console.error('Erro ao atualizar administradora:', error)
      return
    }
    
    console.log('Administradora atualizada com sucesso:', data)
    
    // Verificar a atualização
    const { data: verification, error: verifyError } = await supabase
      .from('administrators')
      .select('id, name, user_id, responsible_id')
      .eq('id', adminId)
      .single()
    
    if (verifyError) {
      console.error('Erro ao verificar atualização:', verifyError)
      return
    }
    
    console.log('Verificação da atualização:', verification)
    
  } catch (error) {
    console.error('Erro geral:', error)
  }
}

fixAdministratorOwnership()