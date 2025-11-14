import { useEffect, useState } from "react";
import { ManagerLayout } from "@/components/manager/ManagerLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { showRadixError, showRadixSuccess } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ManagerTable,
  ManagerTableBody,
  ManagerTableCell,
  ManagerTableHead,
  ManagerTableHeader,
  ManagerTableRow,
} from "@/components/manager/ManagerTable";
import { Pencil, Trash2, Plus } from "lucide-react";
import { NewCommunicationModal } from "@/components/manager/NewCommunicationModal";
import { DeleteCommunicationModal } from "@/components/manager/DeleteCommunicationModal";
import { useTranslation } from "react-i18next";


import { useManagerAdministradoras } from "@/contexts/ManagerAdministradorasContext";

export type Communication = {
  id: string;
  code: string;
  title: string;
  content: string;
  expiration_date: string;
  condominiums: { name: string } | null;
  [key: string]: any;
};

type Condominium = {
  id: string;
  name: string;
};

const Communications = () => {
  const { t } = useTranslation();
  const { activeAdministratorId } = useManagerAdministradoras();

  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCommunication, setSelectedCommunication] = useState<Communication | null>(null);
  const [condominiums, setCondominiums] = useState<Condominium[]>([]);
  const [selectedCondominium, setSelectedCondominium] = useState<string>("all");

  const fetchCommunications = async () => {
    if (!activeAdministratorId) {
      setLoading(false);
      setCommunications([]);
      return;
    }

    try {
      setLoading(true);
      
      const { data: condosData, error: condosError } = await supabase
        .from("condominiums")
        .select("id, name")
        .eq("administrator_id", activeAdministratorId)
        .order("name");

      if (condosError) {
        console.error("Error fetching condominiums:", condosError);
        showRadixError(t("manager.communications.errorFetching"));
        setCommunications([]);
        return;
      }

      setCondominiums(condosData || []);

      const condoIds = (condosData || []).map(c => c.id);
      if (condoIds.length === 0) {
        setCommunications([]);
        return;
      }

      const filterIds = selectedCondominium === "all" ? condoIds : [selectedCondominium];

      const { data, error } = await supabase
        .from("communications")
        .select("*")
        .in("condo_id", filterIds)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching communications:", error);
        showRadixError(t("manager.communications.errorFetching"));
        return;
      }

      const withNames = (data || []).map((comm: any) => ({
        ...comm,
        condominiums: { name: (condosData || []).find(c => c.id === comm.condo_id)?.name || null }
      }));

      setCommunications(withNames);
    } catch (error) {
      console.error("Error:", error);
      showRadixError(t("manager.communications.errorFetching"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 Comunicados: activeAdministratorId mudou para:', activeAdministratorId);
    if (activeAdministratorId) {
      fetchCommunications();
    } else {
      console.log('🔄 Comunicados: Nenhuma administradora selecionada, limpando lista');
      setCommunications([]);
      setLoading(false);
    }
  }, [activeAdministratorId, selectedCondominium]);

  const handleNew = () => {
    setSelectedCommunication(null);
    setIsNewModalOpen(true);
  };

  const handleEdit = (comm: Communication) => {
    setSelectedCommunication(comm);
    setIsNewModalOpen(true);
  };

  const openDeleteModal = (comm: Communication) => {
    setSelectedCommunication(comm);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedCommunication) return;

    try {
      const { error } = await supabase
        .from("communications")
        .delete()
        .eq("id", selectedCommunication.id);

      if (error) throw error;

      showRadixSuccess(t("manager.communications.deleteSuccess"));

      fetchCommunications();
      setIsDeleteModalOpen(false);
      setSelectedCommunication(null);
    } catch (error) {
      console.error("Error deleting communication:", error);
      showRadixError(t("manager.communications.errorFetching"));
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-PT').format(date);
  };

  return (
    <ManagerLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {t("manager.communications.title")}
        </h1>
        <Button
          onClick={() => setIsNewModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t("manager.communications.newCommunication")}
        </Button>
      </div>



      <div className="mt-6">
        <ManagerTable>
          <ManagerTableHeader>
            <ManagerTableRow>
              <ManagerTableHead>{t('manager.communications.code')}</ManagerTableHead>
              <ManagerTableHead>{t('manager.communications.title')}</ManagerTableHead>
              <ManagerTableHead>{t('manager.communications.condominium')}</ManagerTableHead>
              <ManagerTableHead>{t('manager.communications.expirationDate')}</ManagerTableHead>
              <ManagerTableHead className="text-right">{t('manager.communications.actions')}</ManagerTableHead>
            </ManagerTableRow>
          </ManagerTableHeader>
          <ManagerTableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <ManagerTableRow key={i}>
                  <ManagerTableCell colSpan={5}>
                    <Skeleton className="h-8 w-full bg-gray-200" />
                  </ManagerTableCell>
                </ManagerTableRow>
              ))
            ) : communications.length > 0 ? (
              communications.map((comm) => (
                <ManagerTableRow key={comm.id} className="hover:bg-purple-50">
                  <ManagerTableCell className="font-medium text-purple-600">{comm.code}</ManagerTableCell>
                  <ManagerTableCell>
                    <p className="font-medium">{comm.title}</p>
                    <p className="text-sm text-gray-600">{comm.content}</p>
                  </ManagerTableCell>
                  <ManagerTableCell>{comm.condominiums?.name || 'N/A'}</ManagerTableCell>
                  <ManagerTableCell>{formatDate(comm.expiration_date)}</ManagerTableCell>
                  <ManagerTableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(comm)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDeleteModal(comm)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </ManagerTableCell>
                </ManagerTableRow>
              ))
            ) : (
              <ManagerTableRow>
                <ManagerTableCell colSpan={5} className="text-center text-gray-600">
                  {t('manager.communications.noCommunications')}
                </ManagerTableCell>
              </ManagerTableRow>
            )}
          </ManagerTableBody>
        </ManagerTable>
      </div>

      <NewCommunicationModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSuccess={fetchCommunications}
        communication={selectedCommunication}
      />
      <DeleteCommunicationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </ManagerLayout>
  );
};

export default Communications;
