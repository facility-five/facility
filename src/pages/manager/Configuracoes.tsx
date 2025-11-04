import React, { useState } from 'react';
import { ManagerLayout } from '@/components/manager/ManagerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Settings, 
  Users, 
  Bell, 
  Shield, 
  Palette, 
  Database,
  ChevronRight,
  HelpCircle,
  Info
} from 'lucide-react';

// Importar os modais
import { AdminConfigModal } from '@/components/manager/modals/AdminConfigModal';
import { UserManagementModal } from '@/components/manager/modals/UserManagementModal';
import { NotificationConfigModal } from '@/components/manager/modals/NotificationConfigModal';
import { SecurityConfigModal } from '@/components/manager/modals/SecurityConfigModal';
import { PersonalizationModal } from '@/components/manager/modals/PersonalizationModal';
import { GeneralConfigModal } from '@/components/manager/modals/GeneralConfigModal';

// Importar componentes float
import { FloatMenu, FloatNotification, useFloatNotifications } from '@/components/float';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const ManagerConfiguracoes = () => {
  const [openModal, setOpenModal] = useState<string | null>(null);
  const { addNotification } = useFloatNotifications();

  const configSections = [
    {
      id: "admin",
      title: "Administradora",
      description: "Configure informações da administradora, dados fiscais e documentos",
      icon: Settings,
      color: "purple"
    },
    {
      id: "users",
      title: "Gestão de Usuários",
      description: "Gerencie usuários, permissões e controle de acesso",
      icon: Users,
      color: "blue"
    },
    {
      id: "notifications",
      title: "Notificações",
      description: "Configure notificações por email, SMS e push",
      icon: Bell,
      color: "green"
    },
    {
      id: "security",
      title: "Segurança",
      description: "Configurações de segurança, 2FA e auditoria",
      icon: Shield,
      color: "red"
    },
    {
      id: "personalization",
      title: "Personalização",
      description: "Personalize tema, layout e preferências do sistema",
      icon: Palette,
      color: "orange"
    },
    {
      id: "general",
      title: "Configurações Gerais",
      description: "Configurações do sistema, backup e integrações",
      icon: Database,
      color: "gray"
    }
  ];

  const handleOpenModal = (modalId: string) => {
    setOpenModal(modalId);
    
    // Exemplo de notificação float
    addNotification({
      title: "Modal Aberto",
      message: `Abrindo configurações de ${configSections.find(s => s.id === modalId)?.title}`,
      type: "info",
      duration: 2000
    });
  };

  const handleCloseModal = () => {
    setOpenModal(null);
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600",
      yellow: "bg-yellow-100 text-yellow-600",
      red: "bg-red-100 text-red-600",
      purple: "bg-purple-100 text-purple-600",
      gray: "bg-gray-100 text-gray-600"
    };
    return colorMap[color as keyof typeof colorMap] || "bg-gray-100 text-gray-600";
  };

  return (
    <TooltipProvider>
      <ManagerLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Configurações</h1>
              <p className="text-muted-foreground">
                Gerencie as configurações da sua administradora.
              </p>
            </div>
            
            {/* Exemplo de Float Menu */}
            <FloatMenu
              items={[
                {
                  id: 'help',
                  label: 'Ajuda',
                  icon: HelpCircle,
                  onClick: () => addNotification({
                    title: "Ajuda",
                    message: "Documentação em desenvolvimento",
                    type: "info"
                  })
                },
                {
                  id: 'about',
                  label: 'Sobre o Sistema',
                  icon: Info,
                  onClick: () => addNotification({
                    title: "Sistema Facility",
                    message: "Versão 1.0.0 - Gestão de Condomínios",
                    type: "success"
                  })
                }
              ]}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {configSections.map((section, index) => {
              const IconComponent = section.icon;
              return (
                <Card 
                  key={index} 
                  className="hover:shadow-lg transition-all duration-200 cursor-pointer group hover:scale-105"
                  onClick={() => handleOpenModal(section.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className={`p-2 rounded-lg ${getColorClasses(section.color)}`}>
                              <IconComponent className="h-5 w-5" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Clique para configurar {section.title}</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <div>
                          <CardTitle className="text-lg group-hover:text-purple-600 transition-colors">
                            {section.title}
                          </CardTitle>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">
                      {section.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Modais */}
          <AdminConfigModal 
            open={openModal === "admin"} 
            onOpenChange={(open) => !open && handleCloseModal()} 
          />
          <UserManagementModal 
            open={openModal === "users"} 
            onOpenChange={(open) => !open && handleCloseModal()} 
          />
          <NotificationConfigModal 
            open={openModal === "notifications"} 
            onOpenChange={(open) => !open && handleCloseModal()} 
          />
          <SecurityConfigModal 
            open={openModal === "security"} 
            onOpenChange={(open) => !open && handleCloseModal()} 
          />
          <PersonalizationModal 
            open={openModal === "personalization"} 
            onOpenChange={(open) => !open && handleCloseModal()} 
          />
          <GeneralConfigModal 
            open={openModal === "general"} 
            onOpenChange={(open) => !open && handleCloseModal()} 
          />
        </div>
      </ManagerLayout>
    </TooltipProvider>
  );
};

export default ManagerConfiguracoes;