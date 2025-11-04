"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showRadixError, showRadixSuccess } from "@/utils/toast";
import { CommonArea } from "@/pages/manager/AreasComuns";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  condo_id: z.string().min(1, "O condomínio é obrigatório."),
  description: z.string().optional(),
  capacity: z.coerce.number().min(1, "A capacidade deve ser maior que 0").optional(),
  booking_fee: z.coerce.number().min(0, "A taxa não pode ser negativa").optional(),
  opening_time: z.string().optional(),
  closing_time: z.string().optional(),
  requires_approval: z.boolean().default(false),
});

interface NewManagerCommonAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  commonArea?: CommonArea | null;
}

type Condo = { id: string; name: string; };

export const NewManagerCommonAreaModal = ({
  isOpen,
  onClose,
  onSuccess,
  commonArea,
}: NewManagerCommonAreaModalProps) => {
  const [condos, setCondos] = useState<Condo[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      requires_approval: false,
    }
  });

  useEffect(() => {
    const fetchCondos = async () => {
      const { data } = await supabase
        .from("condominiums")
        .select("id, name")
        .order("name");
      setCondos(data || []);
    };
    
    if (isOpen) {
      fetchCondos();
    }
  }, [isOpen]);

  useEffect(() => {
    if (commonArea) {
      form.reset({
        name: commonArea.name,
        condo_id: commonArea.condo_id,
        description: commonArea.description || "",
        capacity: commonArea.capacity || undefined,
        booking_fee: commonArea.booking_fee || undefined,
        opening_time: commonArea.opening_time || "",
        closing_time: commonArea.closing_time || "",
        requires_approval: commonArea.requires_approval || false,
      });
    } else {
      form.reset({
        name: "",
        condo_id: "",
        description: "",
        capacity: undefined,
        booking_fee: undefined,
        opening_time: "",
        closing_time: "",
        requires_approval: false,
      });
    }
  }, [commonArea, isOpen, form]);

  const generateCode = () => `AC-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!selectedAdministratorId) {
      showRadixError("Selecione uma administradora primeiro.");
      return;
    }

    setLoading(true);
    
    try {
      let error;
      if (commonArea) {
        const { error: updateError } = await supabase
          .from("common_areas")
          .update({
            ...values,
            capacity: values.capacity || null,
            booking_fee: values.booking_fee || 0,
            opening_time: values.opening_time || null,
            closing_time: values.closing_time || null,
          })
          .eq("id", commonArea.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("common_areas")
          .insert([{ 
            ...values, 
            code: generateCode(),
            capacity: values.capacity || null,
            booking_fee: values.booking_fee || 0,
            opening_time: values.opening_time || null,
            closing_time: values.closing_time || null,
          }]);
        error = insertError;
      }

      if (error) {
        showRadixError(error.message);
      } else {
        showRadixSuccess(`Área comum ${commonArea ? "atualizada" : "cadastrada"} com sucesso!`);
        onSuccess();
        onClose();
      }
    } catch (error) {
      showRadixError("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {commonArea ? "Editar Área Comum" : "Nova Área Comum"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Área *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Salão de Festas"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="condo_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condomínio *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o condomínio" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {condos.map((condo) => (
                          <SelectItem key={condo.id} value={condo.id}>
                            {condo.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva a área comum, suas características e regras de uso..."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacidade (pessoas)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Ex: 50"
                        min="1"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="booking_fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Taxa de Reserva (R$)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Ex: 100.00"
                        min="0"
                        step="0.01"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="opening_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário de Abertura</FormLabel>
                    <FormControl>
                      <Input 
                        type="time" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="closing_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário de Fechamento</FormLabel>
                    <FormControl>
                      <Input 
                        type="time" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="requires_approval"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Requer Aprovação
                    </FormLabel>
                    <div className="text-sm text-muted-foreground">
                      As reservas desta área precisam ser aprovadas pela administração
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-purple-600 hover:bg-purple-700"
                disabled={loading}
              >
                {loading ? "Salvando..." : (commonArea ? "Atualizar" : "Cadastrar")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
