"use client";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis, Legend,
} from "recharts";

const tooltipStyle = {
  background: "hsl(162 26% 8%)",
  border: "1px solid hsl(160 14% 16%)",
  borderRadius: "10px",
  fontSize: "12px",
};

export function RevenueArea({ data, keys }: { data: any[]; keys: { name: string; color: string }[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ left: -16, right: 8, top: 8 }}>
        <defs>
          {keys.map((k) => (
            <linearGradient key={k.name} id={`g-${k.name}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={k.color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={k.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(160 14% 14%)" vertical={false} />
        <XAxis dataKey="label" stroke="hsl(150 8% 50%)" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="hsl(150 8% 50%)" fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: "12px" }} />
        {keys.map((k) => (
          <Area key={k.name} type="monotone" dataKey={k.name} stroke={k.color} strokeWidth={2}
            fill={`url(#g-${k.name})`} />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function BarsChart({ data, dataKey, color }: { data: any[]; dataKey: string; color: string }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ left: -16, right: 8, top: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(160 14% 14%)" vertical={false} />
        <XAxis dataKey="label" stroke="hsl(150 8% 50%)" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="hsl(150 8% 50%)" fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(160 16% 16% / 0.4)" }} />
        <Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
