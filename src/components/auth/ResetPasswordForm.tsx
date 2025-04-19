
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, AlertTriangle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsLoading(true);
    
    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao recuperar senha. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-lamisys-primary dark:text-blue-400">
          Recuperar Senha
        </CardTitle>
        <CardDescription className="text-center">
          Digite seu e-mail para receber uma senha temporária
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
            <AlertTitle>Senha enviada!</AlertTitle>
            <AlertDescription>
              Uma senha temporária foi enviada para seu email. 
              Por favor, verifique sua caixa de entrada.
            </AlertDescription>
          </Alert>
        )}
        
        <Alert className="mb-4 bg-amber-50 border-amber-600 text-amber-800 dark:bg-amber-900/50 dark:border-amber-500 dark:text-amber-300">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Você receberá uma senha temporária que deverá ser alterada no primeiro acesso.
          </AlertDescription>
        </Alert>
        
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
              disabled={isLoading || success}
            />
          </div>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || success}
          >
            {isLoading ? "Enviando..." : "Recuperar Senha"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col">
        <Button
          variant="link"
          className="text-xs text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/login")}
          disabled={isLoading}
        >
          Voltar para o login
        </Button>
      </CardFooter>
    </Card>
  );
}
