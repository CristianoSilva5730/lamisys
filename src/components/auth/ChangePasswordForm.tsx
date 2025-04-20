
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";

export function ChangePasswordForm({ isFirstAccess = false }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { changePassword, user, logout } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar nova senha
    if (newPassword.length < 6) {
      setError("A nova senha deve ter pelo menos 6 caracteres");
      return;
    }
    
    // Verificar se as senhas coincidem
    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }
    
    setError("");
    setSuccess(false);
    setIsLoading(true);
    
    try {
      console.log("Tentando alterar senha para o usuário:", user?.id);
      await changePassword(oldPassword, newPassword);
      setSuccess(true);
      
      toast({
        title: "Senha alterada com sucesso",
        description: "Sua nova senha foi salva. Você será redirecionado para o login.",
      });
      
      // Redirecionar após 2 segundos se a alteração for bem-sucedida
      setTimeout(() => {
        if (isFirstAccess) {
          // Se for primeiro acesso, fazer logout para forçar novo login com a nova senha
          logout();
          navigate("/login");
        } else {
          navigate("/");
        }
      }, 2000);
    } catch (err) {
      console.error("Erro ao alterar senha:", err);
      setError(err instanceof Error ? err.message : "Erro ao alterar senha. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-lamisys-primary dark:text-blue-400">
          {isFirstAccess ? "Alterar Senha Temporária" : "Alterar Senha"}
        </CardTitle>
        <CardDescription className="text-center">
          {isFirstAccess
            ? "É necessário alterar sua senha temporária para continuar"
            : "Altere sua senha para manter sua conta segura"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mb-4 bg-green-50 border-green-600 text-green-800 dark:bg-green-900/50 dark:border-green-500 dark:text-green-300">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Senha alterada!</AlertTitle>
            <AlertDescription>
              Sua senha foi alterada com sucesso.
              Redirecionando...
            </AlertDescription>
          </Alert>
        )}
        
        {isFirstAccess && (
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Esta é uma senha temporária. Por motivos de segurança, você precisa criar uma nova senha.
            </AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="oldPassword">
              {isFirstAccess ? "Senha Temporária" : "Senha Atual"}
            </Label>
            <Input
              id="oldPassword"
              type="password"
              placeholder="••••••••"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              disabled={isLoading || success}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova Senha</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={isLoading || success}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading || success}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || success}
          >
            {isLoading ? "Alterando..." : "Alterar Senha"}
          </Button>
        </form>
      </CardContent>
      {!isFirstAccess && (
        <CardFooter className="flex flex-col">
          <Button
            variant="link"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/")}
            disabled={isLoading || success}
          >
            Voltar
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
