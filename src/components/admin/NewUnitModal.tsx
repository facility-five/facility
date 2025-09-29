"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { Unit } from "@/pages/admin/Units";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  number: z.string().min(1, "O número é obrigatório."),
  floor: z.coerce.number().min(0, "O piso deve ser um número."),
  size: z.string().optional(),
  rooms: z.coerce.number().optional(),
  is_occupied: z.boolean().default(false),
  has_parking: z.boolean().default(false),
  parking_spaces: z.string().optional(),
  condo_id: z.string().min(1, "O condomínio é obrigatório."),
  block_id: z.string().min(1, "O bloco é obrigatório."),
});

interface NewUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  unit?: Unit | null;
}

type Condo = { id: string; name: string; };
type Block = { id: string; name: string; condo_id: string };

export const NewUnitModal = ({
  isOpen,
  onClose,
  onSuccess,
  unit,
}: NewUnitModalProps) => {
  const [condos, setCondos] = useState<Condo[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [filteredBlocks, setFilteredBlocks] = useState<Block[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      is_occupied: false,
      has_parking: false,
    }
  });

  const selectedCondoId = form.watch("condo_id");

  useEffect(() => {
    const fetchData = async () => {
      const { data: condosData } = await supabase.from("condos").select("id, name");
      setCondos(condosData || []);
      const { data: blocksData } = await supabase.from("blocks").select("id, name, condo_id");
      setBlocks(blocksData || []);
    };
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedCondoId) {
      setFilteredBlocks(blocks.filter(block => block.condo_id === selectedCondoId));
    } else {
      setFilteredBlocks([]);
    }
  }, [selectedCondoId, blocks]);

  useEffect(() => {
    if (unit) {
      form.reset(unit);
    } else {
      form.reset({
        number: "",
        floor: 0,
        size: "",
        rooms: 0,
        is_occupied: false,
        has_parking: false,
        parking_spaces: "",
        condo_id: "",
        block_id: "",
      });
    }
  }, [unit, isOpen, form]);

  const generateCode = () => `UN-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    let error;
    if (unit) {
      const { error: updateError } = await supabase
        .from("units")
        .update(values)
        .eq("id", unit.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("units")
        .insert([{ ...values, code: generateCode() }]);
      error = insertError;
    }

    if (error) {
      showError(error.message);
    } else {
      showSuccess(`Unidade ${unit ? "atualizada" : "registrada"} com sucesso!`);
      onSuccess();
      onClose();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-admin-card border-admin-border text-admin-foreground">
        <DialogHeader>
          <DialogTitle>Agregar Nueva Unidad</DialogTitle>
          <DialogDescription className="text-admin-foreground-muted">
            Ingrese la información de la unidad.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-admin-background">
                <TabsTrigger value="basic">Información Básica</TabsTrigger>
                <TabsTrigger value="details">Detalles</TabsTrigger>
                <TabsTrigger value="location">Ubicación</TabsTrigger>
              </TabsList>
              <div className="py-4 space-y-4">
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="number" render={({ field }) => (
                      <FormItem><FormLabel>Número</FormLabel><FormControl><Input placeholder="Ex: 101" {...field} className="bg-admin-background border-admin-border" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="floor" render={({ field }) => (
                      <FormItem><FormLabel>Piso</FormLabel><FormControl><Input type="number" placeholder="1" {...field} className="bg-admin-background border-admin-border" /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="size" render={({ field }) => (
                      <FormItem><FormLabel>Tamaño</FormLabel><FormControl><Input placeholder="Indique el tamaño" {...field} className="bg-admin-background border-admin-border" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="rooms" render={({ field }) => (
                      <FormItem><FormLabel>Habitaciones</FormLabel><FormControl><Input type="number" placeholder="1" {...field} className="bg-admin-background border-admin-border" /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                </TabsContent>
                <TabsContent value="details" className="space-y-4">
                  <FormField control={form.control} name="is_occupied" render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-admin-border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Está ocupado</FormLabel></div></FormItem>
                  )} />
                  <FormField control={form.control} name="has_parking" render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-admin-border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Tiene estacionamiento</FormLabel></div></FormItem>
                  )} />
                  {form.watch('has_parking') && (
                    <FormField control={form.control} name="parking_spaces" render={({ field }) => (
                      <FormItem><FormLabel>Plazas de estacionamiento</FormLabel><FormControl><Textarea placeholder="Ex: Vaga 1, Vaga 2" {...field} className="bg-admin-background border-admin-border" /></FormControl><FormMessage /></FormItem>
                    )} />
                  )}
                </TabsContent>
                <TabsContent value="location" className="space-y-4">
                  <FormField control={form.control} name="condo_id" render={({ field }) => (
                    <FormItem><FormLabel>Condominio</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="bg-admin-background border-admin-border"><SelectValue placeholder="Seleccione el condominio..." /></SelectTrigger></FormControl><SelectContent className="bg-admin-card border-admin-border text-admin-foreground">{condos.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="block_id" render={({ field }) => (
                    <FormItem><FormLabel>Bloque</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedCondoId}><FormControl><SelectTrigger className="bg-admin-background border-admin-border"><SelectValue placeholder="Seleccione el bloque" /></SelectTrigger></FormControl><SelectContent className="bg-admin-card border-admin-border text-admin-foreground">{filteredBlocks.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                  )} />
                </TabsContent>
              </div>
            </Tabs>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                {unit ? "Salvar" : "Registrar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};