
import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export default function ChangePasswordPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  // Verificar se o usuário está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Efeito para lidar com mudança forçada de senha
  useEffect(() => {
    // Se não for primeiro acesso e o URL for /mudar-senha-inicial, redirecionar para home
    if (!user?.isFirstAccess && window.location.pathname === "/mudar-senha-inicial") {
      navigate("/");
    }
  }, [user, navigate]);
  
  // Verificar se é mudança inicial de senha (forçada)
  const isFirstAccess = user?.isFirstAccess || window.location.pathname === "/mudar-senha-inicial";
  
  return (
    <div className="flex min-h-screen flex-col">
      {!isFirstAccess && (
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <div className="flex flex-1 items-center justify-end">
            <ThemeToggle />
          </div>
        </header>
      )}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-muted/30">
        <div className="w-full max-w-md">
          <ChangePasswordForm isFirstAccess={isFirstAccess} />
        </div>
      </main>
      {!isFirstAccess && (
        <footer className="flex h-14 items-center border-t px-4 lg:px-6 text-xs text-muted-foreground">
          <div className="flex flex-1 items-center justify-center md:justify-end gap-4">
            <span>LamiSys &copy; {new Date().getFullYear()}</span>
          </div>
        </footer>
      )}
    </div>
  );
}
