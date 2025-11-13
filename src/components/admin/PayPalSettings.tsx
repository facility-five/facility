import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const PayPalSettings: React.FC = () => {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [webhookId, setWebhookId] = useState('');
  const [sandboxMode, setSandboxMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const WEBHOOK_URL = `${window.location.origin}/api/webhooks/paypal`;

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Primeiro tentar localStorage para configuração temporária
      const localSettings = localStorage.getItem('paypal_settings');
      
      // Sempre inicializar com valores padrão primeiro
      setClientId('');
      setSandboxMode(true);
      
      // Se há configuração local, usar ela
      if (localSettings) {
        try {
          const parsed = JSON.parse(localSettings);
          setClientId(parsed.clientId || '');
          setSandboxMode(parsed.sandboxMode ?? true);
          
          toast({
            title: 'Configuração local',
            description: 'Usando configuração salva localmente.',
          });
          return;
        } catch (err) {
          console.error('Erro ao parsear localStorage:', err);
        }
      }

      // Tentar buscar do banco (sem falhar se não existir)
      try {
        const { data: settingsData } = await supabase
          .from('settings')
          .select('key, value')
          .in('key', ['paypal_client_id', 'paypal_environment']);

        if (settingsData && settingsData.length > 0) {
          const config = settingsData.reduce((acc, setting) => {
            acc[setting.key] = setting.value;
            return acc;
          }, {} as any);

          if (config.paypal_client_id) {
            setClientId(config.paypal_client_id);
            setSandboxMode((config.paypal_environment || 'sandbox') === 'sandbox');
          }
        }
      } catch (error) {
        // Ignorar erro silenciosamente - tabela pode não existir ainda
        console.log('Tabela settings não encontrada, usando configuração local');
      }

      // Se ainda não tem dados, mostrar mensagem inicial
      toast({
        title: 'Primeira configuração',
        description: 'Configure as credenciais do PayPal abaixo.',
      });
      
    } catch (error) {
      console.error('Erro geral:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Sempre salvar no localStorage como backup
      const localSettings = {
        clientId,
        sandboxMode,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem('paypal_settings', JSON.stringify(localSettings));
      
      // Tentar salvar no banco também
      try {
        const settings = [
          {
            key: 'paypal_client_id',
            value: clientId,
            description: 'PayPal Client ID para integração',
          },
          {
            key: 'paypal_environment', 
            value: sandboxMode ? 'sandbox' : 'live',
            description: 'Ambiente PayPal: sandbox ou live',
          }
        ];

        for (const setting of settings) {
          const { error } = await supabase
            .from('settings')
            .upsert(setting, { onConflict: 'key' });
          
          if (error) {
            console.log('Erro ao salvar no banco, usando localStorage:', error.message);
            break;
          }
        }
      } catch (dbError) {
        console.log('Banco não disponível, configuração salva localmente');
      }

      toast({
        title: 'Sucesso',
        description: 'Configurações do PayPal salvas com sucesso!',
      });
      
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as configurações.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const copyWebhook = () => {
    navigator.clipboard.writeText(WEBHOOK_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="bg-admin-card border-admin-border">
      <CardHeader>
        <CardTitle>Configurações do PayPal</CardTitle>
        <CardDescription>
          Configure as credenciais do PayPal para processar pagamentos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Modo Sandbox</Label>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={sandboxMode}
              onChange={(e) => setSandboxMode(e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label className="text-sm">Ativar modo sandbox (testes)</Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Client ID</Label>
          <Input
            placeholder="Insira seu Client ID do PayPal"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            disabled={loading || saving}
            className="bg-admin-background border-admin-border"
          />
        </div>

        <div className="space-y-2">
          <Label>Client Secret</Label>
          <Input
            placeholder="Defina como PAYPAL_CLIENT_SECRET nas Edge Functions"
            type="password"
            className="bg-admin-background border-admin-border"
            disabled
          />
          <p className="text-xs text-admin-foreground-muted">
            Por segurança, não salvamos esta chave no banco. Vá ao Supabase Console → Project → Edge Functions → Manage Secrets e defina PAYPAL_CLIENT_SECRET.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Webhook ID (opcional)</Label>
          <Input
            placeholder="ID do webhook do PayPal (será preenchido automaticamente)"
            value={webhookId}
            onChange={(e) => setWebhookId(e.target.value)}
            disabled={loading || saving}
            className="bg-admin-background border-admin-border"
          />
          <p className="text-xs text-admin-foreground-muted">
            Este campo será preenchido automaticamente quando o webhook for configurado.
          </p>
        </div>

        <div className="space-y-2">
          <Label>URL do Webhook</Label>
          <div className="flex gap-2">
            <Input value={WEBHOOK_URL} readOnly className="bg-admin-background border-admin-border" />
            <Button variant="outline" onClick={copyWebhook}>
              {copied ? "Copiado!" : "Copiar"}
            </Button>
          </div>
          <p className="text-xs text-admin-foreground-muted">
            Configure este endpoint no painel do PayPal (Developer → Applications → Webhooks).
          </p>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={loading || saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PayPalSettings;
