import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";

const DEFAULT_TITLE = typeof document !== "undefined" ? document.title : "App";

const routeTitles: Record<string, string> = {
  "/": "Login",
  "/setup-master": "Configuração Inicial",
  "/criar-conta": "Criar Conta",
  "/recuperar-senha": "Recuperar Senha",
  "/verificar-email": "Verificar E-mail",
  "/planos": "Planos",
  "/acesso-morador": "Acesso do Morador",

  "/gestor-dashboard": "Painel do Gestor",
  "/morador-dashboard": "Painel do Morador",

  "/admin": "Dashboard",
  "/admin/minha-conta": "Minha Conta",
  "/admin/administradoras": "Administradoras",
  "/admin/condominios": "Condomínios",
  "/admin/bloques": "Blocos",
  "/admin/unidades": "Unidades",
  "/admin/areas-comunes": "Áreas Comuns",
  "/admin/comunicados": "Comunicados",
  "/admin/usuarios": "Usuários",
  "/admin/planes": "Planos (Admin)",
  "/admin/pagos": "Pagamentos",
  "/admin/configuracoes": "Configurações",
  "/admin/notificacoes": "Notificações",
};

const SystemTitle = () => {
  const { session } = useAuth();
  const location = useLocation();
  const [systemName, setSystemName] = useState<string | null>(null);
  const initialTitleRef = useRef<string>(DEFAULT_TITLE);

  // Busca pública do nome do sistema (funciona sem login)
  useEffect(() => {
    let cancelled = false;

    const fetchPublicName = async () => {
      const { data, error } = await supabase.functions.invoke("system-name");
      if (!cancelled) {
        const name = (data as any)?.system_name ?? null;
        if (!error) setSystemName(name);
      }
    };

    fetchPublicName();
    return () => { cancelled = true; };
  }, []);

  // Quando autenticado: buscar diretamente e assinar realtime para mudanças
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    const apply = (name?: string | null) => {
      if (!cancelled) setSystemName((name ?? "").trim() || null);
    };

    const fetchDirect = async () => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("system_name")
        .eq("id", 1)
        .single();
      if (!error) {
        apply(data?.system_name ?? null);
      }
    };

    if (session) {
      fetchDirect();
      channel = supabase
        .channel("system_settings_title")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "system_settings",
            filter: "id=eq.1",
          },
          (payload) => {
            const nextName =
              (payload as any)?.new?.system_name ??
              (payload as any)?.old?.system_name ??
              null;
            apply(nextName);
          }
        )
        .subscribe();
    }

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [session]);

  // Resolve o nome da rota atual
  const currentRouteTitle = useMemo(() => {
    const path = location.pathname;
    // Tenta match exato
    if (routeTitles[path]) return routeTitles[path];
    // Tenta reduzir para prefixos conhecidos (ex.: rotas aninhadas futuras)
    const found = Object.keys(routeTitles).find((key) => path.startsWith(key));
    return routeTitles[found ?? ""] ?? null;
  }, [location.pathname]);

  // Define o document.title combinando Página — Sistema
  useEffect(() => {
    const sys = (systemName ?? "").trim();
    const page = (currentRouteTitle ?? "").trim();

    if (page && sys) {
      document.title = `${page} — ${sys}`;
    } else if (sys) {
      document.title = sys;
    } else if (page) {
      document.title = `${page} — ${initialTitleRef.current}`;
    } else {
      document.title = initialTitleRef.current;
    }
  }, [systemName, currentRouteTitle]);

  return null;
};

export default SystemTitle;