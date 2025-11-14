// Utility for managing offline notifications and data sync
import { supabase } from '@/integrations/supabase/client';

interface OfflineAction {
  id: string;
  type: 'reservation' | 'request' | 'communication_read';
  data: any;
  timestamp: number;
  retry: number;
}

class OfflineManager {
  private readonly STORAGE_KEY = 'facility_offline_actions';
  private readonly MAX_RETRIES = 3;

  // Store action for later sync when online
  storeOfflineAction(type: OfflineAction['type'], data: any) {
    const actions = this.getOfflineActions();
    const newAction: OfflineAction = {
      id: Date.now().toString(),
      type,
      data,
      timestamp: Date.now(),
      retry: 0,
    };
    
    actions.push(newAction);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(actions));
    
    // Show offline notification
    this.showOfflineNotification(`Ação salva para sincronizar quando estiver online`);
    
    return newAction.id;
  }

  // Get all pending offline actions
  getOfflineActions(): OfflineAction[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Sync all offline actions when back online
  async syncOfflineActions() {
    const actions = this.getOfflineActions();
    if (actions.length === 0) return;

    const successful: string[] = [];
    const failed: OfflineAction[] = [];

    for (const action of actions) {
      try {
        await this.executeAction(action);
        successful.push(action.id);
      } catch (error) {
        if (action.retry < this.MAX_RETRIES) {
          failed.push({ ...action, retry: action.retry + 1 });
        }
        console.error('Failed to sync offline action:', error);
      }
    }

    // Update storage with failed actions only
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(failed));

    // Notify user of sync results
    if (successful.length > 0) {
      this.showOfflineNotification(
        `${successful.length} ação(ões) sincronizada(s) com sucesso`
      );
    }
  }

  // Execute a specific offline action
  private async executeAction(action: OfflineAction) {
    switch (action.type) {
      case 'reservation':
        return await this.syncReservation(action.data);
      case 'request':
        return await this.syncRequest(action.data);
      case 'communication_read':
        return await this.syncCommunicationRead(action.data);
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  private async syncReservation(data: any) {
    if (data.id) {
      // Update existing reservation
      const { error } = await supabase
        .from('reservas')
        .update(data)
        .eq('id', data.id);
      if (error) throw error;
    } else {
      // Create new reservation
      const { error } = await supabase
        .from('reservas')
        .insert(data);
      if (error) throw error;
    }
  }

  private async syncRequest(data: any) {
    if (data.id) {
      // Update existing request
      const { error } = await supabase
        .from('resident_requests')
        .update(data)
        .eq('id', data.id);
      if (error) throw error;
    } else {
      // Create new request
      const { error } = await supabase
        .from('resident_requests')
        .insert(data);
      if (error) throw error;
    }
  }

  private async syncCommunicationRead(data: any) {
    // Mark communication as read
    const { error } = await supabase
      .from('communication_reads')
      .upsert({
        communication_id: data.communication_id,
        resident_id: data.resident_id,
        read_at: data.read_at,
      });
    if (error) throw error;
  }

  // Show browser notification if permission granted
  private showOfflineNotification(message: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Facility Manager', {
        body: message,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: 'facility-offline',
      });
    } else {
      // Fallback to browser alert or custom toast
      console.log('Offline notification:', message);
    }
  }

  // Request notification permission
  async requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  // Check if there are pending offline actions
  hasPendingActions(): boolean {
    return this.getOfflineActions().length > 0;
  }

  // Clear all offline actions (admin function)
  clearOfflineActions() {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Get count of pending actions
  getPendingCount(): number {
    return this.getOfflineActions().length;
  }
}

export const offlineManager = new OfflineManager();