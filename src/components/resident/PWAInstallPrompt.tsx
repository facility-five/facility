import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X } from 'lucide-react';

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Store the event so it can be triggered later
      setDeferredPrompt(e);
      setIsInstallable(true);
      
      // Check if user has dismissed this prompt before
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      const dismissedTime = dismissed ? parseInt(dismissed) : 0;
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      
      if (dismissedTime < oneDayAgo) {
        setShowPrompt(true);
      }
    };

    const handleAppInstalled = () => {
      // Hide the install promotion
      setDeferredPrompt(null);
      setShowPrompt(false);
      setIsInstallable(false);
      // Clear the dismissed flag
      localStorage.removeItem('pwa-install-dismissed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(false);
      setShowPrompt(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the stored prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember dismissal for 24 hours
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (!showPrompt || !isInstallable) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 shadow-lg lg:bottom-6 lg:left-6 lg:right-auto">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-purple-100 p-2">
            <Download className="h-5 w-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">
              Instalar App
            </h3>
            <p className="text-sm text-gray-600">
              Adicione o Facility à sua tela inicial para acesso rápido
            </p>
            <div className="mt-3 flex gap-2">
              <Button 
                size="sm" 
                onClick={handleInstall}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Instalar
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleDismiss}
                className="text-gray-500 hover:text-gray-700"
              >
                Agora não
              </Button>
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleDismiss}
            className="h-6 w-6 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};