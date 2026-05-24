import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-sm font-semibold tracking-normal transition-[background-color,border-color,color,box-shadow,transform,opacity,filter] duration-300 ease-out hover:-translate-y-1 hover:scale-[1.025] hover:shadow-lg active:translate-y-0 active:scale-[0.98] active:shadow-sm disabled:pointer-events-none disabled:opacity-50 disabled:transform-none disabled:shadow-none [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground border border-primary hover:bg-primary/90",
        destructive:
          "bg-destructive text-white border border-destructive hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border border-primary/30 bg-card text-primary hover:bg-primary/5 hover:border-primary/45",
        secondary:
          "bg-secondary text-secondary-foreground border border-transparent hover:bg-secondary/80",
        ghost:
          "text-primary hover:bg-primary/10",
        link: "text-primary underline-offset-4 hover:underline",
        gradient: 
          "bg-primary text-primary-foreground border border-primary hover:bg-primary/90",
      },
      size: {
        default: "h-11 px-6 py-2 has-[>svg]:px-4",
        sm: "h-9 px-4 text-xs has-[>svg]:px-3",
        lg: "h-12 px-8 text-base has-[>svg]:px-6",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
