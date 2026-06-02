"use client";

import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell,
} from "recharts";

export interface CostRow {
  round: string;
  facilitator: number;
  vendor: number;
  pulse: number;
  completion: number | null;
}

function tip() {
  return {
    background: "rgba(8,12,22,0.96)", border: "1px solid #1e293b", borderRadius: "10px",
    fontSize: "12px", fontFamily: "var(--font-plex-mono)", color: "#e2e8f0",
  };
}

export default function CostChart({ data }: { data: CostRow[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
        <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="round" stroke="#475569" tick={{ fontSize: 11 }} tickLine={false} axisLine={{ stroke: "#1e293b" }} />
        <YAxis yAxisId="cost" stroke="#475569" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
        <YAxis yAxisId="pulse" orientation="right" domain={[3, 5]} stroke="#475569" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tip()} cursor={{ fill: "#1e293b33" }} />
        <Legend wrapperStyle={{ fontSize: "11px" }} />
        <Bar yAxisId="cost" dataKey="facilitator" name="Facilitator £" fill="#38bdf8" fillOpacity={0.7} radius={[3, 3, 0, 0]} maxBarSize={26} />
        <Bar yAxisId="cost" dataKey="vendor" name="Vendor $" radius={[3, 3, 0, 0]} maxBarSize={26}>
          {data.map((d) => <Cell key={d.round} fill={d.vendor > 10000 ? "#fb7185" : "#64748b"} />)}
        </Bar>
        <Line yAxisId="pulse" type="monotone" dataKey="pulse" name="Avg pulse" stroke="#34d399" strokeWidth={2.5} dot={{ r: 3 }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
