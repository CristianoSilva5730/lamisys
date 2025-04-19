
import React from 'react';
import { SupportCommentManager } from "@/components/support/SupportCommentManager";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProfileSettings() {
  // Simulação de dados do usuário - em um ambiente real, viria do contexto de autenticação
  const user = {
    email: 'cristiano.silva@sinobras.com.br',
    name: 'Cristiano Silva'
  };

  return (
    <div className="space-y-6">
      <SupportCommentManager userEmail={user.email} />
    </div>
  );
}
