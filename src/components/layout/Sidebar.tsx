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
  LogOut,
  ChevronDown,
  Logo
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { hasPermission, PERMISSIONS } from "@/lib/utils/permissions";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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
  const [materialsExpanded, setMaterialsExpanded] = useState(true);
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name.split(" ")
      .map(part => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };
  
  const canCreateAlarms = hasPermission(user, PERMISSIONS.CREATE_ALARMS);
  const canManageUsers = hasPermission(user, PERMISSIONS.VIEW_EDIT_USERS);
  const canAccessSettings = hasPermission(user, PERMISSIONS.ACCESS_SETTINGS);
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };
  
  const isMaterialsActive = () => {
    return [
      "/materiais",
      "/analytics",
      "/alarmes"
    ].some(path => location.pathname.startsWith(path));
  };
  
  return (
    <div
      className={cn(
        "flex flex-col h-screen border-r border-border bg-sidebar transition-all duration-300 relative",
        collapsed ? "w-[70px]" : "w-[240px]"
      )}
    >
      <div className="flex items-center p-4">
        <Logo className={cn(collapsed && "w-8")} showText={!collapsed} />
      </div>
      
      <Separator />
      
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Dashboard" 
            path="/" 
            active={location.pathname === "/"} 
            collapsed={collapsed} 
          />
          
          <div className="pt-2">
            <Collapsible 
              open={materialsExpanded} 
              onOpenChange={setMaterialsExpanded} 
              className={cn(!collapsed && "border rounded-md")}
            >
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "flex items-center justify-between w-full py-3 px-3 rounded-lg",
                    isMaterialsActive() && "bg-accent text-accent-foreground",
                    collapsed && "justify-center"
                  )}
                >
                  <div className="flex items-center">
                    <Package className={cn("h-5 w-5", collapsed ? "" : "mr-2")} />
                    <span className={cn(
                      "font-medium",
                      collapsed ? "hidden" : "block"
                    )}>
                      Materiais
                    </span>
                  </div>
                  {!collapsed && (
                    <ChevronDown 
                      className={cn(
                        "h-4 w-4 transition-transform", 
                        materialsExpanded ? "transform rotate-180" : ""
                      )} 
                    />
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className={collapsed ? "hidden" : "px-2 py-1"}>
                <div className="space-y-1 pt-1">
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
                  
                  <SidebarItem 
                    icon={PieChart} 
                    label="Analytics" 
                    path="/analytics" 
                    active={location.pathname === "/analytics"} 
                    collapsed={collapsed} 
                  />
                  
                  {canCreateAlarms && (
                    <SidebarItem 
                      icon={AlarmClock} 
                      label="Alarmes" 
                      path="/alarmes" 
                      active={location.pathname === "/alarmes"} 
                      collapsed={collapsed} 
                    />
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
          
          {canManageUsers && (
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
          
          {canAccessSettings && (
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
