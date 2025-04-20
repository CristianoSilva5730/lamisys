
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { hasPermission, PERMISSIONS } from "@/lib/utils/permissions";
import { Material } from "@/lib/types";
import { MaterialItem } from "@/components/materiais/MaterialItem";
import { DeleteMaterialDialog } from "@/components/materiais/DeleteMaterialDialog";
import { MaterialFilter, FilterParams } from "@/components/materiais/MaterialFilter";
import { Button } from "@/components/ui/button";
import { FilePlus } from "lucide-react";
import { materialAPI } from "@/services/api";
import { toast } from "@/components/ui/use-toast";

export default function MaterialListPage() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterParams>({
    search: "",
    status: "",
    tipo: "",
    empresa: ""
  });
  const [loading, setLoading] = useState(true);
  
  // Lista única de empresas para o filtro
  const [empresas, setEmpresas] = useState<string[]>([]);
  
  // Verifica permissões
  const canCreateMaterial = hasPermission(user, PERMISSIONS.CREATE_DELETE_MATERIAL);
  
  // Carregar dados iniciais
  useEffect(() => {
    loadMaterials();
  }, []);
  
  // Função para carregar materiais da API
  const loadMaterials = async () => {
    setLoading(true);
    try {
      const allMaterials = await materialAPI.getAll();
      setMaterials(allMaterials);
      setFilteredMaterials(allMaterials);
      
      // Extrair lista única de empresas
      const uniqueEmpresas = Array.from(new Set(allMaterials.map(m => m.empresa))).sort();
      setEmpresas(uniqueEmpresas);
    } catch (error) {
      console.error("Erro ao carregar materiais:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os materiais.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Aplicar filtros aos materiais
  useEffect(() => {
    let result = [...materials];
    
    // Filtrar por texto de busca
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(m => 
        m.notaFiscal.toLowerCase().includes(searchLower) ||
        m.numeroOrdem.toLowerCase().includes(searchLower) ||
        m.detalhesEquipamento.toLowerCase().includes(searchLower) ||
        m.tipoOrdem.toLowerCase().includes(searchLower) ||
        m.empresa.toLowerCase().includes(searchLower) ||
        m.transportadora.toLowerCase().includes(searchLower)
      );
    }
    
    // Filtrar por status
    if (filters.status) {
      result = result.filter(m => m.status === filters.status);
    }
    
    // Filtrar por tipo de material
    if (filters.tipo) {
      result = result.filter(m => m.tipoMaterial === filters.tipo);
    }
    
    // Filtrar por empresa
    if (filters.empresa) {
      result = result.filter(m => m.empresa === filters.empresa);
    }
    
    setFilteredMaterials(result);
  }, [filters, materials]);
  
  // Handler para abrir o dialog de exclusão
  const handleDelete = (id: string) => {
    setSelectedMaterialId(id);
    setDeleteDialogOpen(true);
  };
  
  // Handler para quando um material for excluído
  const handleMaterialDeleted = () => {
    loadMaterials();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Lista de Materiais</h1>
        
        {canCreateMaterial && (
          <Button asChild>
            <Link to="/materiais/novo">
              <FilePlus className="mr-2 h-4 w-4" /> Novo Material
            </Link>
          </Button>
        )}
      </div>
      
      {/* Filtros */}
      <MaterialFilter 
        onFilterChange={setFilters} 
        empresas={empresas} 
      />
      
      {/* Estado de carregamento */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
      
      {/* Lista de Materiais */}
      {!loading && (
        <div className="space-y-4">
          {filteredMaterials.length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-lg">
              <p className="text-muted-foreground">Nenhum material encontrado.</p>
            </div>
          ) : (
            filteredMaterials.map(material => (
              <MaterialItem 
                key={material.id} 
                material={material}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      )}
      
      {/* Dialog de Exclusão */}
      <DeleteMaterialDialog
        materialId={selectedMaterialId || ""}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDeleted={handleMaterialDeleted}
      />
    </div>
  );
}
