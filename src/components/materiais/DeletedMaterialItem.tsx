
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Material, MaterialStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EyeIcon } from "lucide-react";

interface DeletedMaterialItemProps {
  material: Material;
}

export function DeletedMaterialItem({ material }: DeletedMaterialItemProps) {
  // Função para formatar data
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
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
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
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
              <span className="text-muted-foreground">Excluído por:</span>{" "}
              <span>{material.deletedBy?.split('@')[0] || "Desconhecido"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Data de exclusão:</span>{" "}
              <span>{formatDate(material.deletedAt)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Empresa:</span>{" "}
              <span>{material.empresa}</span>
            </div>
          </div>
          
          <div className="mt-2">
            <span className="text-muted-foreground text-sm">Justificativa:</span>{" "}
            <span className="text-sm italic">{material.deletionReason || "Nenhuma justificativa fornecida"}</span>
          </div>
        </div>
        
        <div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <EyeIcon className="h-4 w-4 mr-2" />
                Detalhes
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Detalhes do Material Excluído</DialogTitle>
                <DialogDescription>
                  Material excluído por <span className="font-medium">{material.deletedBy}</span> em{" "}
                  <span className="font-medium">{formatDate(material.deletedAt)}</span>
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Justificativa da Exclusão:</h4>
                  <p className="italic">{material.deletionReason || "Nenhuma justificativa fornecida"}</p>
                </div>
                
                <div className="border rounded-lg divide-y divide-border">
                  <div className="grid grid-cols-3 p-3">
                    <div className="font-medium">Nota Fiscal</div>
                    <div className="col-span-2">{material.notaFiscal}</div>
                  </div>
                  <div className="grid grid-cols-3 p-3">
                    <div className="font-medium">Número da Ordem</div>
                    <div className="col-span-2">{material.numeroOrdem}</div>
                  </div>
                  <div className="grid grid-cols-3 p-3">
                    <div className="font-medium">Detalhes do Equipamento</div>
                    <div className="col-span-2">{material.detalhesEquipamento}</div>
                  </div>
                  <div className="grid grid-cols-3 p-3">
                    <div className="font-medium">Tipo de Ordem</div>
                    <div className="col-span-2">{material.tipoOrdem}</div>
                  </div>
                  <div className="grid grid-cols-3 p-3">
                    <div className="font-medium">Tipo de Material</div>
                    <div className="col-span-2">{material.tipoMaterial}</div>
                  </div>
                  <div className="grid grid-cols-3 p-3">
                    <div className="font-medium">Remessa</div>
                    <div className="col-span-2">{material.remessa}</div>
                  </div>
                  <div className="grid grid-cols-3 p-3">
                    <div className="font-medium">Código SAP</div>
                    <div className="col-span-2">{material.codigoSAP}</div>
                  </div>
                  <div className="grid grid-cols-3 p-3">
                    <div className="font-medium">Empresa</div>
                    <div className="col-span-2">{material.empresa}</div>
                  </div>
                  <div className="grid grid-cols-3 p-3">
                    <div className="font-medium">Transportadora</div>
                    <div className="col-span-2">{material.transportadora}</div>
                  </div>
                  <div className="grid grid-cols-3 p-3">
                    <div className="font-medium">Data de Envio</div>
                    <div className="col-span-2">{formatDate(material.dataEnvio)}</div>
                  </div>
                  <div className="grid grid-cols-3 p-3">
                    <div className="font-medium">Data da Remessa</div>
                    <div className="col-span-2">{formatDate(material.dataRemessa)}</div>
                  </div>
                  <div className="grid grid-cols-3 p-3">
                    <div className="font-medium">Status</div>
                    <div className="col-span-2">{getStatusBadge(material.status)}</div>
                  </div>
                  <div className="grid grid-cols-3 p-3">
                    <div className="font-medium">Observações</div>
                    <div className="col-span-2">{material.observacoes || "Nenhuma observação"}</div>
                  </div>
                  <div className="grid grid-cols-3 p-3">
                    <div className="font-medium">Comentários</div>
                    <div className="col-span-2">{material.comentarios || "Nenhum comentário"}</div>
                  </div>
                  <div className="grid grid-cols-3 p-3">
                    <div className="font-medium">Criado por</div>
                    <div className="col-span-2">{material.createdBy}</div>
                  </div>
                  <div className="grid grid-cols-3 p-3">
                    <div className="font-medium">Criado em</div>
                    <div className="col-span-2">{formatDate(material.createdAt)}</div>
                  </div>
                  {material.updatedBy && (
                    <div className="grid grid-cols-3 p-3">
                      <div className="font-medium">Última atualização por</div>
                      <div className="col-span-2">{material.updatedBy}</div>
                    </div>
                  )}
                  {material.updatedAt && (
                    <div className="grid grid-cols-3 p-3">
                      <div className="font-medium">Última atualização em</div>
                      <div className="col-span-2">{formatDate(material.updatedAt)}</div>
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
