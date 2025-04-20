
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DatabaseBackup } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { backupAPI } from "@/services/api";

const formSchema = z.object({
  enabled: z.boolean(),
  backupPath: z.string().min(1, "Caminho do backup é obrigatório"),
  interval: z.number().min(1, "Intervalo deve ser maior que 0"),
});

const BACKUP_KEY = "lamisys-backup-settings";

function getBackupSettings() {
  const saved = localStorage.getItem(BACKUP_KEY);
  if (!saved) return { enabled: false, backupPath: "", interval: 24 };
  return JSON.parse(saved);
}

function saveBackupSettings(settings: any) {
  localStorage.setItem(BACKUP_KEY, JSON.stringify(settings));
}

export function AutoBackupSettings() {
  const { toast } = useToast();
  const [isBackingUp, setIsBackingUp] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: getBackupSettings(),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      saveBackupSettings(values);
      toast({
        title: "Configurações atualizadas",
        description: "As configurações de backup automático foram salvas com sucesso.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao salvar as configurações de backup.",
      });
    }
  }

  async function handleManualBackup() {
    try {
      setIsBackingUp(true);
      await backupAPI.createBackup();
      
      toast({
        title: "Backup realizado",
        description: "O backup manual foi realizado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao realizar o backup manual.",
        variant: "destructive",
      });
    } finally {
      setIsBackingUp(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Backup Automático</h3>
          <p className="text-sm text-muted-foreground">
            Configure o backup automático dos dados do sistema
          </p>
        </div>
        
        <Button
          variant="outline"
          onClick={handleManualBackup}
          disabled={isBackingUp}
        >
          <DatabaseBackup className="mr-2 h-4 w-4" />
          Backup Manual
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="enabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Ativar Backup Automático
                  </FormLabel>
                  <FormDescription>
                    O sistema realizará backups automáticos periodicamente
                  </FormDescription>
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
          
          <FormField
            control={form.control}
            name="backupPath"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pasta de Backup</FormLabel>
                <FormControl>
                  <Input placeholder="C:\backups\lamisys" {...field} />
                </FormControl>
                <FormDescription>
                  Caminho onde os arquivos de backup serão salvos
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="interval"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Intervalo (horas)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={1} 
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Intervalo entre cada backup automático
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit">Salvar Configurações</Button>
        </form>
      </Form>
      
      <Card className="p-4 bg-muted">
        <h4 className="font-medium mb-2">Último backup</h4>
        <p className="text-sm text-muted-foreground">
          {localStorage.getItem('lamisys-last-backup') || 'Nenhum backup realizado'}
        </p>
      </Card>
    </div>
  );
}
