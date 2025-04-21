
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Info, Server } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      // Validação básica
      if (!email || !password) {
        setError("Por favor, preencha todos os campos");
        return;
      }
      
      console.log("Tentando login com:", email, "senha:", "*".repeat(password.length));
      await login(email, password);
      console.log("Login bem-sucedido");
    } catch (err: any) {
      console.error("Erro no login:", err);
      
      let errorMessage = "Erro ao fazer login. Tente novamente.";
      
      if (err.message && err.message.includes("network")) {
        errorMessage = "Erro de conexão com o servidor. Verifique se o servidor está rodando executando 'npm run dev:server' no terminal.";
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Erro de Login",
        description: errorMessage,
      });
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-lamisys-primary dark:text-blue-400">
          LamiSys
        </CardTitle>
        <CardDescription className="text-center">
          Entre com suas credenciais para acessar o sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu.email@sinobras.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <Alert className="mt-2 bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300">
            <Info className="h-4 w-4" />
            <AlertDescription className="space-y-2">
              <p>Para primeiro acesso, use a senha: [seu nome][sua matrícula]</p>
              <p>Ex: <strong>Admin000001</strong></p>
              <p className="text-xs mt-1">Nota: O servidor precisa estar online para fazer login.</p>
            </AlertDescription>
          </Alert>
          <Alert className="mt-2 bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-300">
            <Server className="h-4 w-4" />
            <AlertTitle>Servidor do Backend</AlertTitle>
            <AlertDescription className="space-y-2 mt-2">
              <p>Para iniciar o servidor do backend:</p>
              <code className="block bg-muted p-2 rounded text-xs">npm run dev:server</code>
            </AlertDescription>
          </Alert>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col">
        <Button
          variant="link"
          className="text-xs text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/recuperar-senha")}
          disabled={isLoading}
        >
          Esqueceu sua senha?
        </Button>
      </CardFooter>
    </Card>
  );
}
