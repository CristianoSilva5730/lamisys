

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Material, MaterialStatus, MaterialType } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { createMaterial, updateMaterial } from "@/lib/database";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MaterialHistory } from "@/components/materiais/MaterialHistory";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MaterialFormProps {
  material?: Material;
  isEditing?: boolean;
}

export function MaterialForm({ material, isEditing = false }: MaterialFormProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Estado do formulário
  const [formData, setFormData] = useState<Partial<Material>>(
    material || {
      notaFiscal: "",
      numeroOrdem: "",
      detalhesEquipamento: "",
      tipoOrdem: "",
      tipoMaterial: MaterialType.OUTRO,
      remessa: "",
      codigoSAP: "",
      empresa: "",
      transportadora: "",
      dataEnvio: "",
      dataRemessa: "",
      status: MaterialStatus.PENDENTE,
      observacoes: "",
      comentarios: ""
    }
  );
  
  // Handler para mudanças nos campos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handler para mudanças em selects
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Submit do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError("Você precisa estar logado para realizar esta ação");
      return;
    }
    
    // Validação básica dos campos obrigatórios
    const requiredFields = [
      "notaFiscal", 
      "numeroOrdem", 
      "detalhesEquipamento", 
      "tipoOrdem",
      "tipoMaterial",
      "remessa",
      "codigoSAP",
      "empresa",
      "transportadora",
      "dataEnvio",
      "dataRemessa",
      "status"
    ];
    
    const missingFields = requiredFields.filter(field => !formData[field as keyof Material]);
    
    if (missingFields.length > 0) {
      setError(`Campos obrigatórios não preenchidos: ${missingFields.join(", ")}`);
      return;
    }
    
    setIsSubmitting(true);
    setError("");
    
    try {
      if (isEditing && material) {
        // Atualizar material existente
        const updated = updateMaterial(
          material.id,
          formData,
          user.email
        );
        
        if (!updated) {
          throw new Error("Erro ao atualizar material");
        }
      } else {
        // Criar novo material
        createMaterial({
          ...formData as Omit<Material, "id" | "createdAt" | "createdBy" | "history">,
        });
      }
      
      // Redirecionar para a lista após sucesso
      navigate("/materiais");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar material");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>{isEditing ? "Editar Material" : "Cadastrar Novo Material"}</CardTitle>
        <CardDescription>
          {isEditing 
            ? "Atualize as informações do material conforme necessário" 
            : "Preencha os dados para cadastrar um novo material"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nota Fiscal */}
            <div className="space-y-2">
              <Label htmlFor="notaFiscal">Nota Fiscal<span className="text-destructive">*</span></Label>
              <Input
                id="notaFiscal"
                name="notaFiscal"
                value={formData.notaFiscal || ""}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
            </div>
            
            {/* Número da Ordem */}
            <div className="space-y-2">
              <Label htmlFor="numeroOrdem">Número da Ordem<span className="text-destructive">*</span></Label>
              <Input
                id="numeroOrdem"
                name="numeroOrdem"
                value={formData.numeroOrdem || ""}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
            </div>
            
            {/* Detalhes do Equipamento */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="detalhesEquipamento">Detalhes do Equipamento<span className="text-destructive">*</span></Label>
              <Input
                id="detalhesEquipamento"
                name="detalhesEquipamento"
                value={formData.detalhesEquipamento || ""}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
            </div>
            
            {/* Tipo de Ordem */}
            <div className="space-y-2">
              <Label htmlFor="tipoOrdem">Tipo de Ordem<span className="text-destructive">*</span></Label>
              <Input
                id="tipoOrdem"
                name="tipoOrdem"
                value={formData.tipoOrdem || ""}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
            </div>
            
            {/* Tipo de Material */}
            <div className="space-y-2">
              <Label htmlFor="tipoMaterial">Tipo de Material<span className="text-destructive">*</span></Label>
              <Select
                value={formData.tipoMaterial}
                onValueChange={(value) => handleSelectChange("tipoMaterial", value)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um tipo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(MaterialType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Remessa */}
            <div className="space-y-2">
              <Label htmlFor="remessa">Remessa<span className="text-destructive">*</span></Label>
              <Input
                id="remessa"
                name="remessa"
                value={formData.remessa || ""}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
            </div>
            
            {/* Código SAP */}
            <div className="space-y-2">
              <Label htmlFor="codigoSAP">Código SAP<span className="text-destructive">*</span></Label>
              <Input
                id="codigoSAP"
                name="codigoSAP"
                value={formData.codigoSAP || ""}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
            </div>
            
            {/* Empresa */}
            <div className="space-y-2">
              <Label htmlFor="empresa">Empresa<span className="text-destructive">*</span></Label>
              <Input
                id="empresa"
                name="empresa"
                value={formData.empresa || ""}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
            </div>
            
            {/* Transportadora */}
            <div className="space-y-2">
              <Label htmlFor="transportadora">Transportadora<span className="text-destructive">*</span></Label>
              <Input
                id="transportadora"
                name="transportadora"
                value={formData.transportadora || ""}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
            </div>
            
            {/* Data de Envio */}
            <div className="space-y-2">
              <Label htmlFor="dataEnvio">Data de Envio<span className="text-destructive">*</span></Label>
              <Input
                id="dataEnvio"
                name="dataEnvio"
                type="date"
                value={formData.dataEnvio || ""}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
            </div>
            
            {/* Data da Remessa */}
            <div className="space-y-2">
              <Label htmlFor="dataRemessa">Data da Remessa<span className="text-destructive">*</span></Label>
              <Input
                id="dataRemessa"
                name="dataRemessa"
                type="date"
                value={formData.dataRemessa || ""}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
            </div>
            
            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status<span className="text-destructive">*</span></Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(MaterialStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Campos de texto extenso (col-span-2) */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                name="observacoes"
                value={formData.observacoes || ""}
                onChange={handleChange}
                disabled={isSubmitting}
                rows={3}
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="comentarios">Comentários</Label>
              <Textarea
                id="comentarios"
                name="comentarios"
                value={formData.comentarios || ""}
                onChange={handleChange}
                disabled={isSubmitting}
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/materiais")}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Processando..." : isEditing ? "Atualizar" : "Cadastrar"}
            </Button>
          </div>
        </form>
      </CardContent>
      
      {/* Exibir histórico somente em modo de edição */}
      {isEditing && material?.history && material.history.length > 0 && (
        <div className="mt-8">
          <MaterialHistory history={material.history} />
        </div>
      )}
    </Card>
  );
}
