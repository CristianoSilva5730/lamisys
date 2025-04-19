
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

interface SupportCommentManagerProps {
  userEmail: string;
}

export function SupportCommentManager({ userEmail }: SupportCommentManagerProps) {
  const [comment, setComment] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('LOW');
  const { toast } = useToast();

  const handleSubmitComment = () => {
    if (!comment.trim()) {
      toast({
        title: "Erro",
        description: "O comentário não pode estar vazio",
        variant: "destructive"
      });
      return;
    }

    // Em um ambiente real, isso seria uma chamada à API
    console.log('Adicionando comentário de suporte', {
      email: userEmail,
      comment,
      priority
    });

    toast({
      title: "Comentário de Suporte",
      description: `Comentário adicionado para ${userEmail} com prioridade ${priority}`
    });

    // Limpar o formulário após o envio
    setComment('');
    setPriority('LOW');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comentário de Suporte para {userEmail}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={priority} onValueChange={(val: 'LOW' | 'MEDIUM' | 'HIGH') => setPriority(val)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="LOW">Baixa Prioridade</SelectItem>
            <SelectItem value="MEDIUM">Média Prioridade</SelectItem>
            <SelectItem value="HIGH">Alta Prioridade</SelectItem>
          </SelectContent>
        </Select>
        
        <Textarea 
          placeholder="Adicione um comentário de suporte para este usuário"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        
        <Button onClick={handleSubmitComment}>
          Adicionar Comentário de Suporte
        </Button>
      </CardContent>
    </Card>
  );
}
