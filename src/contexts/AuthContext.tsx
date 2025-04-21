
import { createContext, useContext, useEffect, useState } from "react";
import { User, UserRole } from "@/lib/types";
import { authAPI } from "@/services/api";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Carregar usuário do localStorage ao iniciar
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem("lamisys-user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }
      } catch (e) {
        console.error("Erro ao carregar dados do usuário:", e);
        localStorage.removeItem("lamisys-user");
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    setIsLoading(true);
    
    try {
      console.log("Tentando login com:", email);
      
      // Tentar fazer login com a API
      const userData = await authAPI.login(email, password);
      
      if (!userData || !userData.id) {
        throw new Error("Dados de usuário inválidos");
      }
      
      const authenticatedUser = {
        ...userData,
        isFirstAccess: userData.isFirstAccess === 1
      };
      
      console.log("Usuário autenticado:", authenticatedUser);
      
      setUser(authenticatedUser);
      localStorage.setItem("lamisys-user", JSON.stringify(authenticatedUser));
      
      // Redirecionar baseado no primeiro acesso
      if (authenticatedUser.isFirstAccess) {
        navigate("/mudar-senha");
      } else {
        navigate("/");
      }
      
      return authenticatedUser;
    } catch (error: any) {
      console.error("Erro no login:", error);
      
      // Tratar erro de conexão com o servidor
      if (error.message === "Network Error" || !error.response) {
        throw new Error("Erro de conexão com o servidor. Verifique se o servidor está rodando.");
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("lamisys-user");
    navigate("/login");
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    
    try {
      console.log("Tentando redefinir senha para:", email);
      // Usar a API para resetar a senha
      await authAPI.resetPassword(email);
      
      console.log("Senha redefinida com sucesso");
      
      toast({
        title: "Senha redefinida",
        description: "Uma nova senha foi enviada para o seu email.",
      });
    } catch (error: any) {
      console.error("Erro ao redefinir senha:", error);
      
      // Tratar erro de conexão com o servidor
      if (error.message === "Network Error" || !error.response) {
        throw new Error("Erro de conexão com o servidor. Verifique se o servidor está rodando.");
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    setIsLoading(true);
    
    if (!user) {
      setIsLoading(false);
      throw new Error("Usuário não autenticado");
    }
    
    try {
      console.log("Alterando senha para usuário:", user.id);
      // Usar a API para mudar a senha
      await authAPI.changePassword(user.id, oldPassword, newPassword);
      
      // Atualizar estado do usuário
      const updatedUser = { ...user, isFirstAccess: false };
      setUser(updatedUser);
      localStorage.setItem("lamisys-user", JSON.stringify(updatedUser));
      
      console.log("Senha alterada com sucesso para usuário:", user.id);
      console.log("Estado do usuário após alteração:", updatedUser);
      
      toast({
        title: "Senha alterada",
        description: "Sua senha foi alterada com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao alterar senha:", error);
      
      // Tratar erro de conexão com o servidor
      if (error.message === "Network Error" || !error.response) {
        throw new Error("Erro de conexão com o servidor. Verifique se o servidor está rodando.");
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("lamisys-user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        isLoading, 
        login, 
        logout, 
        resetPassword, 
        changePassword,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
