import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";

const DEFAULT_TITLE = typeof document !== "undefined" ? document.title : "App";

const routeTitles: Record<string, string> = {
  "/": "Facility",
  "/setup-master": "Configuração Inicial",
  "/registrarse": "Crear Cuenta",
  "/recuperar-senha": "Recuperar Senha",
  "/recuperar-contrasena": "Recuperar Contraseña",
  // "/verificar-email": "Verificar E-mail",
  "/planes": "Planos",
  "/contacto": "Contacto",
  "/acesso-morador": "Acesso do Morador",

  "/gestor": "Painel do Gestor",
  "/gestor/administradoras": "Administradoras",
  "/gestor/condominios": "Condomínios",
  "/gestor/blocos": "Blocos",
  "/gestor/unidades": "Unidades",
  "/gestor/residentes": "Residentes",
  "/gestor/mascotas": "Mascotas",
  "/gestor/vehiculos": "Vehículos",
  "/gestor/configuracoes": "Configurações",
  "/gestor/comunicados": "Comunicados",
  "/gestor/mi-plan": "Mi Plan (Gestor)",
  "/morador-dashboard": "Painel do Morador",

  "/admin": "Dashboard",
  "/admin/minha-conta": "Minha Conta",
  "/admin/administradoras": "Administradoras",
  "/admin/condominios": "Condomínios",
  "/admin/bloques": "Blocos",
  "/admin/unidades": "Unidades",
  "/admin/areas-comunes": "Áreas Comunes",
  "/admin/usuarios": "Usuários",
  "/admin/planes": "Planes (Admin)",
  "/admin/pagos": "Pagamentos",
  "/admin/configuracoes": "Configurações",
  "/admin/notificacoes": "Notificações",
  "/admin/pagina": "Página",
  "/admin/clientes-potenciales": "Clientes Potenciales",
  "/admin/moradores": "Gestão de Moradores",
  "/design-system": "Design System",
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
        .limit(1)
        .maybeSingle();
      if (!error && data) {
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
