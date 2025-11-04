import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { showRadixError, showRadixSuccess } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { EmailTemplate } from "./EmailTemplateFormModal";

export const EmailTemplatesTab = () => {
  const [templates, setTemplates] = useState<Record<string, EmailTemplate | null>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("welcome");
  const [subject, setSubject] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [sendingTest, setSendingTest] = useState<boolean>(false);

  const categories = [
    { id: "welcome", label: "Boas-vindas", name: "resident-welcome" },
    { id: "payment_success", label: "Pagamento Bem-sucedido", name: "payment-success" },
    { id: "payment_failed", label: "Falha no Pagamento", name: "payment-failed" },
    { id: "invoice_reminder", label: "Lembrete de Fatura", name: "invoice-reminder" },
  ];

  const fetchTemplates = async () => {
    setLoading(true);
    const names = categories.map(c => c.name);
    const { data, error } = await supabase
      .from("email_templates")
      .select("*")
      .in("name", names);

    if (error) {
      showRadixError("Erro ao buscar modelos de e-mail.");
    } else {
      const byName: Record<string, EmailTemplate | null> = {};
      names.forEach(n => { byName[n] = null; });
      (data || []).forEach((t: EmailTemplate) => { byName[t.name] = t; });
      setTemplates(byName);
      const activeName = categories.find(c => c.id === activeTab)?.name || names[0];
      const tpl = byName[activeName];
      setSubject(tpl?.subject || "");
      setBody(tpl?.body || "");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const name = categories.find(c => c.id === tabId)?.name;
    const tpl = name ? templates[name] : null;
    setSubject(tpl?.subject || "");
    setBody(tpl?.body || "");
  };

  const saveCurrent = async () => {
    const name = categories.find(c => c.id === activeTab)?.name;
    if (!name) return;

    const { data: existing, error: findError } = await supabase
      .from("email_templates")
      .select("id")
      .eq("name", name)
      .maybeSingle();

    if (findError) {
      showRadixError(findError.message);
      return;
    }

    let error;
    if (existing?.id) {
      const { error: updErr } = await supabase
        .from("email_templates")
        .update({ subject, body, status: "active" })
        .eq("id", existing.id);
      error = updErr;
    } else {
      const { error: insErr } = await supabase
        .from("email_templates")
        .insert([{ name, subject, body, status: "active" }]);
      error = insErr;
    }

    if (error) {
      showRadixError(error.message);
      return;
    }
    showRadixSuccess("Template salvo com sucesso!");
    fetchTemplates();
  };

  const sendTest = async () => {
    try {
      setSendingTest(true);
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        showRadixError(userError.message);
        return;
      }
      const to = userData?.user?.email;
      if (!to) {
        showRadixError("Faça login para enviar um teste.");
        return;
      }

      const { data, error } = await supabase.functions.invoke('send-template-test', {
        body: {
          to,
          subject,
          html: body,
        },
      });

      if (error) {
        showRadixError(error.message || "Falha ao enviar e-mail de teste.");
        return;
      }
      showRadixSuccess("E-mail de teste enviado!");
    } catch (err: any) {
      showRadixError(err?.message || "Erro ao enviar teste.");
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <>
      <Card className="bg-admin-card border-admin-border text-admin-foreground">
        <CardHeader>
          <CardTitle>Modelos de E-mail</CardTitle>
          <CardDescription className="text-admin-foreground-muted">
            Configure o assunto e conteúdo HTML do e-mail.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="flex w-full gap-2 bg-admin-card border-admin-border">
              {categories.map(cat => (
                <TabsTrigger
                  key={cat.id}
                  value={cat.id}
                  className="flex-1 justify-center focus:bg-purple-600 focus:text-white focus:outline-none focus:ring-0 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                >
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {categories.map(cat => (
              <TabsContent key={cat.id} value={cat.id}>
                {loading ? (
                  <div className="space-y-4 mt-4">
                    <Skeleton className="h-10 w-full bg-admin-border" />
                    <Skeleton className="h-40 w-full bg-admin-border" />
                  </div>
                ) : (
                  <div className="space-y-6 mt-6">
                    <div>
                      <Label className="text-sm">Assunto do E-mail</Label>
                      <Input
                        placeholder="Ex: Bem-vindo à {{platform_name}}!"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="mt-2 bg-admin-background border-admin-border"
                      />
                      <p className="text-xs text-admin-foreground-muted mt-2">
                        Use variáveis como {"{{first_name}}"} para personalizar o assunto.
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm">Conteúdo HTML</Label>
                      <Textarea
                        placeholder="Cole o HTML do template aqui..."
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        className="mt-2 min-h-[220px] bg-admin-background border-admin-border"
                      />
                      <p className="text-xs text-admin-foreground-muted mt-2">
                        Suporte a placeholders como {"{{first_name}}"}, {"{{condo_name}}"} e {"{{date}}"}.
                      </p>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        className="bg-purple-600 text-white hover:bg-purple-700 focus:bg-purple-600 focus:text-white data-[state=active]:bg-purple-600"
                        onClick={sendTest}
                        disabled={sendingTest || !subject || !body}
                      >
                        Enviar Teste
                      </Button>
                      <Button className="bg-purple-600 hover:bg-purple-700" onClick={saveCurrent}>Salvar Template</Button>
                    </div>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
};