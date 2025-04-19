
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export default function ResetPasswordPage() {
  const { isAuthenticated } = useAuth();
  
  // Redirecionar para a página inicial se já estiver autenticado
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
        <div className="flex flex-1 items-center justify-end">
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-muted/30">
        <div className="w-full max-w-md">
          <ResetPasswordForm />
        </div>
      </main>
      <footer className="flex h-14 items-center border-t px-4 lg:px-6 text-xs text-muted-foreground">
        <div className="flex flex-1 items-center justify-center md:justify-end gap-4">
          <span>LamiSys &copy; {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}
