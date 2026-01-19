'use client' // Wajib karena Recharts butuh interaksi browser

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatRupiah } from '@/lib/utils';

// Warna-warni untuk setiap kategori
const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'];

export default function CategoryChart({ transactions }: { transactions: any[] }) {
  
  // 1. Filter hanya pengeluaran (Expense)
  const expenses = transactions.filter(t => t.type === 'Expense');

  // 2. Kelompokkan & Jumlahkan per Kategori
  const dataMap: Record<string, number> = {};
  expenses.forEach((t) => {
    if (dataMap[t.category]) {
      dataMap[t.category] += t.amount;
    } else {
      dataMap[t.category] = t.amount;
    }
  });

  // 3. Ubah ke format yang dimengerti Recharts
  const data = Object.keys(dataMap).map((key) => ({
    name: key,
    value: dataMap[key],
  }));

  if (data.length === 0) {
    return <div className="text-center text-gray-400 text-sm py-8">Belum ada data pengeluaran untuk grafik.</div>;
  }

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
      <h3 className="font-bold text-gray-800 mb-4 text-center">Pengeluaran per Kategori</h3>
      
      <div className="h-62.5 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60} // Membuat efek Donut (bolong tengah)
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            
            {/* --- BAGIAN YANG DIPERBAIKI --- */}
            <Tooltip 
              // Menggunakan (value: any) dan Number(value) untuk memuaskan TypeScript
              formatter={(value: any) => formatRupiah(Number(value))}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            {/* ----------------------------- */}

            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}