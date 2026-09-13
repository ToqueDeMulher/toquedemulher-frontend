"use client";

import { useTheme } from "@/app/providers/theme/theme-context";
import { Toaster as Sonner, ToasterProps } from "sonner";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--theme-card-bg)",
          "--normal-text": "var(--theme-text-primary)",
          "--normal-border": "var(--theme-border-soft)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-xl rounded-xl p-4 flex gap-3 items-start backdrop-blur-xl bg-opacity-95 dark:bg-opacity-90 border",
          description: "group-[.toast]:text-muted-foreground text-sm",
          title: "text-[14px] font-semibold tracking-tight",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-semibold rounded-md",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground font-medium rounded-md",
          success:
            "group-[.toaster]:bg-emerald-500/10 group-[.toaster]:text-emerald-700 group-[.toaster]:border-emerald-500/30 dark:group-[.toaster]:bg-emerald-500/15 dark:group-[.toaster]:text-emerald-400",
          error:
            "group-[.toaster]:bg-rose-500/10 group-[.toaster]:text-rose-700 group-[.toaster]:border-rose-500/30 dark:group-[.toaster]:bg-rose-500/15 dark:group-[.toaster]:text-rose-400",
          info: "group-[.toaster]:bg-blue-500/10 group-[.toaster]:text-blue-700 group-[.toaster]:border-blue-500/30 dark:group-[.toaster]:bg-blue-500/15 dark:group-[.toaster]:text-blue-400",
          warning:
            "group-[.toaster]:bg-amber-500/10 group-[.toaster]:text-amber-700 group-[.toaster]:border-amber-500/30 dark:group-[.toaster]:bg-amber-500/15 dark:group-[.toaster]:text-amber-400",
        },
      }}
      icons={{
        success: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />,
        error: <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />,
        info: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />,
        warning: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />,
      }}
      {...props}
    />
  );
};

export { Toaster };
