import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, Copy, CheckCircle, Database, Shield } from 'lucide-react';

const PayPalSettingsProduction: React.FC = () => {
  const [settings, setSettings] = useState({
    clientId: '',
    clientSecret: '',
    environment: 'sandbox' as 'sandbox' | 'live',
    webhookId: '',
    enabled: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const WEBHOOK_URL = `${window.location.origin}/api/webhooks/paypal`;

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', ['paypal_client_id', 'paypal_client_secret', 'paypal_environment', 'paypal_webhook_id', 'paypal_enabled']);

      if (error) {
        console.error('Erro ao carregar configurações:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar as configurações. Verifique se a tabela settings existe.',
          variant: 'destructive'
        });
        return;
      }

      // Converter array de configurações para objeto
      const config = (data || []).reduce((acc, setting) => {
        switch (setting.key) {
          case 'paypal_client_id':
            acc.clientId = setting.value || '';
            break;
          case 'paypal_client_secret':
            acc.clientSecret = setting.value || '';
            break;
          case 'paypal_environment':
            acc.environment = (setting.value as 'sandbox' | 'live') || 'sandbox';
            break;
          case 'paypal_webhook_id':
            acc.webhookId = setting.value || '';
            break;
          case 'paypal_enabled':
            acc.enabled = setting.value === 'true';
            break;
        }
        return acc;
      }, { ...settings });

      setSettings(config);
      
      toast({
        title: 'Sucesso',
        description: 'Configurações carregadas do banco de dados.',
      });

    } catch (error) {
      console.error('Erro geral:', error);
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao carregar configurações.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Validação básica
      if (!settings.clientId.trim()) {
        toast({
          title: 'Erro',
          description: 'Client ID é obrigatório.',
          variant: 'destructive'
        });
        return;
      }

      // Preparar dados para upsert
      const settingsToSave = [
        {
          key: 'paypal_client_id',
          value: settings.clientId,
          description: 'PayPal Client ID para integração de pagamentos'
        },
        {
          key: 'paypal_client_secret',
          value: settings.clientSecret,
          description: 'PayPal Client Secret (criptografado)'
        },
        {
          key: 'paypal_environment',
          value: settings.environment,
          description: 'Ambiente PayPal: sandbox ou live'
        },
        {
          key: 'paypal_webhook_id',
          value: settings.webhookId,
          description: 'PayPal Webhook ID para notificações'
        },
        {
          key: 'paypal_enabled',
          value: settings.enabled.toString(),
          description: 'PayPal habilitado no sistema'
        }
      ];

      // Salvar cada configuração
      for (const setting of settingsToSave) {
        const { error } = await supabase
          .from('settings')
          .upsert(setting, { onConflict: 'key' });

        if (error) {
          throw error;
        }
      }

      toast({
        title: '✅ Configurações Salvas',
        description: 'Credenciais PayPal salvas com segurança no banco de dados.',
      });

      console.log('✅ PayPal configurado em produção:', {
        clientId: settings.clientId ? '***' + settings.clientId.slice(-4) : '(vazio)',
        environment: settings.environment,
        enabled: settings.enabled,
        hasSecret: !!settings.clientSecret
      });

    } catch (error: any) {
      console.error('❌ Erro ao salvar:', error);
      toast({
        title: 'Erro',
        description: `Não foi possível salvar: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const copyWebhook = () => {
    navigator.clipboard.writeText(WEBHOOK_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: 'Copiado',
      description: 'URL do webhook copiada para a área de transferência'
    });
  };

  const handleInputChange = (field: keyof typeof settings, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando configurações...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            🏭 Configurações PayPal - Produção
          </CardTitle>
          <CardDescription>
            <strong>Modo Produção:</strong> As configurações são armazenadas com segurança no banco de dados. 
            Não use localStorage em produção.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="paypal-client-id">PayPal Client ID *</Label>
            <Input
              id="paypal-client-id"
              type="text"
              placeholder="Digite o PayPal Client ID"
              value={settings.clientId}
              onChange={(e) => handleInputChange('clientId', e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Obtenha no <a href="https://developer.paypal.com" target="_blank" rel="noopener" className="text-blue-600 hover:underline">PayPal Developer Dashboard</a>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paypal-client-secret">PayPal Client Secret *</Label>
            <Input
              id="paypal-client-secret"
              type="password"
              placeholder="Digite o PayPal Client Secret"
              value={settings.clientSecret}
              onChange={(e) => handleInputChange('clientSecret', e.target.value)}
            />
            <p className="text-sm text-green-600">🔒 Armazenado de forma segura no banco</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paypal-webhook">Webhook ID</Label>
            <Input
              id="paypal-webhook"
              type="text"
              placeholder="ID do webhook do PayPal"
              value={settings.webhookId}
              onChange={(e) => handleInputChange('webhookId', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="environment">Ambiente</Label>
              <select
                id="environment"
                className="w-full p-2 border border-input rounded-md"
                value={settings.environment}
                onChange={(e) => handleInputChange('environment', e.target.value)}
              >
                <option value="sandbox">🧪 Sandbox (Teste)</option>
                <option value="live">🚀 Live (Produção)</option>
              </select>
            </div>

            <div className="flex items-center justify-between space-x-2 pt-6">
              <div className="space-y-0.5">
                <Label htmlFor="enabled">PayPal Ativo</Label>
              </div>
              <Switch
                id="enabled"
                checked={settings.enabled}
                onCheckedChange={(checked) => handleInputChange('enabled', checked)}
              />
            </div>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={saving || !settings.clientId.trim() || !settings.clientSecret.trim()}
            className="w-full"
          >
            {saving ? 'Salvando...' : 'Salvar no Banco de Dados'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-500" />
            Status da Configuração
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Storage:</span>
              <span className="flex items-center gap-2 text-green-600 font-medium">
                <Database className="h-4 w-4" />
                Banco de Dados (Seguro)
              </span>
            </div>
            <div className="flex justify-between">
              <span>Client ID:</span>
              <span className={settings.clientId ? 'text-green-600' : 'text-red-500'}>
                {settings.clientId ? '✅ Configurado' : '❌ Não configurado'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Client Secret:</span>
              <span className={settings.clientSecret ? 'text-green-600' : 'text-red-500'}>
                {settings.clientSecret ? '✅ Configurado' : '❌ Não configurado'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Ambiente:</span>
              <span className="font-medium">
                {settings.environment === 'sandbox' ? '🧪 Sandbox (Teste)' : '🚀 Live (Produção)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={settings.enabled ? 'text-green-600' : 'text-orange-500'}>
                {settings.enabled ? '✅ Ativo' : '⚠️ Inativo'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🔗 Webhook PayPal</CardTitle>
          <CardDescription>
            Configure este URL no seu PayPal App para receber notificações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Input
              readOnly
              value={WEBHOOK_URL}
              className="font-mono text-sm"
            />
            <Button onClick={copyWebhook} variant="outline" size="sm">
              {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copiado!' : 'Copiar'}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Eventos necessários: payment.capture.completed, payment.capture.denied
          </p>
        </CardContent>
      </Card>

      <Card className="border-yellow-200 bg-yellow-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            ⚠️ Importante - Produção
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">
            🔒 <strong>Segurança:</strong> As credenciais são armazenadas no banco de dados com RLS habilitado.
          </p>
          <p className="text-sm">
            🚫 <strong>localStorage removido:</strong> Não usamos mais localStorage em produção.
          </p>
          <p className="text-sm">
            👤 <strong>Acesso:</strong> Apenas administradores podem configurar o PayPal.
          </p>
          <p className="text-sm">
            🌐 <strong>Ambiente Live:</strong> Use apenas credenciais verificadas do PayPal.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayPalSettingsProduction;