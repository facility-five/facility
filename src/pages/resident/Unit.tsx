import { useEffect, useState, useCallback } from "react";
import { ResidentLayout } from "@/components/resident/ResidentLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { showRadixSuccess } from "@/utils/toast";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { 
  Home, 
  Users, 
  MapPin, 
  Car, 
  Bed, 
  Ruler, 
  Building, 
  Edit,
  UserPlus,
  Phone,
  Mail,
  Calendar,
  User
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type UnitInfo = {
  id: string;
  code: string;
  number: string;
  floor: number;
  size: string;
  rooms: number;
  has_parking: boolean;
  is_occupied: boolean;
  blocks: { name: string } | null;
  condominiums: { name: string } | null;
};

type ResidentInfo = {
  id: string;
  code: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  document: string | null;
  is_owner: boolean;
  is_tenant: boolean;
  status: string;
  entry_date: string | null;
  birth_date: string | null;
};

const Unit = () => {
  const { user } = useAuth();
  const { showError } = useErrorHandler();
  const [unitInfo, setUnitInfo] = useState<UnitInfo | null>(null);
  const [residents, setResidents] = useState<ResidentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentResident, setCurrentResident] = useState<ResidentInfo | null>(null);

  const fetchUnitAndResidents = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);

    try {
      // First, get the current resident's information
      const { data: residentData, error: residentError } = await supabase
        .from("residents")
        .select("*")
        .eq("profile_id", user.id)
        .single();

      if (residentError) {
        console.error("Error fetching resident:", residentError);
        showError("Erro ao buscar informações do morador: " + residentError.message, "UNIT_RESIDENT_FETCH_ERROR");
        setLoading(false);
        return;
      }

      setCurrentResident(residentData);

      if (!residentData.unit_id) {
        setLoading(false);
        return;
      }

      // Get unit information
      const { data: unitData, error: unitError } = await supabase
        .from("units")
        .select("*, blocks(name, condominiums(name))")
        .eq("id", residentData.unit_id)
        .single();

      if (unitError) {
        console.error("Error fetching unit:", unitError);
        showError("Erro ao buscar informações da unidade: " + unitError.message, "UNIT_INFO_FETCH_ERROR");
      } else {
        setUnitInfo({ ...unitData, condominiums: unitData?.blocks?.condominiums || null });
      }

      // Get all residents of the same unit
      const { data: residentsData, error: residentsError } = await supabase
        .from("residents")
        .select("id, code, full_name, email, phone, document, is_owner, is_tenant, status, entry_date, birth_date")
        .eq("unit_id", residentData.unit_id)
        .eq("status", "active")
        .order("full_name");

      if (residentsError) {
        console.error("Error fetching residents:", residentsError);
        showError("Erro ao buscar moradores da unidade: " + residentsError.message, "UNIT_RESIDENTS_FETCH_ERROR");
      } else {
        setResidents(residentsData || []);
      }
    } catch (error: unknown) {
      console.error("Unexpected error:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      showError("Erro inesperado ao carregar dados: " + errorMessage, "UNIT_RESIDENTS_ERROR");
    }

    setLoading(false);
  }, [user?.id, showError]);

  useEffect(() => {
    fetchUnitAndResidents();
  }, [fetchUnitAndResidents]);

  const getResidentTypeLabel = (isOwner: boolean, isTenant: boolean) => {
    if (isOwner && isTenant) return "Proprietário / Inquilino";
    if (isOwner) return "Proprietário";
    if (isTenant) return "Inquilino";
    return "Morador";
  };

  const getResidentTypeBadge = (isOwner: boolean, isTenant: boolean) => {
    const label = getResidentTypeLabel(isOwner, isTenant);
    const variant = isOwner ? "default" : "secondary";
    return <Badge variant={variant}>{label}</Badge>;
  };

  if (loading) {
    return (
      <ResidentLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Minha Unidade</h1>
            <p className="text-muted-foreground">
              Informações sobre sua unidade e moradores.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          </div>
        </div>
      </ResidentLayout>
    );
  }

  if (!currentResident?.unit_id) {
    return (
      <ResidentLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Minha Unidade</h1>
            <p className="text-muted-foreground">
              Informações sobre sua unidade e moradores.
            </p>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Home className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma unidade associada</h3>
              <p className="text-muted-foreground text-center">
                Você ainda não possui uma unidade associada ao seu perfil. 
                Entre em contato com a administração do condomínio.
              </p>
            </CardContent>
          </Card>
        </div>
      </ResidentLayout>
    );
  }

  return (
    <ResidentLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Minha Unidade</h1>
            <p className="text-muted-foreground">
              Informações sobre sua unidade e moradores.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Unit Information Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Informações da Unidade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {unitInfo ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Número</p>
                        <p className="text-sm text-muted-foreground">{unitInfo.number}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Andar</p>
                        <p className="text-sm text-muted-foreground">{unitInfo.floor}º</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Bed className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Quartos</p>
                        <p className="text-sm text-muted-foreground">{unitInfo.rooms || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Tamanho</p>
                        <p className="text-sm text-muted-foreground">{unitInfo.size || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Estacionamento</p>
                      <Badge variant={unitInfo.has_parking ? "default" : "secondary"}>
                        {unitInfo.has_parking ? "Sim" : "Não"}
                      </Badge>
                    </div>
                  </div>

                  {unitInfo.blocks && (
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Bloco</p>
                        <p className="text-sm text-muted-foreground">{unitInfo.blocks.name}</p>
                      </div>
                    </div>
                  )}

                  {unitInfo.condominiums && (
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Condomínio</p>
                        <p className="text-sm text-muted-foreground">{unitInfo.condominiums.name}</p>
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <Badge variant={unitInfo.is_occupied ? "destructive" : "default"}>
                      {unitInfo.is_occupied ? "Ocupada" : "Disponível"}
                    </Badge>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">Informações da unidade não disponíveis.</p>
              )}
            </CardContent>
          </Card>

          {/* Residents Summary Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Moradores ({residents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {residents.length > 0 ? (
                <div className="space-y-3">
                  {residents.slice(0, 3).map((resident) => (
                    <div key={resident.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <User className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{resident.full_name}</p>
                          <div className="flex items-center gap-2">
                            {getResidentTypeBadge(resident.is_owner, resident.is_tenant)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {residents.length > 3 && (
                    <p className="text-sm text-muted-foreground text-center">
                      +{residents.length - 3} outros moradores
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum morador encontrado.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detailed Residents Table */}
        {residents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Todos os Moradores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Data de Entrada</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {residents.map((resident) => (
                    <TableRow key={resident.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{resident.full_name}</p>
                          <p className="text-sm text-muted-foreground">{resident.code}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getResidentTypeBadge(resident.is_owner, resident.is_tenant)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {resident.email && (
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3" />
                              <span className="text-muted-foreground">{resident.email}</span>
                            </div>
                          )}
                          {resident.phone && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3" />
                              <span className="text-muted-foreground">{resident.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {resident.entry_date ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(resident.entry_date).toLocaleDateString()}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={resident.status === "active" ? "default" : "secondary"}>
                          {resident.status === "active" ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </ResidentLayout>
  );
};

export default Unit;
