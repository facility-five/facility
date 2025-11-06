"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { showRadixError, showRadixSuccess } from "@/utils/toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function RegisterAdministratorForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();

  const formSchema = z.object({
    name: z.string().min(1, t("registerAdmin.form.nameRequired")),
    nif: z.string().optional(),
    email: z.string().email(t("registerAdmin.form.emailInvalid")),
    phone: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      nif: "",
      email: "",
      phone: "",
    },
  });

  const generateCode = () => `AD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      showRadixError(t("registerAdmin.form.sessionExpired"));
      navigate("/");
      return;
    }

    const { error } = await supabase.from("administrators").insert([
      {
        ...values,
        code: generateCode(),
        user_id: user.id,
        responsible_id: user.id,
      },
    ]);

    if (error) {
      showRadixError(error.message);
    } else {
      showRadixSuccess(t("registerAdmin.form.success"));
      // Após registrar a administradora, encaminhar para o painel do gestor
      navigate("/gestor", { replace: true });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("registerAdmin.form.nameLabel")}</FormLabel>
              <FormControl>
                <Input placeholder={t("registerAdmin.form.namePlaceholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="nif"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("registerAdmin.form.nifLabel")}</FormLabel>
              <FormControl>
                <Input placeholder={t("registerAdmin.form.nifPlaceholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("registerAdmin.form.emailLabel")}</FormLabel>
              <FormControl>
                <Input placeholder={t("registerAdmin.form.emailPlaceholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("registerAdmin.form.phoneLabel")}</FormLabel>
              <FormControl>
                <Input placeholder={t("registerAdmin.form.phonePlaceholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
          {t("registerAdmin.form.submitButton")}
        </Button>
      </form>
    </Form>
  );
}
