
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { materialAPI } from "@/services/api";
import { toast } from "@/components/ui/use-toast";

interface DeleteMaterialDialogProps {
  materialId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

export function DeleteMaterialDialog({
  materialId,
  open,
  onOpenChange,
  onDeleted
}: DeleteMaterialDialogProps) {
  const { user } = useAuth();
  const [reason, setReason] = useState("");
  const [confirmedId, setConfirmedId] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  
  const handleDelete = async () => {
    if (!user) {
      setError("Você precisa estar logado para realizar esta ação");
      return;
    }
    
    if (!reason.trim()) {
      setError("O motivo da exclusão é obrigatório");
      return;
    }
    
    if (confirmedId !== materialId) {
      setError("ID de confirmação não corresponde ao ID do material");
      return;
    }
    
    setIsDeleting(true);
    setError("");
    
    try {
      await materialAPI.delete(materialId, reason, user.email);
      
      toast({
        title: "Material excluído",
        description: "O material foi excluído com sucesso."
      });
      
      // Fechar o dialog e notificar sobre a exclusão
      onOpenChange(false);
      onDeleted();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Erro ao excluir material";
      setError(errorMessage);
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Resetar estado ao abrir/fechar
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setReason("");
      setConfirmedId("");
      setError("");
    }
    onOpenChange(open);
  };
  
  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive">
            Excluir Material
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. O material será removido permanentemente
            do sistema, mas ficará disponível no histórico de exclusões.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="delete-reason" className="text-destructive">
              Motivo da exclusão <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="delete-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Descreva o motivo da exclusão deste material"
              disabled={isDeleting}
              className="resize-none"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirm-id" className="text-destructive">
              Confirme o ID <span className="text-destructive">*</span>
            </Label>
            <Input
              id="confirm-id"
              value={confirmedId}
              onChange={(e) => setConfirmedId(e.target.value)}
              placeholder={`Digite ${materialId} para confirmar`}
              disabled={isDeleting}
              required
            />
            <p className="text-xs text-muted-foreground">
              Para confirmar a exclusão, digite o ID do material: <strong>{materialId}</strong>
            </p>
          </div>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting || !reason.trim() || confirmedId !== materialId}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Excluindo..." : "Excluir Material"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
