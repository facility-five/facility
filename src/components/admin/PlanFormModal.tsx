"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { Plan } from "@/pages/admin/Plans";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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

const formSchema = z.object({
  name: z.string().min(1, "O nome do plano é obrigatório."),
  price: z.coerce.number().min(0, "O preço deve ser um número positivo."),
  stripe_price_id: z.string().optional(),
  description: z.string().optional(),
  period: z.string().min(1, "O período é obrigatório."),
  status: z.string().min(1, "O status é obrigatório."),
  max_admins: z.coerce.number().optional(),
  max_condos: z.coerce.number().optional(),
  max_units: z.coerce.number().optional(),
  features: z.string().optional(),
});

interface PlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  plan?: Plan | null;
}

export const PlanFormModal = ({
  isOpen,
  onClose,
  onSuccess,
  plan,
}: PlanFormModalProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (plan) {
      form.reset({
        ...plan,
        features: plan.features?.join(", "),
      });
    } else {
      form.reset({
        name: "",
        price: 0,
        stripe_price_id: "",
        description: "",
        period: "monthly",
        status: "active",
        max_admins: undefined,
        max_condos: undefined,
        max_units: undefined,
        features: "",
      });
    }
  }, [plan, isOpen, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const planData = {
      ...values,
      features: values.features?.split(",").map((f) => f.trim()) || [],
    };

    let error;
    if (plan) {
      // Update
      const { error: updateError } = await supabase
        .from("plans")
        .update(planData)
        .eq("id", plan.id);
      error = updateError;
    } else {
      // Create
      const { error: insertError } = await supabase
        .from("plans")
        .insert([planData]);
      error = insertError;
    }

    if (error) {
      showError(error.message);
    } else {
      showSuccess(`Plano ${plan ? "atualizado" : "criado"} com sucesso!`);
      onSuccess();
      onClose();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-admin-card border-admin-border text-admin-foreground">
        <DialogHeader>
          <DialogTitle>{plan ? "Editar Plano" : "Criar Novo Plano"}</DialogTitle>
          <DialogDescription className="text-admin-foreground-muted">
            Preencha os dados do plano. Todos os campos são obrigatórios.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Plano</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Plano Básico" {...field} className="bg-admin-background border-admin-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço (€)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ex: 199.90" {...field} className="bg-admin-background border-admin-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="stripe_price_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price ID Stripe</FormLabel>
                  <FormControl>
                    <Input placeholder="price_..." {...field} className="bg-admin-background border-admin-border" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Ideal para condomínios pequenos" {...field} className="bg-admin-background border-admin-border" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="period"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Período</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-admin-background border-admin-border">
                          <SelectValue placeholder="Selecione o período" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-admin-card border-admin-border text-admin-foreground">
                        <SelectItem value="monthly">Mensal</SelectItem>
                        <SelectItem value="annual">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-admin-background border-admin-border">
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-admin-card border-admin-border text-admin-foreground">
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="max_admins"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Administradoras</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Type here..." {...field} className="bg-admin-background border-admin-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="max_condos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condomínios</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Type here..." {...field} className="bg-admin-background border-admin-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="max_units"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidades</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Type here..." {...field} className="bg-admin-background border-admin-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="features"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recursos do Plano</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ex: Gestão financeira, Suporte por email" {...field} className="bg-admin-background border-admin-border" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                {plan ? "Salvar Plano" : "Criar Plano"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};