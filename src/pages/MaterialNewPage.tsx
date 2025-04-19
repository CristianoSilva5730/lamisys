
import { useAuth } from "@/contexts/AuthContext";
import { hasPermission, PERMISSIONS } from "@/lib/utils/permissions";
import { Navigate } from "react-router-dom";
import { MaterialForm } from "@/components/materiais/MaterialForm";

export default function MaterialNewPage() {
  const { user } = useAuth();
  
  // Verificar permissão
  const canCreateMaterial = hasPermission(user, PERMISSIONS.CREATE_DELETE_MATERIAL);
  
  // Redirecionar se não tiver permissão
  if (!canCreateMaterial) {
    return <Navigate to="/materiais" />;
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Novo Material</h1>
        <p className="text-muted-foreground mt-2">
          Cadastre um novo material no sistema
        </p>
      </div>
      
      <MaterialForm />
    </div>
  );
}
