
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard, 
  Package, 
  PieChart, 
  Users, 
  Settings, 
  AlarmClock,
  Archive,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { PERMISSIONS, hasPermission } from "@/lib/utils/permissions";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  path: string;
  active: boolean;
  collapsed: boolean;
}

function SidebarItem({ icon: Icon, label, path, active, collapsed }: SidebarItemProps) {
  return (
    <Link
      to={path}
      className={cn(
        "flex items-center py-3 px-3 rounded-lg transition-all duration-200 group",
        active 
          ? "bg-primary text-primary-foreground" 
          : "hover:bg-muted text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className={cn("h-5 w-5 transition-all", collapsed ? "mr-0" : "mr-2")} />
      <span className={cn(
        "transition-all", 
        collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
      )}>
        {label}
      </span>
    </Link>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  
  // Obter iniciais para o avatar
  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name.split(" ")
      .map(part => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };
  
  return (
    <div
      className={cn(
        "flex flex-col h-screen border-r border-border bg-sidebar transition-all duration-300 relative",
        collapsed ? "w-[70px]" : "w-[240px]"
      )}
    >
      {/* Cabeçalho */}
      <div className="flex items-center p-4">
        <div className="flex items-center space-x-2 flex-grow">
          <div className="rounded-md bg-primary p-1">
            <span className="text-primary-foreground font-bold text-sm">LS</span>
          </div>
          <h1 
            className={cn(
              "font-semibold text-xl transition-all text-lamisys-primary dark:text-white",
              collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
            )}
          >
            LamiSys
          </h1>
        </div>
      </div>
      
      <Separator />
      
      {/* Menu Principal */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {/* Dashboard */}
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Dashboard" 
            path="/" 
            active={location.pathname === "/"} 
            collapsed={collapsed} 
          />
          
          {/* Materiais */}
          <div className="pt-2">
            <div 
              className={cn(
                "px-3 py-1 text-xs uppercase font-semibold text-muted-foreground",
                collapsed ? "opacity-0" : "opacity-100"
              )}
            >
              Materiais
            </div>
            <SidebarItem 
              icon={Package} 
              label="Lista de Materiais" 
              path="/materiais" 
              active={location.pathname === "/materiais"} 
              collapsed={collapsed} 
            />
            {hasPermission(user, PERMISSIONS.CREATE_DELETE_MATERIAL) && (
              <SidebarItem 
                icon={Archive} 
                label="Histórico de Exclusões" 
                path="/materiais/excluidos" 
                active={location.pathname === "/materiais/excluidos"} 
                collapsed={collapsed} 
              />
            )}
          </div>
          
          {/* Análises */}
          <div className="pt-2">
            <div 
              className={cn(
                "px-3 py-1 text-xs uppercase font-semibold text-muted-foreground",
                collapsed ? "opacity-0" : "opacity-100"
              )}
            >
              Análises
            </div>
            <SidebarItem 
              icon={PieChart} 
              label="Analytics" 
              path="/analytics" 
              active={location.pathname === "/analytics"} 
              collapsed={collapsed} 
            />
          </div>
          
          {/* Alarmes - Apenas para usuários com permissão */}
          {hasPermission(user, PERMISSIONS.CREATE_ALARMS) && (
            <div className="pt-2">
              <div 
                className={cn(
                  "px-3 py-1 text-xs uppercase font-semibold text-muted-foreground",
                  collapsed ? "opacity-0" : "opacity-100"
                )}
              >
                Notificações
              </div>
              <SidebarItem 
                icon={AlarmClock} 
                label="Alarmes" 
                path="/alarmes" 
                active={location.pathname === "/alarmes"} 
                collapsed={collapsed} 
              />
            </div>
          )}
          
          {/* Administração */}
          {hasPermission(user, PERMISSIONS.VIEW_EDIT_USERS) && (
            <div className="pt-2">
              <div 
                className={cn(
                  "px-3 py-1 text-xs uppercase font-semibold text-muted-foreground",
                  collapsed ? "opacity-0" : "opacity-100"
                )}
              >
                Administração
              </div>
              <SidebarItem 
                icon={Users} 
                label="Usuários" 
                path="/usuarios" 
                active={location.pathname === "/usuarios"} 
                collapsed={collapsed} 
              />
            </div>
          )}
          
          {/* Configurações - Apenas para Develop */}
          {hasPermission(user, PERMISSIONS.ACCESS_SETTINGS) && (
            <div className="pt-2">
              <div 
                className={cn(
                  "px-3 py-1 text-xs uppercase font-semibold text-muted-foreground",
                  collapsed ? "opacity-0" : "opacity-100"
                )}
              >
                Sistema
              </div>
              <SidebarItem 
                icon={Settings} 
                label="Configurações" 
                path="/configuracoes" 
                active={location.pathname === "/configuracoes"} 
                collapsed={collapsed} 
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Rodapé */}
      <div className="p-2 border-t border-border">
        <div className="flex items-center p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 w-full justify-start p-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
                <div 
                  className={cn(
                    "flex flex-col items-start transition-all", 
                    collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                  )}
                >
                  <span className="text-sm font-medium">{user?.name}</span>
                  <span className="text-xs text-muted-foreground">{user?.role}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/perfil">Perfil</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/mudar-senha">Alterar Senha</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex justify-between mt-2">
          <ThemeToggle />
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
