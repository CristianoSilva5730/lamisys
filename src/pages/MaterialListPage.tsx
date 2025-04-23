
import { useState, useEffect } from "react";
import { Material } from "@/lib/types";
import { materialAPI } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MaterialFilter, FilterParams } from "@/components/materiais/MaterialFilter";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2 } from "lucide-react";
import { DeleteMaterialDialog } from "@/components/materiais/DeleteMaterialDialog";

export default function MaterialListPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState<{id: string, name: string} | null>(null);
  const { toast } = useToast();
  const [empresas, setEmpresas] = useState<string[]>([]);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const data = await materialAPI.getAll();
      setMaterials(data);
      setFilteredMaterials(data);
      
      // Extract unique companies
      const uniqueEmpresas = Array.from(new Set(data.map(m => m.empresa))).filter(Boolean);
      setEmpresas(uniqueEmpresas);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os materiais."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, reason: string) => {
    try {
      await materialAPI.delete(id, reason);
      toast({
        title: "Sucesso",
        description: "Material excluído com sucesso."
      });
      loadMaterials(); // Reload the list
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível excluir o material."
      });
    }
  };

  const handleFilterChange = (filters: FilterParams) => {
    let filtered = [...materials];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(material => 
        material.notaFiscal.toLowerCase().includes(searchLower) ||
        material.numeroOrdem.toLowerCase().includes(searchLower) ||
        material.empresa.toLowerCase().includes(searchLower) ||
        material.tipoMaterial.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status && filters.status !== "todos") {
      filtered = filtered.filter(material => material.status === filters.status);
    }

    if (filters.tipo && filters.tipo !== "todos") {
      filtered = filtered.filter(material => material.tipoMaterial === filters.tipo);
    }

    if (filters.empresa && filters.empresa !== "todas") {
      filtered = filtered.filter(material => material.empresa === filters.empresa);
    }

    setFilteredMaterials(filtered);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Lista de Materiais</h1>
        <Link to="/materiais/novo">
          <Button>Novo Material</Button>
        </Link>
      </div>

      <MaterialFilter onFilterChange={handleFilterChange} empresas={empresas} />

      <div className="rounded-md border">
        <Table>
          <TableCaption>Lista completa de materiais.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Nota Fiscal</TableHead>
              <TableHead>Número da Ordem</TableHead>
              <TableHead>Tipo de Material</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : filteredMaterials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  Nenhum material encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredMaterials.map((material) => (
                <TableRow key={material.id}>
                  <TableCell>{material.notaFiscal}</TableCell>
                  <TableCell>{material.numeroOrdem}</TableCell>
                  <TableCell>{material.tipoMaterial}</TableCell>
                  <TableCell>{material.status}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link to={`/materiais/${material.id}`}>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setSelectedMaterial({
                          id: material.id,
                          name: `${material.notaFiscal} - ${material.numeroOrdem}`
                        })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedMaterial && (
        <DeleteMaterialDialog
          materialId={selectedMaterial.id}
          materialName={selectedMaterial.name}
          isOpen={!!selectedMaterial}
          onClose={() => setSelectedMaterial(null)}
        />
      )}
    </div>
  );
}
