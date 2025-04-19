
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full"
        >
          {theme === "light" ? (
            <Sun className="h-5 w-5 text-orange-500" />
          ) : (
            <Moon className="h-5 w-5 text-blue-400" />
          )}
          <span className="sr-only">
            {theme === "light" ? "Mudar para modo escuro" : "Mudar para modo claro"}
          </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{theme === "light" ? "Mudar para modo escuro" : "Mudar para modo claro"}</p>
      </TooltipContent>
    </Tooltip>
  );
}
