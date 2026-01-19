'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatRupiah, formatDate } from '@/lib/utils'; // Pastikan Anda punya fungsi formatDate, atau pakai native Date

export default function TimeSeriesChart({ transactions }: { transactions: any[] }) {
  
  // 1. Kelompokkan Data Berdasarkan Tanggal
  // Hasil: { "2026-01-19": { date: "2026-01-19", income: 50000, expense: 20000 }, ... }
  const groupedData = transactions.reduce((acc: any, curr: any) => {
    const dateKey = curr.date; // Asumsi format YYYY-MM-DD
    if (!acc[dateKey]) {
      acc[dateKey] = { date: dateKey, income: 0, expense: 0 };
    }
    if (curr.type === 'Income') {
      acc[dateKey].income += curr.amount;
    } else {
      acc[dateKey].expense += curr.amount;
    }
    return acc;
  }, {});

  // 2. Ubah ke Array dan Sortir dari Tanggal Terlama ke Terbaru
  const data = Object.values(groupedData).sort((a: any, b: any) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Fungsi formatter tanggal sederhana untuk Sumbu X (misal: "19 Jan")
  const formatXAxis = (tickItem: string) => {
    const date = new Date(tickItem);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
  };

  if (data.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-full">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Tren Keuangan</h3>
      <div className="h-64 w-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxis} 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF' }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF' }}
              tickFormatter={(value) => `${value / 1000}k`} // Singkat angka (50k)
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value: number | undefined) => value !== undefined ? formatRupiah(value) : ''}
              labelFormatter={(label) => new Date(label).toLocaleDateString('id-ID', { dateStyle: 'full' })}
            />
            <Area 
              type="monotone" 
              dataKey="income" 
              name="Pemasukan"
              stroke="#10B981" 
              fillOpacity={1} 
              fill="url(#colorIncome)" 
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="expense" 
              name="Pengeluaran"
              stroke="#EF4444" 
              fillOpacity={1} 
              fill="url(#colorExpense)" 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}