
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative w-10 h-10">
        <img
          src="/lovable-uploads/fe57adb2-f070-4561-a49a-0da90133fca4.png"
          alt="LamiSys Logo"
          className="block dark:hidden"
        />
        <img
          src="/lovable-uploads/742caa11-4bcb-4f9d-b146-3629768331bb.png"
          alt="LamiSys Logo"
          className="hidden dark:block"
        />
      </div>
      {showText && (
        <span className="font-semibold text-xl text-lamisys-primary dark:text-white">
          LamiSys
        </span>
      )}
    </div>
  );
}
