
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LoginForm } from "@/components/auth/LoginForm";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Logo } from "@/components/layout/Logo";
import { AlertTriangle, Server, ServerOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState, useEffect } from "react";
import api from "@/services/api";
import { Button } from "@/components/ui/button";

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
          <Alert variant="destructive" className="mb-6 max-w-md">
            <ServerOff className="h-4 w-4" />
            <AlertTitle>Servidor Offline</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-2">O servidor parece estar offline. Para iniciar o servidor:</p>
              <ol className="list-decimal pl-5 space-y-1 mb-3">
                <li>Abra um terminal ou prompt de comando</li>
                <li>Navegue até a pasta raiz do projeto</li>
                <li>Execute o comando: <code className="bg-muted px-1 py-0.5 rounded">npm run dev:server</code></li>
              </ol>
              <p className="text-xs text-muted-foreground mt-2">Se o problema persistir, verifique os logs do servidor para mais detalhes.</p>
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
          <span className="flex items-center gap-1">
            {serverStatus === 'online' ? (
              <>
                <Server className="h-3 w-3 text-green-500" />
                <span className="text-green-600 dark:text-green-400">Servidor: Online</span>
              </>
            ) : serverStatus === 'offline' ? (
              <>
                <ServerOff className="h-3 w-3 text-red-500" />
                <span className="text-red-600 dark:text-red-400">Servidor: Offline</span>
              </>
            ) : (
              <span>Verificando servidor...</span>
            )}
          </span>
        </div>
      </footer>
    </div>
  );
}
