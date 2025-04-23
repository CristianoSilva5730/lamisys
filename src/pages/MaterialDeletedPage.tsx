
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { hasPermission, PERMISSIONS } from "@/lib/utils/permissions";
import { Material } from "@/lib/types";
import { materialAPI } from "@/services/api";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MaterialHistory } from "@/components/materiais/MaterialHistory";

export default function MaterialDeletedPage() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  
  const canViewDeleted = hasPermission(user, PERMISSIONS.CREATE_DELETE_MATERIAL);
  
  useEffect(() => {
    const fetchDeletedMaterials = async () => {
      setLoading(true);
      try {
        const deletedMaterials = await materialAPI.getDeleted();
        setMaterials(deletedMaterials);
        setFilteredMaterials(deletedMaterials);
      } catch (error) {
        console.error("Erro ao carregar materiais excluídos:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar materiais excluídos.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (canViewDeleted) {
      fetchDeletedMaterials();
    }
  }, [canViewDeleted]);
  
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredMaterials(materials);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = materials.filter(m => 
        m.notaFiscal?.toLowerCase().includes(query) ||
        m.numeroOrdem?.toLowerCase().includes(query) ||
        m.detalhesEquipamento?.toLowerCase().includes(query) ||
        m.empresa?.toLowerCase().includes(query) ||
        m.deletionReason?.toLowerCase().includes(query) ||
        m.deletedBy?.toLowerCase().includes(query)
      );
      setFilteredMaterials(filtered);
    }
  }, [searchQuery, materials]);
  
  if (!canViewDeleted) {
    return <Navigate to="/materiais" />;
  }
  
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Histórico de Itens Excluídos</h1>
        <p className="text-muted-foreground mt-2">
          Materiais que foram excluídos do sistema
        </p>
      </div>
      
      <div className="relative max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar em materiais excluídos..."
          className="pl-8"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredMaterials.length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-lg">
              <p className="text-muted-foreground">Nenhum material excluído encontrado.</p>
            </div>
          ) : (
            filteredMaterials.map(material => (
              <Card key={material.id} className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-medium">
                    Material: {material.detalhesEquipamento}
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    <div>Nota Fiscal: {material.notaFiscal}</div>
                    <div>Ordem: {material.numeroOrdem}</div>
                    <div>Excluído por: {material.deletedBy}</div>
                    <div>Data da exclusão: {new Date(material.deletedAt || '').toLocaleString('pt-BR')}</div>
                    <div>Motivo: {material.deletionReason}</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <MaterialHistory history={material.history || []} />
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
