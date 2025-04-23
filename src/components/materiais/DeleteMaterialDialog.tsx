import { useAuth } from "@/contexts/AuthContext";
import { materialAPI } from "@/services/api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

interface DeleteMaterialDialogProps {
  materialId: string;
  materialName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteMaterialDialog({
  materialId,
  materialName,
  isOpen,
  onClose,
}: DeleteMaterialDialogProps) {
  const [reason, setReason] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!reason.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, informe o motivo da exclusão.",
        variant: "destructive",
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Usuário não identificado. Por favor, faça login novamente.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsDeleting(true);
      const result = await materialAPI.delete(materialId, reason, user.id);
      
      if (result) {
        toast({
          title: "Material excluído",
          description: "O material foi excluído com sucesso.",
        });
        onClose();
        navigate("/materiais");
      } else {
        throw new Error("Falha ao excluir material");
      }
    } catch (error) {
      console.error("Erro ao excluir material:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir o material. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Excluir Material</DialogTitle>
          <DialogDescription>
            Essa ação não pode ser desfeita. O material será movido para a lista
            de itens excluídos.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Você está prestes a excluir o material:{" "}
              <span className="font-medium text-foreground">{materialName}</span>
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="reason" className="required">
              Motivo da Exclusão
            </Label>
            <Textarea
              id="reason"
              placeholder="Informe o motivo da exclusão..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!reason.trim() || isDeleting}
          >
            {isDeleting ? "Excluindo..." : "Excluir Material"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
