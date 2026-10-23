type UsersToolbarProps = {
  onAdd: () => void;
};

export function UsersToolbar({ onAdd }: UsersToolbarProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-[22px] font-semibold leading-7 text-gray-950">Users</h1>
        <p className="mt-1 text-[13px] leading-5 text-gray-500">
          Accounts for the web CRM and the 3D viewer.
        </p>
      </div>
      <button type="button" onClick={onAdd} className="btn-primary h-9 rounded-lg px-3.5 text-[13px]">
        Add user
      </button>
    </div>
  );
}
