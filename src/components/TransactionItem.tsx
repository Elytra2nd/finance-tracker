'use client'

import { motion } from "framer-motion";
import { formatRupiah, formatDate } from "@/lib/utils";
import { MoreHorizontal, Trash2, Edit } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { deleteTransactionAction } from "@/actions/transaction";
import { useState } from "react";

export default function TransactionItem({ transaction, onEdit }: { transaction: any, onEdit: (t: any) => void }) {
  const [isDeleted, setIsDeleted] = useState(false);

  const handleDelete = async () => {
    if (confirm("Yakin hapus transaksi ini?")) {
      setIsDeleted(true); // Optimistic UI update (hilang duluan biar cepat)
      await deleteTransactionAction(transaction.id);
    }
  };

  if (isDeleted) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center group"
    >
      {/* Kiri: Icon & Info */}
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-full text-xl ${transaction.type === 'Income' ? 'bg-green-100' : 'bg-red-100'}`}>
          {transaction.type === 'Income' ? '💰' : '💸'}
        </div>
        <div>
          <p className="font-bold text-gray-800">{transaction.description}</p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{formatDate(transaction.date)}</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">{transaction.category}</span>
          </div>
        </div>
      </div>

      {/* Kanan: Nominal & Menu */}
      <div className="flex items-center gap-3">
        <p className={`font-bold whitespace-nowrap text-sm md:text-base ${transaction.type === 'Income' ? 'text-green-600' : 'text-red-600'}`}>
          {transaction.type === 'Income' ? '+' : '-'} {formatRupiah(transaction.amount)}
        </p>
        
        <DropdownMenu>
          <DropdownMenuTrigger className="p-2 hover:bg-gray-100 rounded-full outline-none">
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(transaction)}>
              <Edit className="w-4 h-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
              <Trash2 className="w-4 h-4 mr-2" /> Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}