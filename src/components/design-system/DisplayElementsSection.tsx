import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

export const DisplayElementsSection = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-admin-foreground">Elementos de Exibição</h2>
      <Separator className="bg-admin-border" />

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Badges</h3>
        <div className="flex flex-wrap gap-2">
          <Badge>Padrão</Badge>
          <Badge variant="secondary">Secundário</Badge>
          <Badge variant="destructive">Destrutivo</Badge>
          <Badge variant="outline">Contorno</Badge>
        </div>

        <h3 className="text-xl font-semibold">Cards</h3>
        <Card className="w-[350px] bg-admin-card border-admin-border text-admin-foreground">
          <CardHeader>
            <CardTitle>Título do Card</CardTitle>
            <CardDescription className="text-admin-foreground-muted">Descrição do card aqui.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Conteúdo do card. Pode ser qualquer coisa, como um resumo de dados ou um item de lista.</p>
          </CardContent>
        </Card>

        <h3 className="text-xl font-semibold">Avatars</h3>
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </div>

        <h3 className="text-xl font-semibold">Separador</h3>
        <div className="h-20 flex items-center">
          <div className="w-1/3 bg-admin-background p-4 rounded-md">Conteúdo acima</div>
          <Separator orientation="vertical" className="mx-4 bg-admin-border" />
          <div className="w-1/3 bg-admin-background p-4 rounded-md">Conteúdo abaixo</div>
        </div>
        <Separator className="bg-admin-border" />
        <div className="w-full bg-admin-background p-4 rounded-md">Conteúdo após o separador horizontal</div>

        <h3 className="text-xl font-semibold">Tooltip</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-5 w-5 text-admin-foreground-muted cursor-pointer" />
            </TooltipTrigger>
            <TooltipContent className="bg-admin-card border-admin-border text-admin-foreground">
              <p>Esta é uma dica de ferramenta.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};