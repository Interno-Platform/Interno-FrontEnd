const Select = ({ label, error, children, ...props }) => (
  <label className="block space-y-1">
    {label && (
      <span className="text-sm font-semibold text-foreground">{label}</span>
    )}
    <select className="field-input" {...props}>
      {children}
    </select>
    {error && <span className="text-xs text-rose-500">{error}</span>}
  </label>
);

export default Select;
