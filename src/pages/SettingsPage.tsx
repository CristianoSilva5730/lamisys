
import React from "react";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { AutoBackupSettings } from "@/components/settings/AutoBackupSettings";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Configurações do Sistema</h1>
      
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="backup">Backup Automático</TabsTrigger>
          <TabsTrigger value="profiles">Perfis de Usuário</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card className="p-6">
            <SettingsForm />
          </Card>
        </TabsContent>
        
        <TabsContent value="backup">
          <Card className="p-6">
            <AutoBackupSettings />
          </Card>
        </TabsContent>

        <TabsContent value="profiles">
          <Card className="p-6">
            <ProfileSettings />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
