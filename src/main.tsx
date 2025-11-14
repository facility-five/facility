import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import "./i18n";
import { ServiceWorkerManager } from "./utils/loadingFixes.tsx";

const root = createRoot(document.getElementById("root")!);

// Render with improved loading management
root.render(
  <>
    <ServiceWorkerManager />
    <App />
  </>
);

// Enhanced service worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        updateViaCache: 'imports'
      });
      
      console.log('SW registered successfully');
      
      // Handle updates more gracefully
      if (registration.waiting) {
        // New version available immediately
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Show update notification (optional)
              console.log('Nova versão instalada');
            }
          });
        }
      });
      
    } catch (error) {
      console.log('SW registration failed:', error);
    }
  });
}
