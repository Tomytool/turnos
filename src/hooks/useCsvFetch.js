import { useState, useEffect } from "react";

export const useCsvFetch = (url) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(
            `Network response was not ok: ${response.statusText}`
          );
        }
        const text = await response.text();
        const json = csvToJson(text);
        setData(json);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (url) {
      fetchData();
    }
  }, [url]);

  return { data, loading, error };
};

const csvToJson = (csv) => {
  if (!csv) return [];

  const lines = csv.trim().split("\n");
  if (lines.length === 0) return [];

  const headers = lines[0].split(",").map((header) => header.trim());
  const result = [];

  for (let i = 1; i < lines.length; i++) {
    const obj = {};
    const currentline = lines[i].split(",");

    // Basic handling to ensure we don't process empty lines or malformed rows roughly
    if (currentline.length === headers.length) {
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentline[j] ? currentline[j].trim() : "";
      }
      result.push(obj);
    }
  }
  return result;
};
