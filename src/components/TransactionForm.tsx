'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { addTransactionAction, updateTransactionAction } from "@/actions/transaction";
import ScanButton from "./ScanButton"; // <-- Import Tombol Scan

export default function TransactionForm({ 
  initialData, 
  onSuccess 
}: { 
  initialData?: any, 
  onSuccess: () => void 
}) {
  const [loading, setLoading] = useState(false);
  
  // State lokal untuk menampung nilai input
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "Makan",
    type: "Expense",
    date: new Date().toISOString().split('T')[0]
  });

  // Load initialData jika mode Edit
  useEffect(() => {
    if (initialData) {
      setFormData({
        description: initialData.description,
        amount: initialData.amount,
        category: initialData.category,
        type: initialData.type,
        date: new Date(initialData.date).toISOString().split('T')[0]
      });
    }
  }, [initialData]);

  // Fungsi saat AI selesai scan
  const handleScanResult = (result: any) => {
    setFormData((prev) => ({
      ...prev,
      description: result.description || "Struk Scan",
      amount: result.amount || "",
      category: result.category || "Belanja",
      date: result.date || new Date().toISOString().split('T')[0]
    }));
  };

  // Helper agar input bisa diketik manual juga
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  async function handleSubmit(data: FormData) {
    setLoading(true);
    try {
      if (initialData) {
        await updateTransactionAction(initialData.id, data);
      } else {
        await addTransactionAction(data);
      }
      onSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4">
      {/* Tombol Scan hanya muncul di mode Tambah Baru (bukan Edit) */}
      {!initialData && (
        <ScanButton onScanComplete={handleScanResult} />
      )}

      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Nama Transaksi</Label>
          <Input 
            name="description" 
            value={formData.description} 
            onChange={(e) => handleChange("description", e.target.value)}
            required 
            placeholder="Cth: Beli Kopi" 
          />
        </div>

        <div className="space-y-2">
          <Label>Nominal</Label>
          <Input 
            type="number" 
            name="amount" 
            value={formData.amount} 
            onChange={(e) => handleChange("amount", e.target.value)}
            required 
            placeholder="15000" 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tipe</Label>
            <Select 
              name="type" 
              value={formData.type} 
              onValueChange={(val) => handleChange("type", val)}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Expense">Pengeluaran</SelectItem>
                <SelectItem value="Income">Pemasukan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Kategori</Label>
            <Select 
              name="category" 
              value={formData.category} 
              onValueChange={(val) => handleChange("category", val)}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Makan">Makan</SelectItem>
                <SelectItem value="Transport">Transport</SelectItem>
                <SelectItem value="Hiburan">Hiburan</SelectItem>
                <SelectItem value="Belanja">Belanja</SelectItem>
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
            value={formData.date} 
            onChange={(e) => handleChange("date", e.target.value)}
          />
        </div>

        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
          {loading ? "Menyimpan..." : (initialData ? "Update Transaksi" : "Simpan Baru")}
        </Button>
      </form>
    </div>
  );
}