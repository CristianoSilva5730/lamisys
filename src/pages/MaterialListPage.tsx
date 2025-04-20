import { useState, useEffect } from "react";
import { Material } from "@/lib/types";
import { materialAPI } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Edit, Trash } from "lucide-react";

export default function MaterialListPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const data = await materialAPI.getAll();
      setMaterials(data);
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

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Lista de Materiais</h1>
        <Link to="/materiais/novo">
          <Button>Novo Material</Button>
        </Link>
      </div>

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
            ) : materials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  Nenhum material encontrado.
                </TableCell>
              </TableRow>
            ) : (
              materials.map((material) => (
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
                      <Button variant="ghost" size="icon">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
