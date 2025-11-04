import { useEffect, useMemo, useState } from "react";
import { ResidentLayout } from "@/components/resident/ResidentLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ResidentStatCard } from "@/components/resident/ResidentStatCard";
import { Megaphone, Clock, AlertTriangle, Archive } from "lucide-react";
import { useTranslation } from "react-i18next";

type Communication = {
  id: string;
  code: string | null;
  title: string;
  content: string | null;
  expiration_date: string | null;
  created_at: string;
  condominiums?: { name: string } | null;
};

type ResidentInfo = {
  id: string;
  full_name: string;
  condo_id: string | null;
  block_id: string | null;
  unit_id: string | null;
  condominiums?: { name: string } | null;
  blocks?: { name: string } | null;
  units?: { number: string } | null;
};

type StatusFilter = "all" | "active" | "expired";

type ExpirationDetails = {
  label: string;
  className: string;
  isExpired: boolean;
  daysUntilExpiration: number | null;
  isExpiringSoon: boolean;
};

const normalizeToStartOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const getExpirationDetails = (dateString: string | null): ExpirationDetails => {
  if (!dateString) {
    return {
      label: "Sem prazo",
      className: "bg-slate-200 text-slate-700",
      isExpired: false,
      daysUntilExpiration: null,
      isExpiringSoon: false,
    };
  }

  const today = normalizeToStartOfDay(new Date());
  const target = normalizeToStartOfDay(new Date(dateString));
  const diffDays = Math.ceil(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays < 0) {
    return {
      label: "Expirado",
      className: "bg-rose-100 text-rose-600",
      isExpired: true,
      daysUntilExpiration: diffDays,
      isExpiringSoon: false,
    };
  }

  if (diffDays === 0) {
    return {
      label: "Expira hoje",
      className: "bg-amber-100 text-amber-600",
      isExpired: false,
      daysUntilExpiration: diffDays,
      isExpiringSoon: true,
    };
  }

  if (diffDays <= 3) {
    return {
      label: `Expira em ${diffDays} dia${diffDays === 1 ? "" : "s"}`,
      className: "bg-amber-100 text-amber-600",
      isExpired: false,
      daysUntilExpiration: diffDays,
      isExpiringSoon: true,
    };
  }

  return {
    label: `Expira em ${diffDays} dia${diffDays === 1 ? "" : "s"}`,
    className: "bg-emerald-100 text-emerald-700",
    isExpired: false,
    daysUntilExpiration: diffDays,
    isExpiringSoon: diffDays <= 7,
  };
};

const isRecentCommunication = (createdAt: string) => {
  const diffMs = Date.now() - new Date(createdAt).getTime();
  return diffMs <= 7 * 24 * 60 * 60 * 1000;
};

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("pt-BR");

const formatDateTime = (dateString: string) =>
  new Date(dateString).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });

const Communications = () => {
  const { user } = useAuth();
  const { showError } = useErrorHandler();
  const { t } = useTranslation();
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [residentInfo, setResidentInfo] = useState<ResidentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    let isActive = true;

    const loadData = async () => {
      if (!user) {
        setResidentInfo(null);
        setCommunications([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data: resident, error: residentError } = await supabase
        .from("residents")
        .select(
          "id, full_name, condo_id, block_id, unit_id, condominiums(name), blocks(name), units(number)",
        )
        .eq("profile_id", user.id)
        .maybeSingle();

      if (!isActive) {
        return;
      }

      if (residentError) {
        showError("Nao foi possivel carregar seus dados de morador.", "COMMUNICATIONS_RESIDENT_ERROR");
      }

      setResidentInfo(resident ?? null);

      if (!resident?.condo_id) {
        setCommunications([]);
        setLoading(false);
        return;
      }

      const { data: communicationsData, error: communicationsError } =
        await supabase
          .from("communications")
          .select(
            "id, code, title, content, expiration_date, created_at, condominiums(name)",
          )
          .eq("condo_id", resident.condo_id)
          .order("created_at", { ascending: false });

      if (!isActive) {
        return;
      }

      if (communicationsError) {
        showError("Nao foi possivel carregar os comunicados.", "COMMUNICATIONS_LOAD_ERROR");
        setCommunications([]);
      } else {
        setCommunications(communicationsData || []);
      }

      setLoading(false);
    };

    loadData();

    return () => {
      isActive = false;
    };
  }, [user]);

  const stats = useMemo(() => {
    const total = communications.length;
    let active = 0;
    let expiringSoon = 0;
    let expired = 0;

    communications.forEach((comm) => {
      const info = getExpirationDetails(comm.expiration_date);
      if (info.isExpired) {
        expired += 1;
      } else {
        active += 1;
        if (info.isExpiringSoon) {
          expiringSoon += 1;
        }
      }
    });

    return { total, active, expiringSoon, expired };
  }, [communications]);

  const filteredCommunications = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return communications.filter((comm) => {
      const info = getExpirationDetails(comm.expiration_date);

      if (statusFilter === "active" && info.isExpired) {
        return false;
      }

      if (statusFilter === "expired" && !info.isExpired) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = `${comm.title ?? ""} ${comm.content ?? ""} ${
        comm.code ?? ""
      }`.toLowerCase();
      return haystack.includes(query);
    });
  }, [communications, searchTerm, statusFilter]);

  const showResidentWarning =
    !loading && (!residentInfo || !residentInfo.condo_id);

  return (
    <ResidentLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t('resident.communications.title')}</h1>
            <p className="text-muted-foreground">
              {t('resident.communications.description')}
            </p>
          </div>
          {residentInfo && (
            <div className="rounded-lg border border-purple-100 bg-white px-5 py-4 shadow-sm">
              <p className="text-xs font-semibold uppercase text-purple-600">
                {t('resident.communications.yourCondominium')}
              </p>
              <p className="text-sm font-semibold text-foreground">
                {residentInfo.condominiums?.name ?? "No vinculado"}
              </p>
              <div className="mt-2 flex flex-col gap-1 text-xs text-muted-foreground">
                {residentInfo.blocks?.name && (
                  <span>
                    Bloco:{" "}
                    <span className="font-medium text-foreground">
                      {residentInfo.blocks.name}
                    </span>
                  </span>
                )}
                {residentInfo.units?.number && (
                  <span>
                    Unidade:{" "}
                    <span className="font-medium text-foreground">
                      {residentInfo.units.number}
                    </span>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ResidentStatCard
            title="Total de comunicados"
            value={stats.total.toString()}
            icon={Megaphone}
            iconColorClass="text-purple-600"
          />
          <ResidentStatCard
            title="Ativos"
            value={stats.active.toString()}
            icon={Clock}
            iconColorClass="text-emerald-600"
          />
          <ResidentStatCard
            title="Expirando em ate 7 dias"
            value={stats.expiringSoon.toString()}
            icon={AlertTriangle}
            iconColorClass="text-amber-500"
          />
          <ResidentStatCard
            title="Expirados"
            value={stats.expired.toString()}
            icon={Archive}
            iconColorClass="text-slate-500"
          />
        </div>

        {showResidentWarning && (
          <Alert className="border-amber-200 bg-amber-50 text-amber-700">
            <AlertTitle>{t('resident.communications.noRegistrationAlert.title')}</AlertTitle>
            <AlertDescription>
              {t('resident.communications.noRegistrationAlert.description')}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={t('resident.communications.searchPlaceholder')}
            className="bg-white md:w-1/2"
          />
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as StatusFilter)}
          >
            <SelectTrigger className="bg-white md:w-[220px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="active">Apenas ativos</SelectItem>
              <SelectItem value="expired">Apenas expirados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="border bg-white shadow-sm">
                <CardHeader className="space-y-2">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-11/12" />
                  <Skeleton className="h-4 w-5/6" />
                </CardContent>
              </Card>
            ))
          ) : filteredCommunications.length > 0 ? (
            filteredCommunications.map((communication) => {
              const status = getExpirationDetails(communication.expiration_date);
              const recent = isRecentCommunication(communication.created_at);

              return (
                <Card
                  key={communication.id}
                  className="border bg-white shadow-sm"
                >
                  <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-xl">
                        {communication.title}
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        Publicado em {formatDateTime(communication.created_at)}
                        {communication.code
                          ? ` • Codigo ${communication.code}`
                          : ""}
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap items-start justify-end gap-2">
                      {recent && (
                        <Badge className="bg-purple-100 text-purple-700">
                          Novo
                        </Badge>
                      )}
                      <Badge className={status.className}>{status.label}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                      {communication.content?.trim() ||
                        "Nenhum detalhe adicional informado."}
                    </p>
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      {communication.expiration_date && (
                        <span>
                          Valido ate{" "}
                          <span className="font-medium text-foreground">
                            {formatDate(communication.expiration_date)}
                          </span>
                        </span>
                      )}
                      {communication.condominiums?.name && (
                        <span>
                          Condominio{" "}
                          <span className="font-medium text-foreground">
                            {communication.condominiums.name}
                          </span>
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="border border-dashed bg-white text-center shadow-sm">
              <CardContent className="py-16">
                <Archive className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
                <p className="text-lg font-semibold text-foreground">
                  Nenhum comunicado encontrado
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Ajuste a busca ou aguarde novos comunicados da administracao.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ResidentLayout>
  );
};

export default Communications;

