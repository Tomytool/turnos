import React from "react";
import { useCsvFetch } from "../hooks/useCsvFetch";
import { Table } from "./Table";

export const App = () => {
  // Example CSV URL - using a public dataset for demonstration
  const { data, loading, error } = useCsvFetch(
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSmoUiPbR7T7HBzkGaFjwxAVMaIx2pEhGQH6FzQKZKHOPmWw85zkQCR9wr7WFO2nuf5fW9ezYpKfTIP/pub?gid=0&single=true&output=csv"
  );

  if (loading) return <div style={{ padding: "20px" }}>Cargando datos...</div>;
  if (error)
    return (
      <div style={{ padding: "20px", color: "red" }}>
        Error al cargar: {error.message}
      </div>
    );

  return (
    <div className="min-h-screen bg-bg-dark text-bg-light p-5 font-sans">
      <h1 className="text-2xl font-bold">Registro de Turnos (Sede)</h1>
      <Table data={data} />
    </div>
  );
};
