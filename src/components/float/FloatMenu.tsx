import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Copy, 
  Share, 
  Download,
  Eye,
  Settings
} from 'lucide-react';

interface FloatMenuProps {
  trigger?: React.ReactNode;
  items?: MenuItem[];
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'destructive';
  separator?: boolean;
}

const defaultItems: MenuItem[] = [
  {
    id: 'view',
    label: 'Visualizar',
    icon: Eye,
    onClick: () => console.log('Visualizar'),
  },
  {
    id: 'edit',
    label: 'Editar',
    icon: Edit,
    onClick: () => console.log('Editar'),
  },
  {
    id: 'copy',
    label: 'Copiar',
    icon: Copy,
    onClick: () => console.log('Copiar'),
  },
  {
    id: 'share',
    label: 'Compartilhar',
    icon: Share,
    onClick: () => console.log('Compartilhar'),
    separator: true,
  },
  {
    id: 'download',
    label: 'Download',
    icon: Download,
    onClick: () => console.log('Download'),
  },
  {
    id: 'settings',
    label: 'Configurações',
    icon: Settings,
    onClick: () => console.log('Configurações'),
    separator: true,
  },
  {
    id: 'delete',
    label: 'Excluir',
    icon: Trash2,
    onClick: () => console.log('Excluir'),
    variant: 'destructive',
  },
];

export function FloatMenu({ 
  trigger, 
  items = defaultItems, 
  position = 'bottom',
  className 
}: FloatMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full mb-2';
      case 'left':
        return 'right-full mr-2 top-0';
      case 'right':
        return 'left-full ml-2 top-0';
      default:
        return 'top-full mt-2';
    }
  };

  const handleItemClick = (item: MenuItem) => {
    if (!item.disabled) {
      item.onClick();
      setIsOpen(false);
    }
  };

  return (
    <div className="relative inline-block">
      <div ref={triggerRef}>
        {trigger ? (
          <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
            {trigger}
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="h-8 w-8 p-0"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isOpen && (
        <div
          ref={menuRef}
          className={cn(
            'absolute z-50 min-w-[200px]',
            getPositionClasses(),
            className
          )}
        >
          <Card className="p-1 shadow-lg border animate-in fade-in-0 zoom-in-95 duration-200">
            {items.map((item, index) => (
              <React.Fragment key={item.id}>
                {item.separator && index > 0 && (
                  <div className="h-px bg-border my-1" />
                )}
                <button
                  onClick={() => handleItemClick(item)}
                  disabled={item.disabled}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-sm transition-colors text-left',
                    'hover:bg-accent hover:text-accent-foreground',
                    'focus:bg-accent focus:text-accent-foreground focus:outline-none',
                    item.disabled && 'opacity-50 cursor-not-allowed',
                    item.variant === 'destructive' && 'text-destructive hover:bg-destructive/10'
                  )}
                >
                  {item.icon && (
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                  )}
                  <span>{item.label}</span>
                </button>
              </React.Fragment>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}