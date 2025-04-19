import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { seedDatabaseIfEmpty } from "@/lib/database";
import { loadSavedSmtpSettings } from "@/lib/smtp";

export function AppLayout() {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  useEffect(() => {
    if (isAuthenticated) {
      seedDatabaseIfEmpty();
      loadSavedSmtpSettings();
    }
  }, [isAuthenticated]);
  
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
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (user?.isFirstAccess) {
    return <Navigate to="/mudar-senha-inicial" />;
  }
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <div className="flex flex-1 items-center justify-end gap-4">
            <ThemeToggle />
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
        
        <footer className="flex h-14 items-center border-t px-4 lg:px-6 text-xs text-muted-foreground">
          <div className="text-center w-full">
            <p>
              Desenvolvido por Cristiano Vieira Silva - Exclusivamente para SINOBRAS
            </p>
            <p>
              © {new Date().getFullYear()} Todos os direitos reservados
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
