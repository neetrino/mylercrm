const ROWS = [0, 1, 2] as const;

export function UsersLoading() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="h-10 border-b border-gray-200 bg-gray-50/60" />
      {ROWS.map((row) => (
        <div key={row} className="h-14 border-b border-gray-100 last:border-0" />
      ))}
    </div>
  );
}
