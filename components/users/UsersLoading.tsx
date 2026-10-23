const SKELETON_ROWS = [0, 1, 2] as const;

export function UsersLoading() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {SKELETON_ROWS.map((row) => (
          <div key={row} className="h-[72px] animate-pulse rounded-2xl border border-gray-200/80 bg-white" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-2xl border border-gray-200/80 bg-white" />
    </div>
  );
}
