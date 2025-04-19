
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { deleteMaterial } from "@/lib/database";

interface DeleteMaterialDialogProps {
  materialId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

export function DeleteMaterialDialog({ materialId, open, onOpenChange, onDeleted }: DeleteMaterialDialogProps) {
  const [reason, setReason] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  
  const handleDelete = () => {
    if (!reason.trim()) {
      setError("A justificativa é obrigatória");
      return;
    }
    
    if (!confirming) {
      setConfirming(true);
      return;
    }
    
    try {
      if (user) {
        const deleted = deleteMaterial(materialId, reason, user.email);
        if (deleted) {
          onDeleted();
          onOpenChange(false);
          setConfirming(false);
          setReason("");
          setError("");
        } else {
          throw new Error("Não foi possível excluir o material");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir material");
    }
  };
  
  const handleCancel = () => {
    setConfirming(false);
    setReason("");
    setError("");
    onOpenChange(false);
  };
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lamisys-danger">
            {confirming ? "Confirmação Final" : "Excluir Material"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {confirming 
              ? "Esta ação não pode ser desfeita. O item será movido para a área de itens excluídos."
              : "Por favor, informe uma justificativa para a exclusão deste material:"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {!confirming && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Justificativa<span className="text-destructive">*</span></Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (e.target.value.trim()) setError("");
                }}
                placeholder="Descreva o motivo da exclusão..."
                className={error ? "border-destructive" : ""}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </div>
        )}
        
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancelar</AlertDialogCancel>
          <Button variant="destructive" onClick={handleDelete}>
            {confirming ? "Confirmo a Exclusão" : "Prosseguir"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
