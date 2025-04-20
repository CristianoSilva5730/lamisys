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
      
      const userData = await authAPI.login(email, password);
      
      if (!userData || !userData.id) {
        throw new Error("Dados de usuário inválidos");
      }
      
      const authenticatedUser = {
        ...userData,
        isFirstAccess: userData.isFirstAccess === 1
      };
      
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
      
      // Usar toast para mensagens de erro
      toast({
        title: "Erro de Login",
        description: error.response?.data?.error || "Erro ao fazer login",
        variant: "destructive"
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("lamisys-user");
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    
    try {
      // Usar a API para resetar a senha
      await authAPI.resetPassword(email);
      
      toast({
        title: "Senha redefinida",
        description: "Uma nova senha foi enviada para o seu email.",
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);
      setIsLoading(false);
      throw error;
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
      
      setIsLoading(false);
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      setIsLoading(false);
      throw error;
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
