
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LoginForm } from "@/components/auth/LoginForm";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Logo } from "@/components/layout/Logo";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from "react";
import api from "@/services/api";

export default function LoginPage() {
  const { isAuthenticated, user } = useAuth();
  const [serverStatus, setServerStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  
  // Verificar status do servidor ao carregar a página
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        await api.get('/api/status');
        setServerStatus('online');
      } catch (error) {
        console.error("Erro ao verificar status do servidor:", error);
        setServerStatus('offline');
      }
    };
    
    checkServerStatus();
  }, []);
  
  // Redirect to password change if first access
  if (isAuthenticated && user?.isFirstAccess) {
    return <Navigate to="/mudar-senha" />;
  }
  
  // Redirect to home page if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
        <div className="flex-1">
          <Logo />
        </div>
        <ThemeToggle />
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-muted/30">
        {serverStatus === 'offline' && (
          <Alert variant="destructive" className="mb-4 max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              O servidor parece estar offline. Verifique se o servidor da aplicação está rodando.
            </AlertDescription>
          </Alert>
        )}
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </main>
      <footer className="flex h-14 items-center border-t px-4 lg:px-6 text-xs text-muted-foreground">
        <div className="flex flex-1 items-center justify-center md:justify-end gap-4">
          <span>LamiSys &copy; {new Date().getFullYear()}</span>
          <span>Servidor: {serverStatus === 'online' ? 'Online' : serverStatus === 'offline' ? 'Offline' : 'Verificando...'}</span>
        </div>
      </footer>
    </div>
  );
}
