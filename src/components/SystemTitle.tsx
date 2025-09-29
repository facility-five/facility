import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const DEFAULT_TITLE = typeof document !== "undefined" ? document.title : "App";

const SystemTitle = () => {
  const { session } = useAuth();
  const initialTitleRef = useRef<string>(DEFAULT_TITLE);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const applyTitle = (title?: string | null) => {
      const cleaned = (title || "").trim();
      document.title = cleaned || initialTitleRef.current;
    };

    const fetchAndSetTitle = async () => {
      // Sem sessão, as políticas RLS atuais não permitem SELECT em system_settings.
      if (!session) {
        applyTitle(initialTitleRef.current);
        return;
      }

      const { data, error } = await supabase
        .from("system_settings")
        .select("system_name")
        .eq("id", 1)
        .single();

      if (!error && data) {
        applyTitle(data.system_name);
      } else {
        // Mantém o título padrão caso não exista linha ou haja erro
        applyTitle(initialTitleRef.current);
      }
    };

    // Carrega título na montagem e quando a sessão mudar
    fetchAndSetTitle();

    // Assina alterações em tempo real para refletir mudanças sem recarregar
    if (session) {
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
            // payload.new pode não existir em DELETE; por segurança busca novamente
            const nextName =
              (payload as any)?.new?.system_name ??
              (payload as any)?.old?.system_name ??
              null;
            if (nextName !== null && nextName !== undefined) {
              applyTitle(nextName);
            } else {
              fetchAndSetTitle();
            }
          }
        )
        .subscribe();
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [session]);

  return null;
};

export default SystemTitle;