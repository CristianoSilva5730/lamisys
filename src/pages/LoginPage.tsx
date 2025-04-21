
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LoginForm } from "@/components/auth/LoginForm";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Logo } from "@/components/layout/Logo";

export default function LoginPage() {
  const { isAuthenticated, user } = useAuth();
  
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
        <div className="w-full max-w-md">
          <LoginForm />
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
