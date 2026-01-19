'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings } from "lucide-react";
import { setBudgetAction } from "@/actions/transaction";
import { formatRupiah } from "@/lib/utils";

export default function BudgetSettings({ currentBudget }: { currentBudget: number }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(currentBudget);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await setBudgetAction(amount);
    setLoading(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white">
          <Settings className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atur Batas Budget Bulanan</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Notifikasi WA akan dikirim jika pengeluaran melebihi angka ini.</p>
            <Input 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(Number(e.target.value))}
            />
            <p className="text-sm font-bold text-blue-600">
              {formatRupiah(amount)}
            </p>
          </div>
          <Button onClick={handleSave} className="w-full" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan Budget"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}