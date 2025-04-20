
import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { hasPermission, PERMISSIONS } from "@/lib/utils/permissions";
import { Material } from "@/lib/types";
import { MaterialForm } from "@/components/materiais/MaterialForm";
import { PrintButton } from "@/components/shared/PrintButton";
import { materialAPI } from "@/services/api";
import { toast } from "@/components/ui/use-toast";

export default function MaterialEditPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Verificar permissão
  const canEditMaterial = hasPermission(user, PERMISSIONS.EDIT_MATERIAL);
  
  // Buscar dados do material da API
  useEffect(() => {
    if (id) {
      const fetchMaterial = async () => {
        setLoading(true);
        try {
          const materialData = await materialAPI.getById(id);
          if (materialData) {
            setMaterial(materialData);
          } else {
            setError("Material não encontrado");
          }
        } catch (err) {
          setError("Erro ao carregar material");
          toast({
            title: "Erro",
            description: "Não foi possível carregar os dados do material.",
            variant: "destructive"
          });
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      
      fetchMaterial();
    }
  }, [id]);
  
  // Redirecionar se não tiver permissão
  if (!canEditMaterial) {
    return <Navigate to="/materiais" />;
  }
  
  // Exibir loading
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Exibir erro
  if (error || !material) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-destructive mb-2">{error || "Material não encontrado"}</h2>
        <p className="text-muted-foreground">Verifique o ID do material e tente novamente.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Material</h1>
          <p className="text-muted-foreground mt-2">
            Nota Fiscal: <span className="font-medium">{material?.notaFiscal}</span>
          </p>
        </div>
        <PrintButton className="print:hidden" />
      </div>
      
      <MaterialForm material={material} isEditing={true} />
    </div>
  );
}
