import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-teal-600 text-white hover:bg-teal-500 active:bg-teal-700 shadow-sm",
        destructive:
          "bg-red-600/90 text-white hover:bg-red-500 shadow-sm",
        outline:
          "border border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 hover:border-zinc-600 text-zinc-300 hover:text-white",
        secondary:
          "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white",
        ghost: "hover:bg-zinc-800 text-zinc-400 hover:text-white",
        link: "text-teal-400 underline-offset-4 hover:underline hover:text-teal-300",
        glow: "bg-teal-600 text-white hover:bg-teal-500 shadow-lg shadow-teal-600/20 hover:shadow-teal-500/30 ring-1 ring-teal-500/30",
        success: "bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-9 w-9 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
