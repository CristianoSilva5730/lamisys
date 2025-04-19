
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { hasPermission, PERMISSIONS } from "@/lib/utils/permissions";
import { getDeletedMaterials } from "@/lib/database";
import { Material } from "@/lib/types";
import { DeletedMaterialItem } from "@/components/materiais/DeletedMaterialItem";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function MaterialDeletedPage() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Verificar permissão
  const canViewDeleted = hasPermission(user, PERMISSIONS.CREATE_DELETE_MATERIAL);
  
  // Buscar materiais excluídos
  useEffect(() => {
    if (canViewDeleted) {
      const deletedMaterials = getDeletedMaterials();
      setMaterials(deletedMaterials);
      setFilteredMaterials(deletedMaterials);
    }
  }, [canViewDeleted]);
  
  // Filtrar materiais por busca
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredMaterials(materials);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = materials.filter(m => 
        m.notaFiscal.toLowerCase().includes(query) ||
        m.numeroOrdem.toLowerCase().includes(query) ||
        m.detalhesEquipamento.toLowerCase().includes(query) ||
        m.empresa.toLowerCase().includes(query) ||
        m.deletionReason?.toLowerCase().includes(query) ||
        m.deletedBy?.toLowerCase().includes(query)
      );
      setFilteredMaterials(filtered);
    }
  }, [searchQuery, materials]);
  
  // Redirecionar se não tiver permissão
  if (!canViewDeleted) {
    return <Navigate to="/materiais" />;
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Histórico de Itens Excluídos</h1>
        <p className="text-muted-foreground mt-2">
          Materiais que foram excluídos do sistema
        </p>
      </div>
      
      {/* Barra de busca */}
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
      
      {/* Lista de materiais excluídos */}
      <div className="space-y-4">
        {filteredMaterials.length === 0 ? (
          <div className="text-center py-8 border border-dashed rounded-lg">
            <p className="text-muted-foreground">Nenhum material excluído encontrado.</p>
          </div>
        ) : (
          filteredMaterials.map(material => (
            <DeletedMaterialItem 
              key={material.id} 
              material={material} 
            />
          ))
        )}
      </div>
    </div>
  );
}
