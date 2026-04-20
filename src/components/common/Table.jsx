const Table = ({ columns = [], rows = [], renderRow }) => (
  <div className="overflow-x-auto rounded-2xl border border-border/80 bg-card shadow-md">
    <table className="data-table w-full min-w-[760px] text-left">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col}>{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>{rows.map(renderRow)}</tbody>
    </table>
  </div>
);

export default Table;
