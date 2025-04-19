
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PrintButtonProps {
  className?: string;
}

export function PrintButton({ className }: PrintButtonProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      onClick={handlePrint}
    >
      <Printer className="h-4 w-4 mr-2" />
      Imprimir
    </Button>
  );
}
