'use client'

import { formatRupiah, formatDate } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, MoreHorizontal, ShoppingBag, Utensils, Zap, Bus, Film, MoreHorizontal as MoreIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteTransactionAction } from "@/actions/transaction";
import { toast } from "sonner";
import { motion } from "framer-motion";

// Helper untuk memilih Icon berdasarkan kategori
const getCategoryIcon = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes("makan") || cat.includes("food")) return <Utensils className="w-5 h-5 text-orange-500" />;
  if (cat.includes("belanja") || cat.includes("shop")) return <ShoppingBag className="w-5 h-5 text-blue-500" />;
  if (cat.includes("transport")) return <Bus className="w-5 h-5 text-indigo-500" />;
  if (cat.includes("hiburan")) return <Film className="w-5 h-5 text-pink-500" />;
  if (cat.includes("tagihan")) return <Zap className="w-5 h-5 text-yellow-500" />;
  return <MoreIcon className="w-5 h-5 text-gray-500" />;
};

export default function TransactionItem({ transaction, onEdit }: { transaction: any, onEdit: (t: any) => void }) {
  
  const handleDelete = async () => {
    if (confirm("Yakin ingin menghapus transaksi ini?")) {
      try {
        await deleteTransactionAction(transaction.id);
        toast.success("Transaksi dihapus");
      } catch (error) {
        toast.error("Gagal menghapus");
      }
    }
  };

  const isExpense = transaction.type === 'Expense';

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between gap-3 transition-all hover:shadow-md"
    >
      {/* KIRI: Icon & Detail */}
      <div className="flex items-center gap-3 overflow-hidden flex-1">
        {/* Icon Container */}
        <div className={`p-3 rounded-2xl shrink-0 ${isExpense ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
          {getCategoryIcon(transaction.category)}
        </div>

        {/* Text Container (PENTING: min-w-0 agar truncate bekerja di dalam flex) */}
        <div className="flex flex-col min-w-0">
          <p className="font-bold text-gray-800 dark:text-gray-100 text-sm truncate">
            {transaction.description}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            <span>{formatDate(transaction.date)}</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full" />
            <span className="truncate max-w-20">{transaction.category}</span>
          </div>
        </div>
      </div>

      {/* KANAN: Nominal & Menu */}
      <div className="flex items-center gap-1 shrink-0">
        <p className={`font-bold text-sm sm:text-base whitespace-nowrap ${isExpense ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
          {isExpense ? "- " : "+ "}{formatRupiah(transaction.amount)}
        </p>

        {/* Dropdown Menu (Titik Tiga) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32 rounded-xl">
            <DropdownMenuItem onClick={() => onEdit(transaction)} className="cursor-pointer gap-2">
              <Edit2 className="w-4 h-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="cursor-pointer gap-2 text-red-600 focus:text-red-600">
              <Trash2 className="w-4 h-4" /> Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}