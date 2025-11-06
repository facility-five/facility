import { useEffect, useState } from "react";
import { supabase, SUPABASE_URL } from "@/integrations/supabase/client";
import { showRadixError, showRadixSuccess } from "@/utils/toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, ExternalLink } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Construir dinamicamente a URL do webhook com base no projeto atual do Supabase
const WEBHOOK_URL = `${SUPABASE_URL}/functions/v1/paypal-webhook`;

export const PayPalSettings = () => {
  const [clientId, setClientId] = useState("");
  const [mode, setMode] = useState<"sandbox" | "live">("sandbox");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("system_settings")
        .select("id, paypal_client_id, paypal_mode")
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        showRadixError("Erro ao carregar configurações do PayPal.");
      }

      if (error && error.code === "PGRST116") {
        // If no settings exist, insert a default row
        const { data: insertData, error: insertError } = await supabase
          .from("system_settings")
          .insert([{}])
          .select()
          .single();
        if (insertError) {
          showRadixError("Erro ao inicializar configurações.");
        } else if (insertData) {
          setSettingsId(insertData.id);
        }
      } else if (data) {
        setClientId(data.paypal_client_id || "");
        setMode((data.paypal_mode as "sandbox" | "live") || "sandbox");
        setSettingsId(data.id);
      }

      setLoading(false);
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    if (!settingsId) {
      showRadixError("Configurações não carregadas.");
      return;
    }
    
    setSaving(true);
    const { error } = await supabase
      .from("system_settings")
      .update({ 
        paypal_client_id: clientId,
        paypal_mode: mode
      })
      .eq("id", settingsId);

    if (error) {
      showRadixError("Não foi possível salvar as configurações do PayPal.");
    } else {
      showRadixSuccess("Configurações do PayPal salvas com sucesso!");
    }
    setSaving(false);
  };

  const copyWebhook = async () => {
    try {
      await navigator.clipboard.writeText(WEBHOOK_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      showRadixError("Não foi possível copiar o URL do webhook.");
    }
  };

  return (
    <Card className="bg-admin-card border-admin-border text-admin-foreground">
      <CardHeader>
        <CardTitle>Configuração do PayPal</CardTitle>
        <CardDescription className="text-admin-foreground-muted">
          Configure as credenciais do PayPal para processar pagamentos. Armazenamos apenas o Client ID no banco.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <Alert className="bg-blue-500/10 border-blue-500/50">
          <AlertCircle className="h-4 w-4 text-blue-500" />
          <AlertTitle className="text-blue-500">Como obter as credenciais</AlertTitle>
          <AlertDescription className="text-admin-foreground-muted">
            <ol className="list-decimal list-inside space-y-1 mt-2">
              <li>Acesse o <a href="https://developer.paypal.com/dashboard/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-1">PayPal Developer Dashboard <ExternalLink className="h-3 w-3" /></a></li>
              <li>Vá em "Apps & Credentials"</li>
              <li>Selecione o modo (Sandbox ou Live)</li>
              <li>Em "REST API apps", clique em "Default Application" ou crie uma nova</li>
              <li>Copie o Client ID</li>
            </ol>
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="paypal-mode">Modo de Operação</Label>
          <Select value={mode} onValueChange={(value: "sandbox" | "live") => setMode(value)} disabled={loading || saving}>
            <SelectTrigger id="paypal-mode" className="bg-admin-background border-admin-border">
              <SelectValue placeholder="Selecione o modo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sandbox">Sandbox (Testes)</SelectItem>
              <SelectItem value="live">Live (Produção)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-admin-foreground-muted">
            Use "Sandbox" para testes e "Live" para produção.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="client-id">Client ID</Label>
          <Input
            id="client-id"
            placeholder={mode === "sandbox" ? "Sandbox Client ID" : "Live Client ID"}
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            disabled={loading || saving}
            className="bg-admin-background border-admin-border font-mono text-sm"
          />
          <p className="text-xs text-admin-foreground-muted">
            Chave pública do PayPal que será usada no frontend.
          </p>
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={loading || saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Secret Key</Label>
          <Input
            placeholder="Defina como PAYPAL_SECRET_KEY nas Edge Functions"
            type="password"
            className="bg-admin-background border-admin-border"
            disabled
          />
          <p className="text-xs text-admin-foreground-muted">
            Por segurança, não salvamos esta chave no banco. Vá ao Supabase Console → Project → Edge Functions → Manage Secrets e defina PAYPAL_SECRET_KEY.
          </p>
        </div>

        <div className="space-y-2">
          <Label>URL do Webhook (Futuro)</Label>
          <div className="flex gap-2">
            <Input value={WEBHOOK_URL} readOnly className="bg-admin-background border-admin-border font-mono text-sm" />
            <Button variant="outline" onClick={copyWebhook}>
              {copied ? "Copiado!" : "Copiar"}
            </Button>
          </div>
          <p className="text-xs text-admin-foreground-muted">
            Configure este endpoint no PayPal Dashboard quando implementar webhooks (Webhooks → Add Webhook).
          </p>
        </div>

        <Alert className="bg-yellow-500/10 border-yellow-500/50">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          <AlertTitle className="text-yellow-500">Contas de Teste (Sandbox)</AlertTitle>
          <AlertDescription className="text-admin-foreground-muted">
            No modo Sandbox, você pode criar contas de teste (Business e Personal) em:
            <br />
            <a href="https://developer.paypal.com/dashboard/accounts" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline inline-flex items-center gap-1 mt-1">
              PayPal Sandbox Accounts <ExternalLink className="h-3 w-3" />
            </a>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default PayPalSettings;
