import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const StripeSettings = () => {
  const [publishableKey, setPublishableKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("system_settings")
        .select("id, stripe_publishable_key")
        .eq("id", 1)
        .single();

      if (error && error.code !== "PGRST116") {
        showError("Erro ao carregar configurações do Stripe.");
      }

      // Se não existir a linha com id=1, cria
      if (error && error.code === "PGRST116") {
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

  return (
    <Card className="bg-admin-card border-admin-border text-admin-foreground">
      <CardHeader>
        <CardTitle>Configuração do Stripe</CardTitle>
        <CardDescription className="text-admin-foreground-muted">
          Conecte sua conta Stripe para processar pagamentos. Armazenamos apenas a chave publicável no banco.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
          <p className="text-xs text-admin-foreground-muted">
            Esta chave é segura para uso no frontend e será salva em system_settings.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="secret-key">Chave Secreta (sk_)</Label>
          <Input
            id="secret-key"
            placeholder="sk_live_..."
            type="password"
            className="bg-admin-background border-admin-border"
            disabled
          />
          <p className="text-xs text-admin-foreground-muted">
            Por segurança, não salvamos esta chave no banco. Defina nas Edge Functions do Supabase como STRIPE_SECRET_KEY.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="webhook-secret">Webhook Secret</Label>
          <Input
            id="webhook-secret"
            placeholder="whsec_..."
            type="password"
            className="bg-admin-background border-admin-border"
            disabled
          />
          <p className="text-xs text-admin-foreground-muted">
            Configure também nas Edge Functions do Supabase como STRIPE_WEBHOOK_SECRET.
          </p>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={loading || saving}>
            {saving ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StripeSettings;