import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { smtpAPI } from "@/services/api";

const formSchema = z.object({
  server: z.string().min(1, "Servidor SMTP é obrigatório"),
  port: z.number().min(1, "Porta é obrigatória"),
  fromEmail: z.string().email("Email inválido"),
});

export function SettingsForm() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const config = await smtpAPI.getConfig();
      form.reset(config);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as configurações SMTP."
      });
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await smtpAPI.updateConfig(values);
      toast({
        title: "Configurações atualizadas",
        description: "As configurações do sistema foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao atualizar as configurações.",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="server"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Servidor SMTP</FormLabel>
              <FormControl>
                <Input placeholder="Ex: smtp.empresa.com.br" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="port"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Porta SMTP</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="fromEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email de Origem</FormLabel>
              <FormControl>
                <Input type="email" placeholder="noreply@empresa.com.br" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit">Salvar Configurações</Button>
      </form>
    </Form>
  );
}
