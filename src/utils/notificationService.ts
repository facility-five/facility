import { supabase } from "@/integrations/supabase/client";

export interface NotificationData {
  user_id: string;
  title: string;
  message: string;
  type: string;
  entity_type?: string;
  entity_id?: string;
}

/**
 * Serviço para gerenciar notificações no sistema
 */
export class NotificationService {
  /**
   * Cria uma notificação para um usuário específico
   */
  static async createNotification(notification: NotificationData): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("notifications")
        .insert([{
          user_id: notification.user_id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          entity_type: notification.entity_type,
          entity_id: notification.entity_id,
          is_read: false
        }]);

      if (error) {
        console.error("Erro ao criar notificação:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Erro inesperado ao criar notificação:", error);
      return false;
    }
  }

  /**
   * Cria notificações para todos os moradores de um condomínio
   */
  static async notifyCondominiumResidents(
    condominiumId: string,
    title: string,
    message: string,
    type: string = 'communication',
    entityType?: string,
    entityId?: string
  ): Promise<boolean> {
    try {
      // Buscar todos os moradores do condomínio
      const { data: residents, error: residentsError } = await supabase
        .from("residents")
        .select("profile_id")
        .eq("condo_id", condominiumId)
        .not("profile_id", "is", null)
        .is("deleted_at", null);

      if (residentsError) {
        console.error("Erro ao buscar moradores:", residentsError);
        return false;
      }

      if (!residents || residents.length === 0) {
        console.log("Nenhum morador encontrado para o condomínio:", condominiumId);
        return true; // Não é erro, apenas não há moradores
      }

      // Criar notificações para todos os moradores
      const notifications = residents.map(resident => ({
        user_id: resident.profile_id,
        title,
        message,
        type,
        entity_type: entityType,
        entity_id: entityId,
        is_read: false
      }));

      const { error } = await supabase
        .from("notifications")
        .insert(notifications);

      if (error) {
        console.error("Erro ao criar notificações em lote:", error);
        return false;
      }

      console.log(`Criadas ${notifications.length} notificações para moradores do condomínio ${condominiumId}`);
      return true;
    } catch (error) {
      console.error("Erro inesperado ao notificar moradores:", error);
      return false;
    }
  }

  /**
   * Marca uma notificação como lida
   */
  static async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq("id", notificationId);

      if (error) {
        console.error("Erro ao marcar notificação como lida:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Erro inesperado ao marcar notificação como lida:", error);
      return false;
    }
  }

  /**
   * Busca notificações de um usuário
   */
  static async getUserNotifications(
    userId: string,
    limit: number = 20,
    unreadOnly: boolean = false
  ) {
    try {
      let query = supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (unreadOnly) {
        query = query.eq("is_read", false);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Erro ao buscar notificações:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Erro inesperado ao buscar notificações:", error);
      return null;
    }
  }

  /**
   * Conta notificações não lidas de um usuário
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", userId)
        .eq("is_read", false)
        .is("deleted_at", null);

      if (error) {
        console.error("Erro ao contar notificações não lidas:", error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error("Erro inesperado ao contar notificações não lidas:", error);
      return 0;
    }
  }
}