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

  // Extract unique sedes for the selector
  const uniqueSedes = useMemo(() => {
    if (!data || data.length === 0) return [];
    const sedeKey = Object.keys(data[0]).find(
      (k) => k.toLowerCase() === "sede"
    );
    if (!sedeKey) return [];
    const unique = new Set();
    data.forEach((row) => {
      if (row[sedeKey]) unique.add(row[sedeKey]);
    });
    return Array.from(unique).sort();
  }, [data]);

  // Extract unique nombres for the selector
  const uniqueNombres = useMemo(() => {
    if (!data || data.length === 0) return [];
    const nombreKey = Object.keys(data[0]).find(
      (k) => k.toLowerCase() === "nombre"
    );
    if (!nombreKey) return [];
    const unique = new Set();
    data.forEach((row) => {
      if (row[nombreKey]) unique.add(row[nombreKey]);
    });
    return Array.from(unique).sort();
  }, [data]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      columnFilters,
      sorting,
    },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
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
    <div className="flex flex-col gap-4 p-4 text-bg-light">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {/* Global Search */}
        <input
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white placeholder-gray-400 focus:border-primary focus:ring-primary"
          placeholder="Buscar en la tabla..."
        />

        {/* Sede Selector */}
        <select
          value={
            columnFilters.find((f) => f.id.toLowerCase() === "sede")?.value ||
            ""
          }
          onChange={(e) => {
            const val = e.target.value;
            const sedeKey =
              Object.keys(data[0] || {}).find(
                (k) => k.toLowerCase() === "sede"
              ) || "sede";
            if (val) {
              setColumnFilters((old) => [
                ...old.filter((f) => f.id.toLowerCase() !== "sede"),
                { id: sedeKey, value: val },
              ]);
            } else {
              setColumnFilters((old) =>
                old.filter((f) => f.id.toLowerCase() !== "sede")
              );
            }
          }}
          className="block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-primary focus:ring-primary sm:w-auto"
        >
          <option value="">Buscar por Sede</option>
          {uniqueSedes.map((sede) => (
            <option key={sede} value={sede}>
              {sede}
            </option>
          ))}
        </select>

        {/* Nombre Selector */}
        <select
          value={
            columnFilters.find((f) => f.id.toLowerCase() === "nombre")?.value ||
            ""
          }
          onChange={(e) => {
            const val = e.target.value;
            const nombreKey =
              Object.keys(data[0] || {}).find(
                (k) => k.toLowerCase() === "nombre"
              ) || "nombre";
            if (val) {
              setColumnFilters((old) => [
                ...old.filter((f) => f.id.toLowerCase() !== "nombre"),
                { id: nombreKey, value: val },
              ]);
            } else {
              setColumnFilters((old) =>
                old.filter((f) => f.id.toLowerCase() !== "nombre")
              );
            }
          }}
          className="block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-primary focus:ring-primary sm:w-auto"
        >
          <option value="">Buscar por Nombre</option>
          {uniqueNombres.map((nombre) => (
            <option key={nombre} value={nombre}>
              {nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-left text-sm text-bg-light">
          <thead className="bg-gray-800 text-xs uppercase text-gray-400 border-b border-gray-700">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`px-6 py-3 ${
                      header.column.getCanSort()
                        ? "cursor-pointer select-none hover:text-white"
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
                        <span className="text-gray-500">
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
            {table.getRowModel().rows.map((row) => {
              const data = row.original || {};
              const cells = row.getVisibleCells();

              // Check for missing data in any visible cell
              const hasMissingData = cells.some((cell) => {
                const val = cell.getValue();
                return val === null || val === undefined || val === "";
              });

              const keys = Object.keys(data);
              const inicioKey = keys.find((k) => {
                const lower = k.toLowerCase();
                return lower.includes("horario") && lower.includes("inicio");
              });
              const terminoKey = keys.find((k) => {
                const lower = k.toLowerCase();
                return lower.includes("horario") && lower.includes("termino");
              });

              const inicioVal = inicioKey ? String(data[inicioKey]) : "";
              const terminoVal = terminoKey ? String(data[terminoKey]) : "";
              const isRed =
                hasMissingData ||
                inicioVal.includes("-") ||
                terminoVal.includes("-");

              return (
                <tr
                  key={row.id}
                  className={`border-b border-gray-700 ${
                    isRed ? "bg-red-400" : "bg-bg-dark"
                  } hover:bg-gray-800 hover:text-white`}
                >
                  {cells.map((cell) => (
                    <td key={cell.id} className="px-6 py-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {"<"}
        </button>
        <span className="text-sm text-gray-700">
          Página{" "}
          <span className="font-semibold text-gray-700">
            {table.getState().pagination.pageIndex + 1}
          </span>{" "}
          de{" "}
          <span className="font-semibold text-gray-700">
            {table.getPageCount()}
          </span>
        </span>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-3 mb-2 text-sm font-medium text-gray-300 hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {">"}
        </button>
      </div>
    </div>
  );
};
