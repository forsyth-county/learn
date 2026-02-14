import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg hover:shadow-cyan-500/20 hover:from-cyan-500 hover:to-blue-500 active:scale-[0.98]",
        destructive:
          "bg-rose-600/90 text-white hover:bg-rose-600 shadow-lg hover:shadow-rose-500/20",
        outline:
          "border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl hover:bg-white/[0.06] hover:border-white/[0.12] text-white/80 hover:text-white",
        secondary:
          "bg-white/[0.06] text-white/80 backdrop-blur-xl hover:bg-white/[0.1] hover:text-white",
        ghost: "hover:bg-white/[0.06] text-white/60 hover:text-white",
        link: "text-cyan-400 underline-offset-4 hover:underline hover:text-cyan-300",
        glow: "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 hover:from-cyan-500 hover:to-blue-500 ring-1 ring-cyan-400/20",
        success: "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg hover:shadow-emerald-500/20",
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
