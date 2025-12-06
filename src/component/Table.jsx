import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getFacetedUniqueValues,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";

export const Table = ({ data }) => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState([]);
  const [sorting, setSorting] = useState([]);

  // Dynamically generate columns from the first data item
  const columns = useMemo(() => {
    if (!data || data.length === 0) return [];
    // Exclude sensitive/undesired columns like `rut` and `dv` (case-insensitive)
    return Object.keys(data[0])
      .filter((key) => {
        const k = (key || "").toString().toLowerCase();
        return k !== "rut" && k !== "dv"; // exclude these columns
      })
      .map((key) => ({
        header: key,
        accessorKey: key,
        enableSorting:
          (key || "").toString().toLowerCase() === "fecha" ||
          (key || "").toString().toLowerCase() === "nombre",
      }));
  }, [data]);

  // Allowed keys for global search (exclude rut and dv)
  const allowedKeys = useMemo(() => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]).filter((k) => {
      const kk = (k || "").toString().toLowerCase();
      return kk !== "rut" && kk !== "dv";
    });
  }, [data]);

  // Pre-filter data for global search, searching only in allowedKeys
  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!globalFilter) return data;
    const q = globalFilter.toString().toLowerCase();
    return data.filter((row) =>
      allowedKeys.some((k) =>
        String((row && row[k]) ?? "")
          .toLowerCase()
          .includes(q)
      )
    );
  }, [data, globalFilter, allowedKeys]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      // globalFilter handled outside to exclude certain keys (rut/dv)
      columnFilters,
      sorting,
    },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // We apply global filtering before the table to exclude 'rut' and 'dv'
    getSortedRowModel: getSortedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (!data || data.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No hay datos para mostrar
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          placeholder="Buscar..."
        />
      </div>

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-left text-sm text-gray-500">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`px-6 py-3 ${
                      header.column.getCanSort()
                        ? "cursor-pointer select-none hover:bg-gray-100"
                        : ""
                    }`}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {header.column.getCanSort() && (
                        <span className="text-gray-400">
                          {header.column.getIsSorted() === "asc" && " ↑"}
                          {header.column.getIsSorted() === "desc" && " ↓"}
                          {!header.column.getIsSorted() && " ↕"}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b bg-white hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {"<"}
        </button>
        <span className="text-sm text-gray-700">
          Página{" "}
          <span className="font-semibold">
            {table.getState().pagination.pageIndex + 1}
          </span>{" "}
          de <span className="font-semibold">{table.getPageCount()}</span>
        </span>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {">"}
        </button>
      </div>
    </div>
  );
};
