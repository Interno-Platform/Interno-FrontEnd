import { cn } from "@/utils/helpers";

const Button = ({
  children,
  className = "",
  variant = "primary",
  ...props
}) => {
  const styles = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
    ghost: "border border-border bg-card text-foreground hover:bg-muted/60",
    danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
  };

  return (
    <button
      className={cn(
        "rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-50",
        styles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
