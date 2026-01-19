'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { addTransactionAction, updateTransactionAction } from "@/actions/transaction";

export default function TransactionForm({ 
  initialData, 
  onSuccess 
}: { 
  initialData?: any, 
  onSuccess: () => void 
}) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      if (initialData) {
        await updateTransactionAction(initialData.id, formData);
      } else {
        await addTransactionAction(formData);
      }
      onSuccess(); // Tutup sheet setelah sukses
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label>Nama Transaksi</Label>
        <Input name="description" defaultValue={initialData?.description} required placeholder="Cth: Beli Kopi" />
      </div>

      <div className="space-y-2">
        <Label>Nominal</Label>
        <Input type="number" name="amount" defaultValue={initialData?.amount} required placeholder="15000" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tipe</Label>
          <Select name="type" defaultValue={initialData?.type || "Expense"}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Expense">Pengeluaran</SelectItem>
              <SelectItem value="Income">Pemasukan</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Kategori</Label>
          <Select name="category" defaultValue={initialData?.category || "Makan"}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Makan">Makan</SelectItem>
              <SelectItem value="Transport">Transport</SelectItem>
              <SelectItem value="Hiburan">Hiburan</SelectItem>
              <SelectItem value="Tagihan">Tagihan</SelectItem>
              <SelectItem value="Lainnya">Lainnya</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Tanggal</Label>
        <Input 
          type="date" 
          name="date" 
          defaultValue={initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} 
        />
      </div>

      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
        {loading ? "Menyimpan..." : (initialData ? "Update Transaksi" : "Simpan Baru")}
      </Button>
    </form>
  );
}