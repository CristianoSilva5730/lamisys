
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MaterialStatus, MaterialType } from "@/lib/types";

export interface FilterParams {
  search: string;
  status: string;
  tipo: string;
  empresa: string;
}

interface MaterialFilterProps {
  onFilterChange: (filters: FilterParams) => void;
  empresas: string[];
}

export function MaterialFilter({ onFilterChange, empresas }: MaterialFilterProps) {
  const [filters, setFilters] = useState<FilterParams>({
    search: "",
    status: "",
    tipo: "",
    empresa: ""
  });
  
  const [tempSearch, setTempSearch] = useState("");
  
  // Aplicar filtros
  const applyFilters = () => {
    onFilterChange({ ...filters, search: tempSearch });
  };
  
  // Limpar filtros
  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      tipo: "",
      empresa: ""
    });
    setTempSearch("");
    onFilterChange({
      search: "",
      status: "",
      tipo: "",
      empresa: ""
    });
  };
  
  // Atualizar filtros quando selects mudarem
  useEffect(() => {
    onFilterChange({ ...filters, search: tempSearch });
  }, [filters.status, filters.tipo, filters.empresa]);
  
  // Handler para mudanças em selects
  const handleSelectChange = (name: string, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-border p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Busca */}
        <div className="space-y-2">
          <Label htmlFor="search">Busca</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Nota fiscal, ordem, etc"
              className="pl-8"
              value={tempSearch}
              onChange={(e) => setTempSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  applyFilters();
                }
              }}
            />
          </div>
        </div>
        
        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={filters.status}
            onValueChange={(value) => handleSelectChange("status", value)}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os status</SelectItem>
              {Object.values(MaterialStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Tipo de Material */}
        <div className="space-y-2">
          <Label htmlFor="tipo">Tipo de Material</Label>
          <Select
            value={filters.tipo}
            onValueChange={(value) => handleSelectChange("tipo", value)}
          >
            <SelectTrigger id="tipo">
              <SelectValue placeholder="Todos os tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os tipos</SelectItem>
              {Object.values(MaterialType).map((tipo) => (
                <SelectItem key={tipo} value={tipo}>
                  {tipo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Empresa */}
        <div className="space-y-2">
          <Label htmlFor="empresa">Empresa</Label>
          <Select
            value={filters.empresa}
            onValueChange={(value) => handleSelectChange("empresa", value)}
          >
            <SelectTrigger id="empresa">
              <SelectValue placeholder="Todas as empresas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as empresas</SelectItem>
              {empresas.map((empresa) => (
                <SelectItem key={empresa} value={empresa}>
                  {empresa}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={clearFilters}>
          Limpar Filtros
        </Button>
        <Button onClick={applyFilters}>
          Aplicar Filtros
        </Button>
      </div>
    </div>
  );
}
