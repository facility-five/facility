import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  showRadixSuccess,
  showRadixError,
  showRadixInfo,
  showRadixWarning,
  showRadixDefault,
  toast
} from '@/utils/toast';

const TestToast = () => {
  const handleRadixToast = () => {
    console.log('🧪 DEBUG: Testando toast Radix na página de teste...');
    showRadixDefault(
      "Toast de Teste",
      "Este é um teste de toast Radix UI em uma página simples."
    );
    console.log('✅ DEBUG: Toast Radix chamado com sucesso');
  };

  const handleSonnerToast = () => {
    console.log('🧪 DEBUG: Testando toast Sonner na página de teste...');
    toast.success("Toast Sonner funcionando na página de teste!");
    console.log('✅ DEBUG: Toast Sonner chamado com sucesso');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🧪 Página de Teste - Toasts</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <h2 className="text-xl font-semibold mb-4">Teste de Toasts</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Toast Radix UI:</h3>
              <Button onClick={handleRadixToast} className="bg-purple-600 hover:bg-purple-700">
                Testar Toast Radix
              </Button>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Toast Sonner:</h3>
              <Button onClick={handleSonnerToast} className="bg-green-600 hover:bg-green-700">
                Testar Toast Sonner
              </Button>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-gray-100 rounded">
            <h3 className="font-medium mb-2">Instruções:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Abra o console do navegador (F12)</li>
              <li>Clique nos botões acima</li>
              <li>Verifique se aparecem as mensagens de debug</li>
              <li>Verifique se os toasts aparecem na tela</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestToast;