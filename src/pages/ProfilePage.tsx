
import React from "react";
import { ProfileForm } from "@/components/auth/ProfileForm";
import { Separator } from "@/components/ui/separator";

export default function ProfilePage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
        <p className="text-muted-foreground">
          Visualize e atualize suas informações pessoais
        </p>
      </div>
      <Separator />
      <ProfileForm />
    </div>
  );
}
