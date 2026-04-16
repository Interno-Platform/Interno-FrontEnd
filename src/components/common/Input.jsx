const Input = ({ label, error, ...props }) => (
  <label className="block space-y-1">
    {label && (
      <span className="text-sm font-semibold text-foreground">{label}</span>
    )}
    <input className="field-input" {...props} />
    {error && <span className="text-xs text-rose-500">{error}</span>}
  </label>
);

export default Input;
