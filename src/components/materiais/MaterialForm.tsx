
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Material, MaterialStatus, MaterialType } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MaterialHistory } from "@/components/materiais/MaterialHistory";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { materialAPI } from "@/services/api";
import { toast } from "@/hooks/use-toast";

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
      console.log("Submetendo formulário de material, modo de edição:", isEditing);
      
      if (isEditing && material) {
        console.log("Atualizando material existente:", material.id);
        // Atualizar material existente via API
        const updatedMaterial = await materialAPI.update(
          material.id,
          formData,
          user.id // Usando o ID do usuário em vez do email
        );
        
        console.log("Material atualizado:", updatedMaterial);
        
        toast({
          title: "Sucesso",
          description: "Material atualizado com sucesso."
        });
      } else {
        console.log("Criando novo material");
        // Criar novo material via API
        const materialData = {
          ...formData,
          id: Date.now().toString(), // Gerar ID único
          createdBy: user.id, // Usando o ID do usuário em vez do email
          createdAt: new Date().toISOString()
        };
        
        console.log("Dados completos do material:", materialData);
        
        const newMaterial = await materialAPI.create(materialData);
        
        console.log("Material criado:", newMaterial);
        
        toast({
          title: "Sucesso",
          description: "Material cadastrado com sucesso."
        });
      }
      
      // Redirecionar para a lista após sucesso
      navigate("/materiais");
    } catch (err: any) {
      console.error("Erro ao processar material:", err);
      
      let errorMessage = err.response?.data?.error || "Erro ao processar material";
      
      // Adicionar mensagem específica para erro de foreign key
      if (err.message?.includes('FOREIGN_KEY') || errorMessage.includes('FOREIGN_KEY')) {
        errorMessage = "Erro de referência no banco de dados. Verifique se o seu usuário está cadastrado corretamente no sistema.";
      }
      
      setError(errorMessage);
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
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