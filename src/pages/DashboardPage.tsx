
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { getAllMaterials } from "@/lib/database";
import { Material, MaterialStatus, MaterialType } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [statusCount, setStatusCount] = useState<{ name: string; value: number }[]>([]);
  const [typeCount, setTypeCount] = useState<{ name: string; value: number }[]>([]);
  
  // Carregar dados ao montar o componente
  useEffect(() => {
    const loadData = () => {
      const allMaterials = getAllMaterials();
      setMaterials(allMaterials);
      
      // Contar por status
      const statusCounts: Record<string, number> = {};
      Object.values(MaterialStatus).forEach(status => {
        statusCounts[status] = allMaterials.filter(m => m.status === status).length;
      });
      
      setStatusCount(
        Object.entries(statusCounts).map(([name, value]) => ({ name, value }))
      );
      
      // Contar por tipo
      const typeCounts: Record<string, number> = {};
      Object.values(MaterialType).forEach(type => {
        typeCounts[type] = allMaterials.filter(m => m.tipoMaterial === type).length;
      });
      
      setTypeCount(
        Object.entries(typeCounts)
          .map(([name, value]) => ({ name, value }))
          .filter(item => item.value > 0) // Remover tipos sem materiais
      );
    };
    
    loadData();
  }, []);
  
  // Cores para os gráficos
  const COLORS = [
    "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8",
    "#82CA9D", "#FF7C7C", "#8DD1E1", "#A4DE6C", "#D0ED57"
  ];
  
  // Formatar valores de status para exibição
  const formatStatusName = (status: string) => {
    switch (status) {
      case MaterialStatus.PENDENTE: return "Pendente";
      case MaterialStatus.ENVIADO: return "Enviado";
      case MaterialStatus.ENTREGUE: return "Entregue";
      case MaterialStatus.DEVOLVIDO: return "Devolvido";
      case MaterialStatus.CONCLUIDO: return "Concluído";
      case MaterialStatus.CANCELADO: return "Cancelado";
      default: return status;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>
      
      {/* Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Materiais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{materials.length}</div>
            <p className="text-xs text-muted-foreground">
              Materiais cadastrados no sistema
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {materials.filter(m => m.status === MaterialStatus.PENDENTE).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Materiais aguardando envio
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Trânsito</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {materials.filter(m => m.status === MaterialStatus.ENVIADO).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Materiais enviados em trânsito
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {materials.filter(m => m.status === MaterialStatus.CONCLUIDO).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Materiais com processo finalizado
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Gráfico de status */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Materiais por Status</CardTitle>
            <CardDescription>Distribuição de materiais por status atual</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={statusCount}
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={formatStatusName}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis />
                <Tooltip formatter={(value, name) => [`${value}`, formatStatusName(name as string)]} />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Gráfico de tipo de material */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Materiais por Tipo</CardTitle>
            <CardDescription>Distribuição de materiais por categoria</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeCount}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={(entry) => entry.name}
                >
                  {typeCount.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}`, "Quantidade"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
