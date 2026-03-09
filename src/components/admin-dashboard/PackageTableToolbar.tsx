import { useCallback } from "react";

type Filters = {
  search: string;
};

type PackagesTableToolbarProps = {
  filters: Filters;
  onFilters: (key: keyof Filters, value: string) => void;
};

export default function PackagesTableToolbar({
  filters,
  onFilters,
}: PackagesTableToolbarProps) {
  const handleFilterName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilters("search", event.target.value);
    },
    [onFilters]
  );

  return (
    <div className="flex flex-col md:flex-row md:items-center items-end p-2.5 pr-2.5 md:pr-1 space-y-2 md:space-y-0 md:space-x-2">
      <div className="flex flex-row items-center space-x-2 flex-grow w-full">
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            🔍
          </span>
          <input
            type="text"
            value={filters.search}
            onChange={handleFilterName}
            placeholder="Search..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}
