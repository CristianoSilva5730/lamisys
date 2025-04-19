import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
import { getAllMaterials } from "@/lib/database";
import { Material } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { differenceInDays } from "date-fns";
import { PrintButton } from "@/components/shared/PrintButton";

export default function AnalyticsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [entregaData, setEntregaData] = useState<any[]>([]);
  const [transportadoraData, setTransportadoraData] = useState<any[]>([]);
  const [empresaData, setEmpresaData] = useState<any[]>([]);
  
  useEffect(() => {
    const allMaterials = getAllMaterials();
    setMaterials(allMaterials);
    
    const transportadoraTempos: Record<string, { total: number; count: number }> = {};
    
    allMaterials.forEach(material => {
      if (material.status === "ENTREGUE" || material.status === "CONCLUÍDO") {
        const dataEnvio = new Date(material.dataEnvio);
        const dataRemessa = new Date(material.dataRemessa);
        const dias = differenceInDays(dataEnvio, dataRemessa);
        
        if (dias >= 0) {
          if (!transportadoraTempos[material.transportadora]) {
            transportadoraTempos[material.transportadora] = { total: 0, count: 0 };
          }
          
          transportadoraTempos[material.transportadora].total += dias;
          transportadoraTempos[material.transportadora].count += 1;
        }
      }
    });
    
    const transportadoraResult = Object.entries(transportadoraTempos)
      .map(([name, { total, count }]) => ({
        name,
        dias: Math.round(total / count)
      }))
      .sort((a, b) => b.dias - a.dias)
      .slice(0, 10);
    
    setTransportadoraData(transportadoraResult);
    
    const empresaTempos: Record<string, { total: number; count: number }> = {};
    
    allMaterials.forEach(material => {
      if (material.status === "DEVOLVIDO") {
        const dataEnvio = new Date(material.dataEnvio);
        const dataRemessa = new Date(material.dataRemessa);
        const dias = differenceInDays(dataEnvio, dataRemessa);
        
        if (dias >= 0) {
          if (!empresaTempos[material.empresa]) {
            empresaTempos[material.empresa] = { total: 0, count: 0 };
          }
          
          empresaTempos[material.empresa].total += dias;
          empresaTempos[material.empresa].count += 1;
        }
      }
    });
    
    const empresaResult = Object.entries(empresaTempos)
      .map(([name, { total, count }]) => ({
        name,
        dias: Math.round(total / count)
      }))
      .sort((a, b) => b.dias - a.dias)
      .slice(0, 10);
    
    setEmpresaData(empresaResult);
    
    const entregaTempos: Record<string, { total: number; count: number }> = {};
    
    allMaterials.forEach(material => {
      if (material.status === "ENTREGUE" || material.status === "CONCLUÍDO") {
        const dataEnvio = new Date(material.dataEnvio);
        const dataRemessa = new Date(material.dataRemessa);
        const dias = differenceInDays(dataEnvio, dataRemessa);
        
        if (dias >= 0) {
          if (!entregaTempos[material.tipoMaterial]) {
            entregaTempos[material.tipoMaterial] = { total: 0, count: 0 };
          }
          
          entregaTempos[material.tipoMaterial].total += dias;
          entregaTempos[material.tipoMaterial].count += 1;
        }
      }
    });
    
    const entregaResult = Object.entries(entregaTempos)
      .map(([name, { total, count }]) => ({
        name,
        dias: Math.round(total / count)
      }))
      .sort((a, b) => b.dias - a.dias);
    
    setEntregaData(entregaResult);
  }, []);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Análise de dados e relatórios do sistema
          </p>
        </div>
        <PrintButton className="print:hidden" />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 print:grid-cols-1">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Tempo Médio até Entrega por Tipo de Material</CardTitle>
            <CardDescription>
              Materiais que mais demoram a serem entregues (em dias)
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={entregaData}
                margin={{ top: 20, right: 30, left: 40, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }} 
                  angle={-45} 
                  textAnchor="end"
                />
                <YAxis label={{ value: 'Dias', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => [`${value} dias`, "Tempo Médio"]} />
                <Bar dataKey="dias" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Desempenho de Transportadoras</CardTitle>
            <CardDescription>
              Transportadoras que mais demoram a entregar (em dias)
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={transportadoraData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ fontSize: 12 }}
                  width={90}
                />
                <Tooltip formatter={(value) => [`${value} dias`, "Tempo Médio"]} />
                <Bar dataKey="dias" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Desempenho de Empresas</CardTitle>
            <CardDescription>
              Empresas que mais demoram a devolver (em dias)
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={empresaData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ fontSize: 12 }}
                  width={90}
                />
                <Tooltip formatter={(value) => [`${value} dias`, "Tempo Médio"]} />
                <Bar dataKey="dias" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
