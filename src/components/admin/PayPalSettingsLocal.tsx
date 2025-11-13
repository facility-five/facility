import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Copy, CheckCircle } from 'lucide-react';

const PayPalSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    clientId: '',
    clientSecret: '',
    sandboxMode: true,
    webhookId: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const WEBHOOK_URL = `${window.location.origin}/api/webhooks/paypal`;

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    try {
      const localSettings = localStorage.getItem('paypal_settings');
      if (localSettings) {
        const parsed = JSON.parse(localSettings);
        setSettings({
          clientId: parsed.clientId || '',
          clientSecret: parsed.clientSecret || '',
          sandboxMode: parsed.sandboxMode ?? true,
          webhookId: parsed.webhookId || ''
        });
        console.log('✅ Configurações PayPal carregadas do localStorage');
      } else {
        console.log('ℹ️ Nenhuma configuração PayPal encontrada');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar configurações PayPal:', error);
      toast({
        title: 'Aviso',
        description: 'Não foi possível carregar as configurações. Usando valores padrão.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    setSaving(true);
    try {
      const settingsToSave = {
        ...settings,
        savedAt: new Date().toISOString()
      };
      
      localStorage.setItem('paypal_settings', JSON.stringify(settingsToSave));
      
      toast({
        title: '✅ Sucesso',
        description: 'Configurações do PayPal salvas localmente!',
      });
      
      console.log('✅ Configurações PayPal salvas:', {
        clientId: settings.clientId ? '***' + settings.clientId.slice(-4) : '(vazio)',
        sandboxMode: settings.sandboxMode,
        savedAt: settingsToSave.savedAt
      });
      
    } catch (error) {
      console.error('❌ Erro ao salvar configurações:', error);
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
    toast({
      title: 'Copiado',
      description: 'URL do webhook copiada para a área de transferência',
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            💳 Configurações PayPal
          </CardTitle>
          <CardDescription>
            Configure as credenciais do PayPal para processar pagamentos. As configurações são salvas localmente no navegador.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="paypal-client-id">Client ID *</Label>
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
            <Label htmlFor="paypal-client-secret">Client Secret</Label>
            <Input
              id="paypal-client-secret"
              type="password"
              placeholder="Digite o PayPal Client Secret"
              value={settings.clientSecret}
              onChange={(e) => handleInputChange('clientSecret', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paypal-webhook">Webhook ID</Label>
            <Input
              id="paypal-webhook"
              type="text"
              placeholder="ID do webhook (opcional)"
              value={settings.webhookId}
              onChange={(e) => handleInputChange('webhookId', e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="sandbox-mode">Modo Sandbox</Label>
              <p className="text-sm text-muted-foreground">
                Use Sandbox para testes, Live para produção
              </p>
            </div>
            <Switch
              id="sandbox-mode"
              checked={settings.sandboxMode}
              onCheckedChange={(checked) => handleInputChange('sandboxMode', checked)}
            />
          </div>

          <Button onClick={handleSave} disabled={saving || !settings.clientId.trim()}>
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🔗 Webhook PayPal</CardTitle>
          <CardDescription>
            Configure este URL no seu PayPal App para receber notificações de pagamento
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
            Configure os eventos: payment.capture.completed, payment.capture.denied
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-500" />
            Status da Configuração
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Client ID:</span>
              <span className={settings.clientId ? 'text-green-600' : 'text-red-500'}>
                {settings.clientId ? '✅ Configurado' : '❌ Não configurado'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Ambiente:</span>
              <span className="font-medium">
                {settings.sandboxMode ? '🧪 Sandbox (Teste)' : '🚀 Live (Produção)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Storage:</span>
              <span className="text-blue-600">💾 localStorage</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🔧 Configuração Rápida</CardTitle>
          <CardDescription>
            Para testar rapidamente, execute este código no console do navegador (F12):
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`// Configuração de teste
localStorage.setItem('paypal_settings', JSON.stringify({
  clientId: 'seu-client-id-aqui',
  sandboxMode: true
}));

// Depois recarregue a página`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayPalSettings;