const Card = ({ children, className = "", ...props }) => (
  <div
    className={`rounded-2xl border border-border/80 bg-card p-6 text-foreground shadow-md transition-all duration-200 ${className}`}
    {...props}
  >
    {children}
  </div>
);

export default Card;
