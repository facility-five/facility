import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  X, 
  Minimize2, 
  Maximize2, 
  Move,
  RotateCcw,
  Settings
} from 'lucide-react';

interface FloatPanelProps {
  title: string;
  children: React.ReactNode;
  defaultPosition?: { x: number; y: number };
  defaultSize?: { width: number; height: number };
  minSize?: { width: number; height: number };
  maxSize?: { width: number; height: number };
  resizable?: boolean;
  draggable?: boolean;
  onClose?: () => void;
  className?: string;
  headerActions?: React.ReactNode;
}

export function FloatPanel({
  title,
  children,
  defaultPosition = { x: 100, y: 100 },
  defaultSize = { width: 400, height: 300 },
  minSize = { width: 300, height: 200 },
  maxSize = { width: 800, height: 600 },
  resizable = true,
  draggable = true,
  onClose,
  className,
  headerActions,
}: FloatPanelProps) {
  const [position, setPosition] = useState(defaultPosition);
  const [size, setSize] = useState(defaultSize);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const panelRef = useRef<HTMLDivElement>(null);

  // Dragging logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!draggable) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  // Resizing logic
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (!resizable) return;
    
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(0, Math.min(window.innerWidth - size.width, e.clientX - dragStart.x));
        const newY = Math.max(0, Math.min(window.innerHeight - size.height, e.clientY - dragStart.y));
        
        setPosition({ x: newX, y: newY });
      }

      if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        
        const newWidth = Math.max(
          minSize.width,
          Math.min(maxSize.width, resizeStart.width + deltaX)
        );
        const newHeight = Math.max(
          minSize.height,
          Math.min(maxSize.height, resizeStart.height + deltaY)
        );
        
        setSize({ width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, resizeStart, size, minSize, maxSize]);

  const resetPosition = () => {
    setPosition(defaultPosition);
    setSize(defaultSize);
    setIsMinimized(false);
  };

  return (
    <div
      ref={panelRef}
      className={cn(
        'fixed z-50 shadow-2xl',
        isDragging && 'cursor-move',
        isResizing && 'cursor-se-resize',
        className
      )}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: isMinimized ? 'auto' : size.height,
      }}
    >
      <Card className="h-full flex flex-col">
        <CardHeader 
          className={cn(
            'pb-2 cursor-move select-none',
            draggable && 'hover:bg-accent/50'
          )}
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Move className="h-4 w-4 opacity-50" />
              {title}
            </CardTitle>
            
            <div className="flex items-center gap-1">
              {headerActions}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={resetPosition}
                className="h-6 w-6 p-0"
                title="Resetar posição"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-6 w-6 p-0"
                title={isMinimized ? "Expandir" : "Minimizar"}
              >
                <Minimize2 className="h-3 w-3" />
              </Button>
              
              {onClose && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                  title="Fechar"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            <CardContent className="flex-1 overflow-auto p-4">
              {children}
            </CardContent>

            {resizable && (
              <div
                className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-50 hover:opacity-100"
                onMouseDown={handleResizeMouseDown}
              >
                <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-gray-400" />
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

// Hook para gerenciar múltiplos painéis flutuantes
export function useFloatPanels() {
  const [panels, setPanels] = useState<Array<{
    id: string;
    component: React.ReactNode;
  }>>([]);

  const addPanel = (id: string, component: React.ReactNode) => {
    setPanels(prev => [...prev, { id, component }]);
  };

  const removePanel = (id: string) => {
    setPanels(prev => prev.filter(panel => panel.id !== id));
  };

  const clearAll = () => {
    setPanels([]);
  };

  return {
    panels,
    addPanel,
    removePanel,
    clearAll,
  };
}