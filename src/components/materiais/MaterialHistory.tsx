
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Activity } from "lucide-react";
import { HistoryEntry } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface MaterialHistoryProps {
  history: HistoryEntry[];
}

export function MaterialHistory({ history }: MaterialHistoryProps) {
  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Histórico de Alterações</CardTitle>
          <CardDescription>Registro de modificações neste material</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
            <Activity className="h-12 w-12 mb-2 opacity-20" />
            <p>Nenhuma alteração registrada.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Ordenar por data, do mais recente para o mais antigo
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  
  // Função para formatar campo
  const formatFieldName = (field: string) => {
    const fieldMap: Record<string, string> = {
      notaFiscal: "Nota Fiscal",
      numeroOrdem: "Número da Ordem",
      detalhesEquipamento: "Detalhes do Equipamento",
      tipoOrdem: "Tipo de Ordem",
      tipoMaterial: "Tipo de Material",
      remessa: "Remessa",
      codigoSAP: "Código SAP",
      empresa: "Empresa",
      transportadora: "Transportadora",
      dataEnvio: "Data de Envio",
      dataRemessa: "Data da Remessa",
      status: "Status",
      observacoes: "Observações",
      comentarios: "Comentários",
    };
    
    return fieldMap[field] || field;
  };
  
  // Função para formatar data
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch (e) {
      return "Data inválida";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Histórico de Alterações</CardTitle>
        <CardDescription>Registro de modificações neste material</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {sortedHistory.map((entry) => (
            <div 
              key={entry.id}
              className="border-l-2 border-l-blue-300 dark:border-l-blue-600 pl-4 space-y-1"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{formatFieldName(entry.field)}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {formatDate(entry.updatedAt)}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-muted/50 p-2 rounded">
                  <span className="block text-xs text-muted-foreground mb-1">Valor Anterior:</span>
                  <span className="block">{entry.oldValue || '-'}</span>
                </div>
                <div className="bg-muted/50 p-2 rounded">
                  <span className="block text-xs text-muted-foreground mb-1">Novo Valor:</span>
                  <span className="block">{entry.newValue || '-'}</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Alterado por: <span className="text-foreground">{entry.updatedBy}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
