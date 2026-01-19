import { addTransactionAction } from "@/actions/transaction";
import Link from "next/link";

export default function AddPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-4">
      {/* Header Mobile */}
      <div className="flex items-center mb-6">
        <Link href="/" className="p-2 text-gray-600 hover:bg-gray-200 rounded-full mr-2">
          ←
        </Link>
        <h1 className="text-xl font-bold text-gray-800">Tambah Transaksi</h1>
      </div>

      <form action={addTransactionAction} className="bg-white p-6 rounded-2xl shadow-sm space-y-5">
        
        {/* Input Nama Transaksi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Transaksi</label>
          <input 
            type="text" 
            name="description" 
            placeholder="Contoh: Makan Siang" 
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>

        {/* Input Nominal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nominal (Rp)</label>
          <input 
            type="number" 
            name="amount" 
            placeholder="0" 
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg font-semibold"
            required
          />
        </div>

        {/* Pilihan Type (Income/Expense) */}
        <div className="grid grid-cols-2 gap-4">
          <label className="cursor-pointer">
            <input type="radio" name="type" value="Expense" className="peer sr-only" defaultChecked />
            <div className="p-3 text-center border rounded-xl peer-checked:bg-red-500 peer-checked:text-white peer-checked:border-red-500 text-gray-600 transition-all">
              Pengeluaran
            </div>
          </label>
          <label className="cursor-pointer">
            <input type="radio" name="type" value="Income" className="peer sr-only" />
            <div className="p-3 text-center border rounded-xl peer-checked:bg-green-500 peer-checked:text-white peer-checked:border-green-500 text-gray-600 transition-all">
              Pemasukan
            </div>
          </label>
        </div>

        {/* Input Kategori */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
          <select 
            name="category" 
            className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="Makan">Makan</option>
            <option value="Transport">Transport</option>
            <option value="Hiburan">Hiburan</option>
            <option value="Belanja">Belanja</option>
            <option value="Tagihan">Tagihan</option>
            <option value="Gaji">Gaji</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>

        {/* Input Tanggal */}
        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
           <input 
             type="date" 
             name="date"
             defaultValue={new Date().toISOString().split('T')[0]}
             className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
           />
        </div>

        {/* Tombol Simpan */}
        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
        >
          Simpan Transaksi
        </button>

      </form>
    </main>
  );
}