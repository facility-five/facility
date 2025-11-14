import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, MessageSquare, Wrench, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const actions = [
    {
      icon: Calendar,
      label: 'Nova Reserva',
      action: () => navigate('/morador/reservas'),
      color: 'bg-purple-600 hover:bg-purple-700',
    },
    {
      icon: Wrench,
      label: 'Nova Solicitação',
      action: () => navigate('/morador/solicitacoes'),
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      icon: MessageSquare,
      label: 'Comunicados',
      action: () => navigate('/morador/comunicados'),
      color: 'bg-green-600 hover:bg-green-700',
    },
  ];

  const handleMainClick = () => {
    setIsOpen(!isOpen);
  };

  const handleActionClick = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 left-4 z-30 lg:hidden">
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Action Buttons */}
      <div className="flex flex-col-reverse items-start gap-3 mb-3">
        {actions.map((action, index) => (
          <div
            key={index}
            className={cn(
              'flex items-center gap-3 transition-all duration-200 transform',
              isOpen
                ? 'translate-y-0 opacity-100 scale-100'
                : 'translate-y-4 opacity-0 scale-75 pointer-events-none'
            )}
            style={{
              transitionDelay: isOpen ? `${index * 50}ms` : `${(actions.length - index - 1) * 50}ms`,
            }}
          >
            {/* Button */}
            <Button
              size="icon"
              onClick={() => handleActionClick(action.action)}
              className={cn(
                'h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200',
                action.color
              )}
            >
              <action.icon className="h-5 w-5" />
              <span className="sr-only">{action.label}</span>
            </Button>
            
            {/* Label */}
            <div className="bg-black/80 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap">
              {action.label}
            </div>
          </div>
        ))}
      </div>

      {/* Main FAB */}
      <Button
        size="icon"
        onClick={handleMainClick}
        className={cn(
          'h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200',
          'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700',
          isOpen && 'rotate-45'
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Plus className="h-6 w-6" />
        )}
        <span className="sr-only">Menu de ações rápidas</span>
      </Button>
    </div>
  );
};