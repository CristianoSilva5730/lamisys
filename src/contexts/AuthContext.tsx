
import { createContext, useContext, useEffect, useState } from "react";
import { User, UserRole } from "@/lib/types";
import { getUserByEmail, seedDatabaseIfEmpty, getAllUsers, updateUser as updateUserInDb } from "@/lib/database";

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

  // Inicializar o banco de dados local se estiver vazio
  useEffect(() => {
    seedDatabaseIfEmpty();
    console.log("Banco de dados inicializado");
    console.log("Usuários cadastrados:", getAllUsers());
  }, []);

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
    
    // Simular uma chamada de API
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Encontrar usuário pelo email usando o banco de dados local
    const foundUser = getUserByEmail(email);
    console.log("Tentando login para:", email);
    console.log("Usuário encontrado:", foundUser);
    
    if (!foundUser) {
      setIsLoading(false);
      throw new Error("Usuário ou senha incorretos");
    }

    // Simular verificação de senha (em um app real, usaria bcrypt ou similar)
    if (password !== "senha123" && password !== `${foundUser.name}${foundUser.matricula}`) {
      setIsLoading(false);
      throw new Error("Usuário ou senha incorretos");
    }

    // Verificar se é primeiro acesso
    const isFirstAccess = password === `${foundUser.name}${foundUser.matricula}`;

    const authenticatedUser = {
      ...foundUser,
      isFirstAccess,
    };

    setUser(authenticatedUser);
    localStorage.setItem("lamisys-user", JSON.stringify(authenticatedUser));
    
    // Se não for primeiro acesso, atualizar esse status no banco de dados
    if (!isFirstAccess && foundUser.isFirstAccess) {
      updateUserInDb(foundUser.id, { ...foundUser, isFirstAccess: false });
    }
    
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("lamisys-user");
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    
    // Simular uma chamada de API
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Verificar se o email existe usando o banco de dados local
    const foundUser = getUserByEmail(email);
    
    if (!foundUser) {
      setIsLoading(false);
      throw new Error("Email não encontrado");
    }

    // Em um app real, enviaria um email com senha temporária
    console.log(`Senha temporária enviada para ${email}: ${foundUser.name}${foundUser.matricula}`);
    
    // Marcar como primeiro acesso novamente
    updateUserInDb(foundUser.id, { ...foundUser, isFirstAccess: true });
    
    setIsLoading(false);
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    setIsLoading(true);
    
    // Simular uma chamada de API
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (!user) {
      setIsLoading(false);
      throw new Error("Usuário não autenticado");
    }

    // Em um app real, verificaria a senha antiga no backend
    if (oldPassword !== "senha123" && oldPassword !== `${user.name}${user.matricula}`) {
      setIsLoading(false);
      throw new Error("Senha atual incorreta");
    }

    // Em um app real, atualizaria a senha no backend
    console.log(`Senha atualizada para usuário ${user.email}`);

    // Atualizar estado do usuário
    const updatedUser = { ...user, isFirstAccess: false };
    setUser(updatedUser);
    localStorage.setItem("lamisys-user", JSON.stringify(updatedUser));
    
    // Atualizar usuário no banco de dados local
    updateUserInDb(user.id, updatedUser);
    
    setIsLoading(false);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("lamisys-user", JSON.stringify(updatedUser));
      
      // Atualizar usuário no banco de dados local
      updateUserInDb(user.id, updatedUser);
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
