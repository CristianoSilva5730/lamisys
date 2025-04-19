
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Edit, Trash2 } from "lucide-react";
import { Material, MaterialStatus } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { PERMISSIONS, hasPermission } from "@/lib/utils/permissions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface MaterialItemProps {
  material: Material;
  onDelete: (id: string) => void;
}

export function MaterialItem({ material, onDelete }: MaterialItemProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEdit = hasPermission(user, PERMISSIONS.EDIT_MATERIAL);
  const canDelete = hasPermission(user, PERMISSIONS.CREATE_DELETE_MATERIAL);
  
  // Função para formatar data
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (e) {
      return "Data inválida";
    }
  };
  
  // Status badge classes
  const getStatusBadge = (status: MaterialStatus) => {
    switch (status) {
      case MaterialStatus.PENDENTE:
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-300">Pendente</Badge>;
      case MaterialStatus.ENVIADO:
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-300">Enviado</Badge>;
      case MaterialStatus.ENTREGUE:
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-300">Entregue</Badge>;
      case MaterialStatus.DEVOLVIDO:
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-300">Devolvido</Badge>;
      case MaterialStatus.CONCLUIDO:
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-300">Concluído</Badge>;
      case MaterialStatus.CANCELADO:
        return <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-300">Cancelado</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h3 className="font-medium text-lg text-lamisys-primary dark:text-blue-400">
              {material.notaFiscal}
            </h3>
            <div className="flex gap-2">
              {getStatusBadge(material.status)}
              <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-300">
                {material.tipoMaterial}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Empresa:</span>{" "}
              <span>{material.empresa}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Data de Envio:</span>{" "}
              <span>{formatDate(material.dataEnvio)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Criado por:</span>{" "}
              <span>{material.createdBy.split('@')[0]}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-end gap-2">
          {canEdit && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => navigate(`/materiais/${material.id}`)}
                >
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Editar</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Editar material</p>
              </TooltipContent>
            </Tooltip>
          )}
          
          {canDelete && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="border-destructive text-destructive hover:bg-destructive/10"
                  onClick={() => onDelete(material.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Excluir</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Excluir material</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
}
