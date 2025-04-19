
import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { seedDatabaseIfEmpty } from "@/lib/database";
import { loadSavedSmtpSettings } from "@/lib/smtp";

export function AppLayout() {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  // Inicializar dados de exemplo ao montar o componente
  useEffect(() => {
    if (isAuthenticated) {
      seedDatabaseIfEmpty();
      loadSavedSmtpSettings();
    }
  }, [isAuthenticated]);
  
  // Se estiver carregando, exibir um loading
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }
  
  // Se não estiver autenticado, redirecionar para login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Se for primeiro acesso, forçar a mudança de senha
  if (user?.isFirstAccess) {
    return <Navigate to="/mudar-senha-inicial" />;
  }
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <div className="flex flex-1 items-center justify-end gap-4">
            <ThemeToggle />
          </div>
        </header>
        
        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
        
        {/* Footer */}
        <footer className="flex h-14 items-center border-t px-4 lg:px-6 text-xs text-muted-foreground">
          <div className="text-center w-full">
            LamiSys &copy; {new Date().getFullYear()} - Sistema de Gestão de Materiais
          </div>
        </footer>
      </div>
    </div>
  );
}
