import { useAuth } from "@/contexts/AuthContext";
import React, { useState, useEffect } from "react";
import { 
  getAllAlarms, 
  createAlarm, 
  updateAlarm, 
  deleteAlarm 
} from "@/lib/database";
import { AlarmRule } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Trash, Plus, Bell } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function AlarmPage() {
  const { user } = useAuth();
  const [alarms, setAlarms] = useState<AlarmRule[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentAlarm, setCurrentAlarm] = useState<Partial<AlarmRule>>({});
  const [alarmToDelete, setAlarmToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadAlarms();
  }, []);

  const loadAlarms = () => {
    const loadedAlarms = getAllAlarms();
    setAlarms(loadedAlarms);
  };

  const handleCreateAlarm = () => {
    setCurrentAlarm({
      name: "",
      type: "TEMPO_ETAPA",
      condition: "",
      value: 7,
      recipients: [],
      active: true,
      createdBy: user?.email || "sistema"
    });
    setIsDialogOpen(true);
  };

  const handleEditAlarm = (alarm: AlarmRule) => {
    setCurrentAlarm(alarm);
    setIsDialogOpen(true);
  };

  const handleDeleteAlarm = (id: string) => {
    setAlarmToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteAlarm = () => {
    if (alarmToDelete) {
      deleteAlarm(alarmToDelete);
      loadAlarms();
      setIsDeleteDialogOpen(false);
      setAlarmToDelete(null);
      toast({
        title: "Alarme excluído",
        description: "O alarme foi excluído com sucesso."
      });
    }
  };

  const handleSaveAlarm = () => {
    try {
      if (currentAlarm.id) {
        // Atualizar alarme existente
        updateAlarm(currentAlarm.id, currentAlarm as AlarmRule);
        toast({
          title: "Alarme atualizado",
          description: "O alarme foi atualizado com sucesso."
        });
      } else {
        // Criar novo alarme
        createAlarm(currentAlarm as Omit<AlarmRule, "id" | "createdAt">);
        toast({
          title: "Alarme criado",
          description: "O novo alarme foi criado com sucesso."
        });
      }
      
      loadAlarms();
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao salvar o alarme."
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentAlarm(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setCurrentAlarm(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setCurrentAlarm(prev => ({ ...prev, active: checked }));
  };

  const handleRecipientsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const emails = e.target.value.split(',').map(email => email.trim());
    setCurrentAlarm(prev => ({ ...prev, recipients: emails }));
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Alarmes</h1>
        <Button onClick={handleCreateAlarm}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Alarme
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Condição</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Destinatários</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alarms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  Nenhum alarme configurado
                </TableCell>
              </TableRow>
            ) : (
              alarms.map(alarm => (
                <TableRow key={alarm.id}>
                  <TableCell className="font-medium">{alarm.name}</TableCell>
                  <TableCell>
                    {alarm.type === "TEMPO_ETAPA" ? "Tempo em Etapa" : 
                     alarm.type === "TEMPO_TOTAL" ? "Tempo Total" : 
                     alarm.type === "NOVO_ITEM" ? "Novo Item" : alarm.type}
                  </TableCell>
                  <TableCell>{alarm.condition || "-"}</TableCell>
                  <TableCell>{alarm.value || "-"}</TableCell>
                  <TableCell>
                    {alarm.recipients?.join(", ")}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${alarm.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                      {alarm.active ? "Ativo" : "Inativo"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditAlarm(alarm)}
                      >
                        <Bell className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteAlarm(alarm.id)}
                      >
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
      
      {/* Dialog para criar/editar alarme */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {currentAlarm.id ? "Editar Alarme" : "Novo Alarme"}
            </DialogTitle>
            <DialogDescription>
              Configure os parâmetros do alarme para notificações automáticas.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Alarme</Label>
              <Input
                id="name"
                name="name"
                value={currentAlarm.name || ""}
                onChange={handleInputChange}
                placeholder="Ex: Alerta de material pendente"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="type">Tipo de Alarme</Label>
              <Select
                value={currentAlarm.type || "TEMPO_ETAPA"}
                onValueChange={(value) => handleSelectChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEMPO_ETAPA">Tempo em Etapa</SelectItem>
                  <SelectItem value="TEMPO_TOTAL">Tempo Total</SelectItem>
                  <SelectItem value="NOVO_ITEM">Novo Item</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {currentAlarm.type !== "NOVO_ITEM" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="condition">Condição (opcional)</Label>
                  <Input
                    id="condition"
                    name="condition"
                    value={currentAlarm.condition || ""}
                    onChange={handleInputChange}
                    placeholder="Ex: status === 'PENDENTE'"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="value">Valor (dias)</Label>
                  <Input
                    id="value"
                    name="value"
                    type="number"
                    value={currentAlarm.value || ""}
                    onChange={handleInputChange}
                    placeholder="Ex: 7"
                  />
                </div>
              </>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="recipients">Destinatários (separados por vírgula)</Label>
              <Input
                id="recipients"
                name="recipients"
                value={currentAlarm.recipients?.join(", ") || ""}
                onChange={handleRecipientsChange}
                placeholder="Ex: email1@exemplo.com, email2@exemplo.com"
              />
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="active"
                checked={currentAlarm.active}
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor="active">Alarme Ativo</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveAlarm}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog de confirmação de exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este alarme? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeleteAlarm}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
