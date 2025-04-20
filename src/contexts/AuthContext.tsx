import { createContext, useContext, useEffect, useState } from "react";
import { User, UserRole } from "@/lib/types";
import { authAPI } from "@/services/api";
import { toast } from "@/components/ui/use-toast";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Carregar usuário do localStorage ao iniciar
  useEffect(() => {
    const loadUser = () => {
      const storedUser = localStorage.getItem("lamisys-user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      console.log("Tentando login com:", email, "e senha:", password);
      
      // Fazer login usando a API
      const userData = await authAPI.login(email, password);
      
      console.log("Usuário autenticado:", userData);
      
      // Converter isFirstAccess de número para booleano
      const authenticatedUser = {
        ...userData,
        isFirstAccess: Boolean(userData.isFirstAccess)
      };
      
      setUser(authenticatedUser);
      localStorage.setItem("lamisys-user", JSON.stringify(authenticatedUser));
      
      setIsLoading(false);
    } catch (error) {
      console.error("Erro no login:", error);
      setIsLoading(false);
      throw error;
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
      // Usar a API para mudar a senha
      await authAPI.changePassword(user.id, oldPassword, newPassword);
      
      // Atualizar estado do usuário
      const updatedUser = { ...user, isFirstAccess: false };
      setUser(updatedUser);
      localStorage.setItem("lamisys-user", JSON.stringify(updatedUser));
      
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
