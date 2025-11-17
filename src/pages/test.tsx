import { useEffect, useState } from "react";
import { testSupabaseConnection } from "../supabase/testSupabase";

export default function TestPage() {
  const [machines, setMachines] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const data = await testSupabaseConnection();
      if (data) setMachines(data);
    }
    load();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Machines Loaded from Supabase</h1>

      {machines.length === 0 ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {machines.map((m) => (
            <li key={m.id} style={{ marginBottom: "15px" }}>
              <strong>{m.machine_name}</strong> — {m.type}
              <br />
              Price: ₹{m.price_rs?.toLocaleString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
