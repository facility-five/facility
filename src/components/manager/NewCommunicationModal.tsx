"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Communication } from "@/pages/manager/Comunicados";
import { useTranslation } from "react-i18next";

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

interface NewCommunicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  communication?: Communication | null;
}

type Condo = { id: string; name: string; };

export const NewCommunicationModal = ({
  isOpen,
  onClose,
  onSuccess,
  communication,
}: NewCommunicationModalProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [condos, setCondos] = useState<Condo[]>([]);

  const formSchema = z.object({
    title: z.string().min(1, t("manager.communications.form.titleRequired")),
    content: z.string().optional(),
    expiration_date: z.string().optional(),
    condo_id: z.string().min(1, t("manager.communications.form.condominiumRequired")),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    const fetchCondos = async () => {
      const { data } = await supabase.from("condominiums").select("id, name");
      setCondos(data || []);
    };
    if (isOpen) {
      fetchCondos();
    }
  }, [isOpen]);

  useEffect(() => {
    if (communication) {
      form.reset({
        ...communication,
        expiration_date: communication.expiration_date ? communication.expiration_date.split('T')[0] : '',
      });
    } else {
      form.reset({
        title: "",
        content: "",
        expiration_date: "",
        condo_id: "",
      });
    }
  }, [communication, isOpen, form]);

  const generateCode = () => `CO-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Error",
        description: t("manager.communications.form.loginRequired"),
        variant: "destructive",
      });
      return;
    }

    const submissionData = {
      ...values,
      expiration_date: values.expiration_date || null,
      created_by: user.id,
    };

    try {
      let error;
      if (communication) {
        const { error: updateError } = await supabase
          .from("communications")
          .update(submissionData)
          .eq("id", communication.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("communications")
          .insert([{ ...submissionData, code: generateCode() }]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: t("common.success"),
        description: t(communication ? "manager.communications.form.updateSuccess" : "manager.communications.form.createSuccess"),
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error submitting communication:", error);
      toast({
        title: "Error",
        description: t("manager.communications.errorFetching"),
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-white border-gray-200">
        <DialogHeader>
          <DialogTitle>{t("manager.communications.form.title")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("manager.communications.form.titleLabel")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("manager.communications.form.titlePlaceholder")} {...field} className="bg-white border-gray-200" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="content" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("manager.communications.form.contentLabel")}</FormLabel>
                <FormControl>
                  <Textarea placeholder={t("manager.communications.form.contentPlaceholder")} {...field} className="bg-white border-gray-200" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="expiration_date" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("manager.communications.form.expirationDateLabel")}</FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="bg-white border-gray-200" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="condo_id" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("manager.communications.form.condominiumLabel")}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                  <FormControl>
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder={t("manager.communications.form.condominiumPlaceholder")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white border-gray-200">
                    {condos.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                {t(communication ? "common.update" : "common.create")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};