
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

interface EmailTemplateForm {
  passwordReset: string;
  newUserTemp: string;
  alarmNotification: string;
}

const defaultTemplates = {
  passwordReset: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1E40AF;">LamiSys - Recuperação de Senha</h2>
  <p>Olá,</p>
  <p>Recebemos uma solicitação para redefinir sua senha.</p>
  <p>Sua nova senha temporária é: <strong>{{tempPassword}}</strong></p>
  <p>Por motivos de segurança, você será solicitado a alterar esta senha no primeiro acesso.</p>
  <p>Se você não solicitou esta recuperação de senha, por favor ignore este email.</p>
  <p>Atenciosamente,<br>Equipe LamiSys</p>
</div>`,

  newUserTemp: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1E40AF;">LamiSys - Bem-vindo(a)</h2>
  <p>Olá {{userName}},</p>
  <p>Sua conta foi criada com sucesso no sistema LamiSys.</p>
  <p>Suas credenciais de acesso iniciais são:</p>
  <ul>
    <li>Usuário: {{userEmail}}</li>
    <li>Senha temporária: <strong>{{tempPassword}}</strong></li>
  </ul>
  <p>Por motivos de segurança, você será solicitado a alterar esta senha no primeiro acesso.</p>
  <p>Atenciosamente,<br>Equipe LamiSys</p>
</div>`,

  alarmNotification: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #EF4444;">LamiSys - Alarme Acionado</h2>
  <p>Um material que atende aos critérios de alarme foi detectado:</p>
  <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
    <tr style="background-color: #f5f5f5;">
      <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Campo</th>
      <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Valor</th>
    </tr>
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">Nota Fiscal</td>
      <td style="padding: 8px; border: 1px solid #ddd;">{{notaFiscal}}</td>
    </tr>
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">Material</td>
      <td style="padding: 8px; border: 1px solid #ddd;">{{tipoMaterial}}</td>
    </tr>
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">Status</td>
      <td style="padding: 8px; border: 1px solid #ddd;">{{status}}</td>
    </tr>
  </table>
  <p style="margin-top: 20px;">Para mais detalhes, acesse o sistema LamiSys.</p>
  <p>Atenciosamente,<br>Sistema LamiSys</p>
</div>`
};

export function EmailTemplateSettings() {
  const { toast } = useToast();
  const form = useForm<EmailTemplateForm>({
    defaultValues: {
      passwordReset: defaultTemplates.passwordReset,
      newUserTemp: defaultTemplates.newUserTemp,
      alarmNotification: defaultTemplates.alarmNotification,
    },
  });

  const onSubmit = (data: EmailTemplateForm) => {
    console.log("Templates atualizados:", data);
    toast({
      title: "Templates atualizados",
      description: "Os templates de email foram atualizados com sucesso.",
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Templates de Email</h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Card className="p-4">
            <Collapsible>
              <CollapsibleTrigger className="flex w-full items-center justify-between">
                <h4 className="text-sm font-medium">Template de Recuperação de Senha</h4>
                <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <FormField
                  control={form.control}
                  name="passwordReset"
                  render={({ field }) => (
                    <FormItem>
                      <FormDescription>
                        Variáveis disponíveis: {"{{tempPassword}}"} - Senha temporária
                      </FormDescription>
                      <FormControl>
                        <Textarea className="font-mono h-64" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CollapsibleContent>
            </Collapsible>
          </Card>

          <Card className="p-4">
            <Collapsible>
              <CollapsibleTrigger className="flex w-full items-center justify-between">
                <h4 className="text-sm font-medium">Template de Novo Usuário</h4>
                <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <FormField
                  control={form.control}
                  name="newUserTemp"
                  render={({ field }) => (
                    <FormItem>
                      <FormDescription>
                        Variáveis disponíveis: {"{{userName}}"} - Nome do usuário, {"{{userEmail}}"} - Email do usuário, {"{{tempPassword}}"} - Senha temporária
                      </FormDescription>
                      <FormControl>
                        <Textarea className="font-mono h-64" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CollapsibleContent>
            </Collapsible>
          </Card>

          <Card className="p-4">
            <Collapsible>
              <CollapsibleTrigger className="flex w-full items-center justify-between">
                <h4 className="text-sm font-medium">Template de Notificação de Alarme</h4>
                <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <FormField
                  control={form.control}
                  name="alarmNotification"
                  render={({ field }) => (
                    <FormItem>
                      <FormDescription>
                        Variáveis disponíveis: {"{{notaFiscal}}"} - Número da nota fiscal, {"{{tipoMaterial}}"} - Tipo do material, {"{{status}}"} - Status atual
                      </FormDescription>
                      <FormControl>
                        <Textarea className="font-mono h-64" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CollapsibleContent>
            </Collapsible>
          </Card>

          <Button type="submit">Salvar Templates</Button>
        </form>
      </Form>
    </div>
  );
}
