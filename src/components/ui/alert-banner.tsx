"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, X, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";

const alertBannerVariants = cva(
  "group relative flex w-full items-start gap-4 overflow-hidden rounded-lg border p-4 shadow-md",
  {
    variants: {
      variant: {
        default: "border-white/10 bg-zinc-950/92 text-white",
        success: "border-emerald-300/30 bg-zinc-950/95 text-white shadow-emerald-950/30",
        destructive: "border-red-300/30 bg-zinc-950/95 text-white shadow-red-950/30",
        warning: "border-yellow-300/30 bg-zinc-950/95 text-white shadow-yellow-950/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const iconVariants = cva("mt-0.5 size-6 flex-shrink-0", {
  variants: {
    variant: {
      default: "text-white",
      success: "text-emerald-300",
      destructive: "text-red-300",
      warning: "text-yellow-300",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface AlertBannerProps extends VariantProps<typeof alertBannerVariants> {
  className?: string;
  title: string;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  onDismiss: () => void;
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

const AlertBanner = React.forwardRef<HTMLDivElement, AlertBannerProps>(
  (
    { className, variant, title, description, icon, onDismiss, secondaryAction },
    ref,
  ) => {
    const DefaultIcon = {
      success: <CheckCircle2 />,
      destructive: <XCircle />,
      warning: <AlertCircle />,
      default: <CheckCircle2 />,
    }[variant || "default"];

    return (
      <motion.div
        ref={ref}
        role="alert"
        aria-live="assertive"
        className={cn(alertBannerVariants({ variant }), className)}
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <button
          onClick={onDismiss}
          aria-label="Chiudi notifica"
          className="absolute right-3 top-3 rounded-md p-1 text-zinc-400 opacity-70 transition hover:bg-white/10 hover:text-white hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/30"
        >
          <X className="size-4" />
        </button>

        <div className={cn(iconVariants({ variant }))}>{icon || DefaultIcon}</div>

        <div className="flex flex-1 flex-col pr-6">
          <h3 className="font-semibold text-white">{title}</h3>
          {description && (
            <div className="mt-1 text-sm leading-5 text-zinc-400">{description}</div>
          )}

          {secondaryAction && (
            <div className="mt-3">
              <button
                onClick={secondaryAction.onClick}
                className="text-sm font-medium text-zinc-400 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                {secondaryAction.label}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    );
  },
);
AlertBanner.displayName = "AlertBanner";

export { AlertBanner };
