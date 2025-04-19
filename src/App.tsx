
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import LoginPage from "@/pages/LoginPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import ChangePasswordPage from "@/pages/ChangePasswordPage";
import DashboardPage from "@/pages/DashboardPage";
import MaterialListPage from "@/pages/MaterialListPage";
import MaterialNewPage from "@/pages/MaterialNewPage";
import MaterialEditPage from "@/pages/MaterialEditPage";
import MaterialDeletedPage from "@/pages/MaterialDeletedPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import UserListPage from "@/pages/UserListPage";
import AlarmPage from "@/pages/AlarmPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Rotas de autenticação */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/recuperar-senha" element={<ResetPasswordPage />} />
              <Route path="/mudar-senha-inicial" element={<ChangePasswordPage />} />
              <Route path="/mudar-senha" element={<ChangePasswordPage />} />
              
              {/* Rotas protegidas */}
              <Route element={<AppLayout />}>
                <Route path="/" element={<DashboardPage />} />
                
                {/* Rotas de Materiais */}
                <Route path="/materiais" element={<MaterialListPage />} />
                <Route path="/materiais/novo" element={<MaterialNewPage />} />
                <Route path="/materiais/:id" element={<MaterialEditPage />} />
                <Route path="/materiais/excluidos" element={<MaterialDeletedPage />} />
                
                {/* Rotas de Analytics */}
                <Route path="/analytics" element={<AnalyticsPage />} />
                
                {/* Rotas de Usuários */}
                <Route path="/usuarios" element={<UserListPage />} />
                
                {/* Rotas de Alarmes */}
                <Route path="/alarmes" element={<AlarmPage />} />
              </Route>
              
              {/* Rota 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
