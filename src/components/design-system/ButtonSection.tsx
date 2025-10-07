import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';

export const ButtonSection = () => {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-admin-foreground">Botões</h2>
      <Separator className="bg-admin-border" />

      <div className="flex flex-wrap items-center gap-4">
        <Button onClick={handleClick}>Padrão</Button>
        <Button variant="secondary" onClick={handleClick}>Secundário</Button>
        <Button variant="destructive" onClick={handleClick}>Destrutivo</Button>
        <Button variant="outline" onClick={handleClick}>Contorno</Button>
        <Button variant="ghost" onClick={handleClick}>Fantasma</Button>
        <Button variant="link" onClick={handleClick}>Link</Button>
        <Button size="icon" onClick={handleClick}>
          <Loader2 className="h-4 w-4" />
        </Button>
        <Button disabled>Desabilitado</Button>
        <Button disabled={loading} onClick={handleClick}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? 'Carregando...' : 'Com Loading'}
        </Button>
      </div>
    </div>
  );
};