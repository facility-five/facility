import { ResidentSidebar } from "./ResidentSidebar";
import { ResidentHeader } from "./ResidentHeader";
import { ResidentPreloadManager } from "./ResidentPreloadManager";
import { FloatingActionButton } from "./FloatingActionButton";
import { MenuDebug } from "@/components/MenuDebug";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { offlineManager } from "@/utils/offlineManager";
import { useState, useEffect } from "react";

interface ResidentLayoutProps {
  children: React.ReactNode;
}

export const ResidentLayout = ({ children }: ResidentLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isOnline } = useNetworkStatus();

  // Debug: Log state changes
  useEffect(() => {
    console.log('🍔 Menu state changed:', sidebarOpen);
  }, [sidebarOpen]);

  // Auto-sync offline actions when coming back online
  useEffect(() => {
    if (isOnline && offlineManager.hasPendingActions()) {
      offlineManager.syncOfflineActions();
    }
  }, [isOnline]);

  // Request notification permission on mount
  useEffect(() => {
    offlineManager.requestNotificationPermission();
  }, []);

  // Swipe gestures for mobile navigation
  useSwipeGesture({
    onSwipeRight: () => {
      console.log('👉 Swipe right detected');
      if (!sidebarOpen && window.innerWidth < 1024) {
        setSidebarOpen(true);
      }
    },
    onSwipeLeft: () => {
      console.log('👈 Swipe left detected');
      if (sidebarOpen && window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    },
    threshold: 50,
  });

  const handleMenuClick = () => {
    console.log('🍔 Menu button clicked, current state:', sidebarOpen);
    setSidebarOpen(true);
  };

  return (
    <ResidentPreloadManager>
      <div className="relative h-screen w-full overflow-hidden">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-50 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Mobile/Desktop Layout */}
        <div className="flex h-full">
          <ResidentSidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
          />
          
          {/* Main content */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <ResidentHeader onMenuClick={handleMenuClick} />
            <main className="flex-1 overflow-y-auto bg-gray-50 p-3 sm:p-4 lg:p-6">
              <div className="mx-auto max-w-7xl">
                {children}
              </div>
            </main>
          </div>

          {/* Floating Action Button - Mobile Only */}
          <FloatingActionButton />
        </div>

        {/* Debug Menu - TEMPORÁRIO */}
        <MenuDebug />
      </div>
    </ResidentPreloadManager>
  );
};