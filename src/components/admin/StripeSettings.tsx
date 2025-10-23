import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const WEBHOOK_URL = "https://riduqdqarirfqouazgwf.supabase.co/functions/v1/stripe-webhook";

export const StripeSettings = () => {
  const [publishableKey, setPublishableKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("system_settings")
        .select("id, stripe_publishable_key")
        .eq("id", 1)
        .single();

      if (error && error.code !== "PGRST116") { // PGRST116 means no rows found
        showError("Erro ao carregar configurações do Stripe.");
      }

      if (error && error.code === "PGRST116") {
        // If no settings exist, insert a default row
        const { error: insertError } = await supabase
          .from("system_settings")
          .insert([{ id: 1 }]);
        if (insertError) {
          showError("Erro ao inicializar configurações.");
        }
      } else if (data) {
        setPublishableKey(data.stripe_publishable_key || "");
      }

      setLoading(false);
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("system_settings")
      .upsert({ id: 1, stripe_publishable_key: publishableKey });

    if (error) {
      showError("Não foi possível salvar a chave publicável.");
    } else {
      showSuccess("Chave publicável do Stripe salva com sucesso!");
    }
    setSaving(false);
  };

  const copyWebhook = async () => {
    try {
      await navigator.clipboard.writeText(WEBHOOK_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      showError("Não foi possível copiar o URL do webhook.");
    }
  };

  return (
    <Card className="bg-admin-card border-admin-border text-admin-foreground">
      <CardHeader>
        <CardTitle>Configuração do Stripe</CardTitle>
        <CardDescription className="text-admin-foreground-muted">
          Armazenamos apenas a chave publicável no banco. Defina as chaves secretas nas Edge Functions do Supabase.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-2">
          <Label htmlFor="publishable-key">Chave Publicável (pk_)</Label>
          <Input
            id="publishable-key"
            placeholder="pk_live_..."
            value={publishableKey}
            onChange={(e) => setPublishableKey(e.target.value)}
            disabled={loading || saving}
            className="bg-admin-background border-admin-border"
          />
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={loading || saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Chave Secreta (sk_)</Label>
          <Input
            placeholder="Defina como STRIPE_SECRET_KEY nas Edge Functions"
            type="password"
            className="bg-admin-background border-admin-border"
            disabled
          />
          <p className="text-xs text-admin-foreground-muted">
            Por segurança, não salvamos esta chave no banco. Vá ao Supabase Console → Project → Edge Functions → Manage Secrets e defina STRIPE_SECRET_KEY.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Webhook Secret (whsec_)</Label>
          <Input
            placeholder="Defina como STRIPE_WEBHOOK_SECRET nas Edge Functions"
            type="password"
            className="bg-admin-background border-admin-border"
            disabled
          />
          <p className="text-xs text-admin-foreground-muted">
            No Stripe, crie um webhook apontando para a URL abaixo e copie o segredo (whsec_...) para STRIPE_WEBHOOK_SECRET nas Edge Functions.
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
            Configure este endpoint no painel do Stripe (Events → Add endpoint).
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StripeSettings;