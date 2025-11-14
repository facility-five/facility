// Debug helper para testar o menu mobile
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export const MenuDebug = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed top-20 right-4 z-50 bg-red-500 text-white p-4 rounded lg:hidden">
      <h3>Debug Menu Mobile</h3>
      <p>Menu Open: {isOpen ? 'SIM' : 'NÃO'}</p>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="mt-2 bg-white text-black"
      >
        Toggle Menu
      </Button>
      
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40">
          <div className="fixed left-0 top-0 h-full w-64 bg-purple-600 z-50 p-4">
            <h2>MENU TESTE</h2>
            <Button onClick={() => setIsOpen(false)}>Fechar</Button>
          </div>
        </div>
      )}
    </div>
  );
};