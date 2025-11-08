import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Administrator } from "@/types/entities";
import { toast } from "@/utils/toast";
import { useNavigate } from "react-router-dom";

// Regex para validar CNPJ: XX.XXX.XXX/XXXX-XX
const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/;
// Regex para validar CEP: XXXXX-XXX
const cepRegex = /^\d{5}\-\d{3}$/;
// Regex para validar telefone: (XX) XXXXX-XXXX
const phoneRegex = /^\(\d{2}\) \d{5}\-\d{4}$/;

// Schema de validação
const administratorFormSchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome muito longo'),
  document: z.string()
    .regex(cnpjRegex, 'CNPJ inválido (formato: XX.XXX.XXX/XXXX-XX)'),
  email: z.string()
    .email('Email inválido'),
  phone: z.string()
    .regex(phoneRegex, 'Telefone inválido (formato: (XX) XXXXX-XXXX)'),
  address: z.string()
    .min(5, 'Endereço deve ter no mínimo 5 caracteres')
    .max(200, 'Endereço muito longo'),
  city: z.string()
    .min(2, 'Cidade deve ter no mínimo 2 caracteres')
    .max(100, 'Nome da cidade muito longo'),
  state: z.string()
    .length(2, 'Use a sigla do estado (ex: SP)'),
  postal_code: z.string()
    .regex(cepRegex, 'CEP inválido (formato: XXXXX-XXX)'),
});

type AdministratorFormValues = z.infer<typeof administratorFormSchema>;

interface AdministratorFormProps {
  administrator?: Administrator;
  onSubmit: (data: AdministratorFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function AdministratorForm({
  administrator,
  onSubmit,
  isLoading = false
}: AdministratorFormProps) {
  const navigate = useNavigate();

  // Inicializar formulário
  const form = useForm<AdministratorFormValues>({
    resolver: zodResolver(administratorFormSchema),
    defaultValues: {
      name: '',
      document: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      postal_code: '',
    }
  });

  // Carregar dados para edição
  useEffect(() => {
    if (administrator) {
      form.reset({
        name: administrator.name,
        document: administrator.document,
        email: administrator.email,
        phone: administrator.phone,
        address: administrator.address || '',
        city: administrator.city || '',
        state: administrator.state || '',
        postal_code: administrator.postal_code || '',
      });
    }
  }, [administrator, form]);

  // Formatar inputs durante digitação
  const formatDocument = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const formatPostalCode = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1');
  };

  // Handler de submit
  const handleSubmit = async (values: AdministratorFormValues) => {
    try {
      await onSubmit(values);
      navigate('/gestor/administradoras');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Erro ao salvar administradora');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {administrator ? 'Editar Administradora' : 'Nova Administradora'}
        </CardTitle>
        <CardDescription>
          {administrator 
            ? 'Atualize os dados da administradora'
            : 'Preencha os dados para cadastrar uma nova administradora'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Nome */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Administradora</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Administradora ABC" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* CNPJ */}
            <FormField
              control={form.control}
              name="document"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="XX.XXX.XXX/XXXX-XX"
                      {...field}
                      onChange={e => {
                        const formatted = formatDocument(e.target.value);
                        field.onChange(formatted);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder="contato@administradora.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Telefone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="(XX) XXXXX-XXXX"
                      {...field}
                      onChange={e => {
                        const formatted = formatPhone(e.target.value);
                        field.onChange(formatted);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Endereço */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Rua, número, complemento"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Cidade */}
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Estado */}
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="SP"
                        maxLength={2}
                        {...field}
                        onChange={e => {
                          field.onChange(e.target.value.toUpperCase());
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* CEP */}
              <FormField
                control={form.control}
                name="postal_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="XXXXX-XXX"
                        {...field}
                        onChange={e => {
                          const formatted = formatPostalCode(e.target.value);
                          field.onChange(formatted);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/gestor/administradoras')}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    Salvando...
                  </div>
                ) : administrator ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}