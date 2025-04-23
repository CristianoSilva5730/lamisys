
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Activity } from "lucide-react";
import { HistoryEntry } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { userAPI } from "@/services/api";

interface MaterialHistoryProps {
  history: HistoryEntry[];
}

interface UserInfo {
  id: string;
  name: string;
  email: string;
  matricula: string;
}

export function MaterialHistory({ history }: MaterialHistoryProps) {
  const [userCache, setUserCache] = useState<Record<string, UserInfo>>({});
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!history || history.length === 0) return;
      
      setLoading(true);
      const userIds = Array.from(new Set(history.map(entry => entry.updatedBy)));
      const cachedUsers: Record<string, UserInfo> = {};
      
      try {
        const users = await userAPI.getAll();
        
        userIds.forEach(userId => {
          const user = users.find((u: UserInfo) => u.id === userId || u.email === userId);
          
          if (user) {
            cachedUsers[userId] = {
              id: user.id,
              name: user.name || 'Usuário desconhecido',
              email: user.email || '',
              matricula: user.matricula || ''
            };
          } else {
            cachedUsers[userId] = {
              id: userId,
              name: 'Usuário desconhecido',
              email: userId.includes('@') ? userId : '',
              matricula: ''
            };
          }
        });
        
        setUserCache(cachedUsers);
      } catch (err) {
        console.error(`Erro ao buscar usuários:`, err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserInfo();
  }, [history]);

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

  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  
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
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch (e) {
      return "Data inválida";
    }
  };
  
  const renderUserInfo = (userId: string) => {
    const userInfo = userCache[userId] || { name: 'Usuário desconhecido', email: userId, matricula: '' };
    
    return (
      <div className="text-xs text-muted-foreground mt-1">
        <strong className="text-foreground">{userInfo.name}</strong>
        {userInfo.matricula && <span className="ml-1">({userInfo.matricula})</span>}
        {userInfo.email && <span className="ml-1">- {userInfo.email}</span>}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Histórico de Alterações</CardTitle>
        <CardDescription>Registro de modificações neste material</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : (
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
                {renderUserInfo(entry.updatedBy)}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
