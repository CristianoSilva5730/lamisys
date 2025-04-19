
import { createContext, useContext, useEffect, useState } from "react";
import { User, UserRole } from "@/lib/types";

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

// Mock users para demonstração
const DEMO_USERS: User[] = [
  {
    id: "1",
    name: "Admin",
    email: "admin@sinobras.com.br",
    matricula: "000001",
    role: UserRole.ADMIN,
    avatar: "",
  },
  {
    id: "2",
    name: "Desenvolvedor",
    email: "dev@sinobras.com.br",
    matricula: "000002",
    role: UserRole.DEVELOP,
    avatar: "",
  },
  {
    id: "3",
    name: "Planejador",
    email: "planejador@sinobras.com.br",
    matricula: "000003",
    role: UserRole.PLANEJADOR,
    avatar: "",
  },
  {
    id: "4",
    name: "Usuário",
    email: "usuario@sinobras.com.br",
    matricula: "000004",
    role: UserRole.USUARIO,
    avatar: "",
  },
];

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
    
    // Simular uma chamada de API
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Encontrar usuário pelo email (mock)
    const foundUser = DEMO_USERS.find(u => u.email === email);
    
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

    // Verificar se o email existe (mock)
    const foundUser = DEMO_USERS.find(u => u.email === email);
    
    if (!foundUser) {
      setIsLoading(false);
      throw new Error("Email não encontrado");
    }

    // Em um app real, enviaria um email com senha temporária
    console.log(`Senha temporária enviada para ${email}: ${foundUser.name}${foundUser.matricula}`);
    
    setIsLoading(false);
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    setIsLoading(true);
    
    // Simular uma chamada de API
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Em um app real, verificaria a senha antiga no backend
    if (oldPassword !== "senha123" && user && oldPassword !== `${user.name}${user.matricula}`) {
      setIsLoading(false);
      throw new Error("Senha atual incorreta");
    }

    // Em um app real, atualizaria a senha no backend
    console.log(`Senha atualizada para usuário ${user?.email}`);

    // Atualizar estado do usuário
    if (user) {
      const updatedUser = { ...user, isFirstAccess: false };
      setUser(updatedUser);
      localStorage.setItem("lamisys-user", JSON.stringify(updatedUser));
    }
    
    setIsLoading(false);
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
