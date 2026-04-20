const SkillBadge = ({ skill, onRemove }) => (
  <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700 dark:bg-blue-500/15 dark:text-blue-200">
    {skill}
    {onRemove ? (
      <button
        type="button"
        onClick={() => onRemove(skill)}
        className="font-bold leading-none"
      >
        x
      </button>
    ) : null}
  </span>
);

export default SkillBadge;
