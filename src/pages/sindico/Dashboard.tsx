import { useMemo } from "react";
import { SyndicLayout } from "@/components/syndic/SyndicLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LayoutGrid,
  Layers,
  CalendarClock,
  ClipboardList,
} from "lucide-react";

const SyndicDashboardContent = () => {
  const loading = false;
  const condos: any[] = [];
  const blocksForSelectedCondo: any[] = [];
  const selectedCondoId = null;

  const activeCondoName = useMemo(() => {
    if (!selectedCondoId) {
      return "Selecione um condomínio";
    }
    return condos.find((condo) => condo.id === selectedCondoId)?.name ?? "Condomínio não encontrado";
  }, [condos, selectedCondoId]);

  const stats = useMemo(
    () => [
      {
        title: "Condomínios",
        value: condos.length.toString(),
        description: "Total sob sua responsabilidade",
        iconBgClass: "bg-indigo-500",
        icon: LayoutGrid,
      },
      {
        title: "Blocos no condomínio",
        value: blocksForSelectedCondo.length.toString(),
        description: "Blocos conectados ao condomínio ativo",
        iconBgClass: "bg-sky-500",
        icon: Layers,
      },
      {
        title: "Reservas pendentes",
        value: "0",
        description: "Integração em breve",
        iconBgClass: "bg-amber-500",
        icon: CalendarClock,
      },
      {
        title: "Solicitações abertas",
        value: "0",
        description: "Integração em breve",
        iconBgClass: "bg-rose-500",
        icon: ClipboardList,
      },
    ],
    [blocksForSelectedCondo.length, condos.length],
  );

  const content = () => {
    if (loading) {
      return (
        <div className="space-y-8">
          <Skeleton className="h-24 w-full rounded-xl" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-28 rounded-xl" />
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} className="h-40 rounded-xl" />
            ))}
          </div>
        </div>
      );
    }

    if (condos.length === 0) {
      return (
        <Card className="border-dashed border-indigo-300 bg-white/70 shadow-none">
          <CardHeader>
            <CardTitle>Nenhum condomínio atribuído</CardTitle>
            <CardDescription>
              Solicite ao seu administrador para vincular seu usuário a um condomínio. Assim que a vinculação ocorrer os dados aparecerão aqui automaticamente.
            </CardDescription>
          </CardHeader>
        </Card>
      );
    }

    return (
      <div className="space-y-8">
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Olá, Síndico!</CardTitle>
            <CardDescription>
              Esta é a visão geral do condomínio <strong>{activeCondoName}</strong>. Gerencie blocos, acompanhe avisos e organize atividades da comunidade em um só lugar.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.iconBgClass}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {blocksForSelectedCondo.length === 0 ? (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Nenhum bloco vinculado</CardTitle>
                <CardDescription>
                  O condomínio selecionado ainda não possui blocos registrados. Peça ao administrador para cadastrar os blocos e vinculá-los a você.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            blocksForSelectedCondo.map((block) => (
              <Card key={block.id} className="shadow-sm">
                <CardHeader>
                  <CardTitle>{block.name}</CardTitle>
                  <CardDescription>
                    Código interno: {block.code} • Status: {block.status}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-slate-600">
                  Esse bloco faz parte do condomínio {block.condoName}. Os módulos de reservas, comunicados e manutenção serão habilitados em breve.
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Painel do Síndico</h1>
        <p className="text-slate-500">
          Visão geral consolidada dos condomínios e blocos sob sua responsabilidade.
        </p>
      </div>
      {content()}
    </div>
  );
};

const SyndicDashboard = () => {
  return (
    <SyndicLayout>
      <SyndicDashboardContent />
    </SyndicLayout>
  );
};

export default SyndicDashboard;
