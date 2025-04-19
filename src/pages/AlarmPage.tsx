import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { hasPermission, PERMISSIONS } from "@/lib/utils/permissions";
import { Button } from "@/components/ui/button";
import { AlarmClock, PlusCircle, Edit, Trash, Bell, BellOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { AlarmRule, User, UserRole } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const alarmFormSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  type: z.enum(["TEMPO_ETAPA", "TEMPO_TOTAL", "NOVO_ITEM"], {
    required_error: "Selecione um tipo de alarme",
  }),
  condition: z.string().optional(),
  value: z.number().min(1).optional(),
  recipients: z.array(z.string()).min(1, { message: "Selecione pelo menos um destinatário" }),
  active: z.boolean().default(true),
});

type AlarmFormValues = z.infer<typeof alarmFormSchema>;

const createNewAlarm = (formData: z.infer<typeof alarmFormSchema>): AlarmRule => ({
  id: Date.now().toString(),
  name: formData.name,
  type: formData.type,
  condition: formData.condition,
  value: formData.value,
  recipients: formData.recipients,
  active: true,
  createdBy: user?.email || "sistema",
  createdAt: new Date().toISOString(),
});

const mockUsers: User[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao.silva@sinobras.com.br",
    matricula: "12345",
    role: UserRole.ADMIN
  },
  {
    id: "2",
    name: "Maria Oliveira",
    email: "maria.oliveira@sinobras.com.br",
    matricula: "23456",
    role: UserRole.PLANEJADOR
  },
  {
    id: "3",
    name: "Pedro Santos",
    email: "pedro.santos@sinobras.com.br",
    matricula: "34567",
    role: UserRole.USUARIO
  }
];

const mockAlarms: AlarmRule[] = [
  {
    id: "1",
    name: "Material parado por mais de 7 dias",
    type: "TEMPO_ETAPA",
    condition: "status === 'PENDENTE'",
    value: 7,
    recipients: ["1", "2"],
    active: true,
    createdBy: "João Silva",
    createdAt: "2023-10-15T14:30:00Z"
  },
  {
    id: "2",
    name: "Material sem conclusão após 30 dias",
    type: "TEMPO_TOTAL",
    value: 30,
    recipients: ["1"],
    active: false,
    createdBy: "Maria Oliveira",
    createdAt: "2023-09-28T10:15:00Z"
  },
  {
    id: "3",
    name: "Novo material cadastrado",
    type: "NOVO_ITEM",
    recipients: ["1", "2", "3"],
    active: true,
    createdBy: "João Silva",
    createdAt: "2023-11-05T09:45:00Z"
  }
];

export default function AlarmPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [alarms, setAlarms] = useState<AlarmRule[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAlarm, setSelectedAlarm] = useState<AlarmRule | null>(null);
  
  const form = useForm<AlarmFormValues>({
    resolver: zodResolver(alarmFormSchema),
    defaultValues: {
      name: "",
      type: "TEMPO_ETAPA",
      condition: "",
      value: 1,
      recipients: [],
      active: true,
    },
  });
  
  const editForm = useForm<AlarmFormValues>({
    resolver: zodResolver(alarmFormSchema),
    defaultValues: {
      name: "",
      type: "TEMPO_ETAPA",
      condition: "",
      value: 1,
      recipients: [],
      active: true,
    },
  });
  
  const canManageAlarms = hasPermission(user, PERMISSIONS.CREATE_ALARMS);
  
  useEffect(() => {
    if (canManageAlarms) {
      setAlarms(mockAlarms);
    }
  }, [canManageAlarms]);
  
  useEffect(() => {
    if (isCreateDialogOpen) {
      form.reset({
        name: "",
        type: "TEMPO_ETAPA",
        condition: "",
        value: 1,
        recipients: [],
        active: true,
      });
    }
  }, [isCreateDialogOpen, form]);
  
  useEffect(() => {
    if (selectedAlarm && isEditDialogOpen) {
      editForm.reset({
        name: selectedAlarm.name,
        type: selectedAlarm.type,
        condition: selectedAlarm.condition || "",
        value: selectedAlarm.value || 1,
        recipients: selectedAlarm.recipients,
        active: selectedAlarm.active,
      });
    }
  }, [selectedAlarm, isEditDialogOpen, editForm]);
  
  const handleCreateAlarm = (values: AlarmFormValues) => {
    const createdAlarm: AlarmRule = createNewAlarm(values);
    
    setAlarms(prev => [...prev, createdAlarm]);
    
    toast({
      title: "Alarme criado",
      description: `Alarme "${values.name}" criado com sucesso!`
    });
    
    setIsCreateDialogOpen(false);
  };
  
  const handleEditAlarm = (values: AlarmFormValues) => {
    if (!selectedAlarm) return;
    
    const updatedAlarm = { 
      ...selectedAlarm, 
      ...values 
    };
    
    setAlarms(prev => 
      prev.map(a => a.id === selectedAlarm.id ? updatedAlarm : a)
    );
    
    toast({
      title: "Alarme atualizado",
      description: `Alarme "${values.name}" atualizado com sucesso!`
    });
    
    setIsEditDialogOpen(false);
    setSelectedAlarm(null);
  };
  
  const handleDeleteAlarm = () => {
    if (!selectedAlarm) return;
    
    setAlarms(prev => prev.filter(a => a.id !== selectedAlarm.id));
    
    toast({
      title: "Alarme excluído",
      description: `Alarme "${selectedAlarm.name}" foi removido do sistema`
    });
    
    setIsDeleteDialogOpen(false);
    setSelectedAlarm(null);
  };
  
  const toggleAlarmStatus = (alarm: AlarmRule) => {
    const updatedAlarm = { ...alarm, active: !alarm.active };
    
    setAlarms(prev => 
      prev.map(a => a.id === alarm.id ? updatedAlarm : a)
    );
    
    toast({
      title: updatedAlarm.active ? "Alarme ativado" : "Alarme desativado",
      description: `Alarme "${alarm.name}" foi ${updatedAlarm.active ? "ativado" : "desativado"}`
    });
  };
  
  const openEditDialog = (alarm: AlarmRule) => {
    setSelectedAlarm(alarm);
    setIsEditDialogOpen(true);
  };
  
  const openDeleteDialog = (alarm: AlarmRule) => {
    setSelectedAlarm(alarm);
    setIsDeleteDialogOpen(true);
  };
  
  if (!canManageAlarms) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Alarmes</h1>
        <Alert variant="destructive">
          <AlertDescription>
            Você não tem permissão para acessar esta página.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  const getAlarmTypeLabel = (type: string) => {
    switch (type) {
      case "TEMPO_ETAPA": return "Tempo em etapa";
      case "TEMPO_TOTAL": return "Tempo total";
      case "NOVO_ITEM": return "Novo item";
      default: return type;
    }
  };
  
  const getAlarmDescription = (alarm: AlarmRule) => {
    switch (alarm.type) {
      case "TEMPO_ETAPA":
        return `Notificar quando um material permanecer ${alarm.value} dias em uma etapa${alarm.condition ? " com condição específica" : ""}`;
      case "TEMPO_TOTAL":
        return `Notificar quando um material completar ${alarm.value} dias desde a criação`;
      case "NOVO_ITEM":
        return "Notificar quando um novo material for cadastrado";
      default:
        return "";
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alarmes</h1>
          <p className="text-muted-foreground mt-2">
            Configure alertas automáticos para monitorar materiais
          </p>
        </div>
        
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <AlarmClock className="mr-2 h-4 w-4" /> Novo Alarme
        </Button>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="active">Ativos</TabsTrigger>
          <TabsTrigger value="inactive">Inativos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {alarms.length === 0 ? (
              <p className="col-span-full text-center py-8 text-muted-foreground">
                Nenhum alarme configurado
              </p>
            ) : (
              alarms.map(alarm => renderAlarmCard(alarm))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="active" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {alarms.filter(a => a.active).length === 0 ? (
              <p className="col-span-full text-center py-8 text-muted-foreground">
                Nenhum alarme ativo
              </p>
            ) : (
              alarms.filter(a => a.active).map(alarm => renderAlarmCard(alarm))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="inactive" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {alarms.filter(a => !a.active).length === 0 ? (
              <p className="col-span-full text-center py-8 text-muted-foreground">
                Nenhum alarme inativo
              </p>
            ) : (
              alarms.filter(a => !a.active).map(alarm => renderAlarmCard(alarm))
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Novo Alarme</DialogTitle>
            <DialogDescription>
              Configure um novo alarme para notificação automática
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateAlarm)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Alarme</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Materiais pendentes por mais de 7 dias" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Alarme</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de alarme" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="TEMPO_ETAPA">Tempo em etapa</SelectItem>
                        <SelectItem value="TEMPO_TOTAL">Tempo total</SelectItem>
                        <SelectItem value="NOVO_ITEM">Novo item</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {(form.watch("type") === "TEMPO_ETAPA" || form.watch("type") === "TEMPO_TOTAL") && (
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dias para alarme</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          {...field}
                          onChange={e => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Número de dias para disparar o alarme
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {form.watch("type") === "TEMPO_ETAPA" && (
                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condição (opcional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: status === 'PENDENTE'" 
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Condição adicional para o alarme (formato JavaScript)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={form.control}
                name="recipients"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destinatários</FormLabel>
                    <div className="space-y-2">
                      {mockUsers.map(user => (
                        <div className="flex items-center space-x-2" key={user.id}>
                          <input
                            type="checkbox"
                            id={`user-${user.id}`}
                            value={user.id}
                            checked={field.value.includes(user.id)}
                            onChange={(e) => {
                              const value = e.target.value;
                              const isChecked = e.target.checked;
                              
                              if (isChecked) {
                                field.onChange([...field.value, value]);
                              } else {
                                field.onChange(field.value.filter(val => val !== value));
                              }
                            }}
                            className="rounded border-primary text-primary focus:ring-primary"
                          />
                          <label htmlFor={`user-${user.id}`} className="text-sm">
                            {user.name} ({user.email})
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Switch 
                        checked={field.value} 
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Alarme ativo</FormLabel>
                  </FormItem>
                )}
              />
              
              <DialogFooter className="pt-4">
                <Button variant="outline" type="button" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Criar Alarme
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Alarme</DialogTitle>
            <DialogDescription>
              Altere as configurações do alarme
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditAlarm)} className="space-y-4 py-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Alarme</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Alarme</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de alarme" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="TEMPO_ETAPA">Tempo em etapa</SelectItem>
                        <SelectItem value="TEMPO_TOTAL">Tempo total</SelectItem>
                        <SelectItem value="NOVO_ITEM">Novo item</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {(editForm.watch("type") === "TEMPO_ETAPA" || editForm.watch("type") === "TEMPO_TOTAL") && (
                <FormField
                  control={editForm.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dias para alarme</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          {...field}
                          onChange={e => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Número de dias para disparar o alarme
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {editForm.watch("type") === "TEMPO_ETAPA" && (
                <FormField
                  control={editForm.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condição (opcional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: status === 'PENDENTE'" 
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Condição adicional para o alarme (formato JavaScript)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={editForm.control}
                name="recipients"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destinatários</FormLabel>
                    <div className="space-y-2">
                      {mockUsers.map(user => (
                        <div className="flex items-center space-x-2" key={user.id}>
                          <input
                            type="checkbox"
                            id={`edit-user-${user.id}`}
                            value={user.id}
                            checked={field.value.includes(user.id)}
                            onChange={(e) => {
                              const value = e.target.value;
                              const isChecked = e.target.checked;
                              
                              if (isChecked) {
                                field.onChange([...field.value, value]);
                              } else {
                                field.onChange(field.value.filter(val => val !== value));
                              }
                            }}
                            className="rounded border-primary text-primary focus:ring-primary"
                          />
                          <label htmlFor={`edit-user-${user.id}`} className="text-sm">
                            {user.name} ({user.email})
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Switch 
                        checked={field.value} 
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Alarme ativo</FormLabel>
                  </FormItem>
                )}
              />
              
              <DialogFooter className="pt-4">
                <Button variant="outline" type="button" onClick={() => setIsEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Salvar Alterações
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Alarme</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este alarme? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          {selectedAlarm && (
            <div className="py-4">
              <p className="font-semibold">{selectedAlarm.name}</p>
              <p className="text-sm text-muted-foreground">
                Tipo: {getAlarmTypeLabel(selectedAlarm.type)}
              </p>
              <p className="text-sm text-muted-foreground">
                {getAlarmDescription(selectedAlarm)}
              </p>
              <p className="text-sm text-muted-foreground">
                Destinatários: {selectedAlarm.recipients.length} usuário(s)
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteAlarm}>
              Confirmar Exclusão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
  
  function renderAlarmCard(alarm: AlarmRule) {
    return (
      <Card key={alarm.id} className={`border ${alarm.active ? "border-primary/50" : "opacity-70"}`}>
        <CardHeader className="pb-2 flex flex-row justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="flex items-center">
              {alarm.active ? 
                <Bell className="w-4 h-4 mr-2 text-primary" /> : 
                <BellOff className="w-4 h-4 mr-2 text-muted-foreground" />
              }
              {alarm.name}
            </CardTitle>
            <Badge variant={alarm.active ? "default" : "outline"} className="mt-1">
              {getAlarmTypeLabel(alarm.type)}
            </Badge>
          </div>
          <Switch
            checked={alarm.active}
            onCheckedChange={() => toggleAlarmStatus(alarm)}
            aria-label={alarm.active ? "Desativar alarme" : "Ativar alarme"}
          />
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-3">{getAlarmDescription(alarm)}</p>
          
          <div className="text-xs text-muted-foreground">
            <p>Criado por: {alarm.createdBy}</p>
            <p>Destinatários: {alarm.recipients.length} usuário(s)</p>
          </div>
          
          <div className="flex justify-end gap-1 mt-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => openEditDialog(alarm)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-destructive"
              onClick={() => openDeleteDialog(alarm)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
}
