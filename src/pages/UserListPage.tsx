
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { hasPermission, PERMISSIONS } from "@/lib/utils/permissions";
import { Button } from "@/components/ui/button";
import { UserPlus, Mail, Edit, Trash } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { User, UserRole } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";

// Mock de dados de usuários (seria substituído por uma função real no database.ts)
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

export default function UserListPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    matricula: "",
    role: UserRole.USUARIO
  });
  
  // Verificar permissão
  const canManageUsers = hasPermission(user, PERMISSIONS.VIEW_EDIT_USERS);
  
  // Carregar dados iniciais
  useEffect(() => {
    if (canManageUsers) {
      // Aqui seria a chamada real para o banco de dados
      setUsers(mockUsers);
    }
  }, [canManageUsers]);
  
  // Funções de manipulação
  const handleCreateUser = () => {
    // Validar campos
    if (!newUser.name || !newUser.email || !newUser.matricula) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    // Criar novo usuário (simulado)
    const createdUser: User = {
      id: Date.now().toString(),
      ...newUser,
      isFirstAccess: true
    };
    
    setUsers(prev => [...prev, createdUser]);
    
    // Enviar e-mail com dados (simulado)
    console.log("Enviando email para", createdUser.email);
    toast({
      title: "Usuário criado",
      description: `E-mail com senha temporária enviado para ${createdUser.email}`
    });
    
    // Resetar formulário
    setNewUser({
      name: "",
      email: "",
      matricula: "",
      role: UserRole.USUARIO
    });
    
    setIsCreateDialogOpen(false);
  };
  
  const handleEditUser = () => {
    if (!selectedUser) return;
    
    // Atualizar usuário (simulado)
    setUsers(prev => 
      prev.map(u => u.id === selectedUser.id ? selectedUser : u)
    );
    
    toast({
      title: "Usuário atualizado",
      description: `Dados de ${selectedUser.name} atualizados com sucesso`
    });
    
    setIsEditDialogOpen(false);
    setSelectedUser(null);
  };
  
  const handleDeleteUser = () => {
    if (!selectedUser) return;
    
    // Excluir usuário (simulado)
    setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
    
    toast({
      title: "Usuário excluído",
      description: `${selectedUser.name} foi removido do sistema`
    });
    
    setIsDeleteDialogOpen(false);
    setSelectedUser(null);
  };
  
  const handleResetPassword = (user: User) => {
    // Simular reset de senha
    toast({
      title: "Senha redefinida",
      description: `Nova senha temporária enviada para ${user.email}`
    });
  };
  
  // Renderização condicional se não tiver permissão
  if (!canManageUsers) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
        <Alert variant="destructive">
          <AlertDescription>
            Você não tem permissão para acessar esta página.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // Funções de manipulação
  const openEditDialog = (user: User) => {
    setSelectedUser({...user});
    setIsEditDialogOpen(true);
  };
  
  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };
  
  // Componente principal
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
        
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" /> Novo Usuário
        </Button>
      </div>
      
      {/* Lista de Usuários */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(user => (
          <Card key={user.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold">
                    {user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Badge variant={
                  user.role === UserRole.ADMIN || user.role === UserRole.DEVELOP 
                    ? "destructive" 
                    : user.role === UserRole.PLANEJADOR 
                      ? "secondary" 
                      : "outline"
                }>
                  {user.role}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm"><strong>Matrícula:</strong> {user.matricula}</p>
                {user.isFirstAccess && (
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    Primeiro acesso pendente
                  </p>
                )}
              </div>
              
              <div className="flex items-center justify-end space-x-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleResetPassword(user)}
                >
                  <Mail className="h-4 w-4 mr-1" /> Redefinir Senha
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => openEditDialog(user)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-destructive"
                  onClick={() => openDeleteDialog(user)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Dialog de Criar Usuário */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Usuário</DialogTitle>
            <DialogDescription>
              Preencha os dados para criar um novo usuário. Uma senha temporária será gerada e enviada por e-mail.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input 
                id="name" 
                value={newUser.name}
                onChange={e => setNewUser({...newUser, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input 
                id="email" 
                type="email"
                value={newUser.email}
                onChange={e => setNewUser({...newUser, email: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="matricula">Matrícula</Label>
              <Input 
                id="matricula" 
                value={newUser.matricula}
                onChange={e => setNewUser({...newUser, matricula: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Função</Label>
              <Select 
                value={newUser.role} 
                onValueChange={(value) => setNewUser({...newUser, role: value as UserRole})}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Selecione a função" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(UserRole).map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateUser}>
              Criar Usuário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog de Editar Usuário */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Altere os dados do usuário conforme necessário.
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome Completo</Label>
                <Input 
                  id="edit-name" 
                  value={selectedUser.name}
                  onChange={e => setSelectedUser({...selectedUser, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-email">E-mail</Label>
                <Input 
                  id="edit-email" 
                  type="email"
                  value={selectedUser.email}
                  onChange={e => setSelectedUser({...selectedUser, email: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-matricula">Matrícula</Label>
                <Input 
                  id="edit-matricula" 
                  value={selectedUser.matricula}
                  onChange={e => setSelectedUser({...selectedUser, matricula: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-role">Função</Label>
                <Select 
                  value={selectedUser.role} 
                  onValueChange={(value) => setSelectedUser({...selectedUser, role: value as UserRole})}
                >
                  <SelectTrigger id="edit-role">
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(UserRole).map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditUser}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog de Excluir Usuário */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Usuário</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="py-4">
              <p className="font-semibold">{selectedUser.name}</p>
              <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
              <p className="text-sm text-muted-foreground">Matrícula: {selectedUser.matricula}</p>
              <p className="text-sm text-muted-foreground">Função: {selectedUser.role}</p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Confirmar Exclusão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
