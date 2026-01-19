'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { addTransactionAction, updateTransactionAction } from "@/actions/transaction";
import ScanButton from "./ScanButton";
import { toast } from "sonner"; // <-- Import Toaster

// Daftar Kategori Valid sesuai Aplikasi
const VALID_CATEGORIES = ["Makan", "Transport", "Hiburan", "Belanja", "Tagihan", "Lainnya"];

export default function TransactionForm({ 
  initialData, 
  onSuccess 
}: { 
  initialData?: any, 
  onSuccess: () => void 
}) {
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "Makan",
    type: "Expense",
    date: new Date().toISOString().split('T')[0]
  });

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

  // --- LOGIC BARU: Handle Hasil Scan ---
  const handleScanResult = (result: any) => {
    // 1. Normalisasi Kategori
    let cleanCategory = result.category;
    if (!VALID_CATEGORIES.includes(cleanCategory)) {
        // Mapping sederhana (bisa ditambah)
        if (cleanCategory.toLowerCase().includes("office")) cleanCategory = "Belanja";
        else if (cleanCategory.toLowerCase().includes("food")) cleanCategory = "Makan";
        else cleanCategory = "Lainnya"; 
    }

    // 2. Isi Form
    setFormData((prev) => ({
      ...prev,
      description: result.description || "Struk Scan",
      amount: result.amount || "",
      category: cleanCategory, 
      date: result.date || new Date().toISOString().split('T')[0]
    }));

    // 3. Beri info ke user via Toast (Bukan Alert lagi)
    toast.success("Scan Berhasil!", {
        description: "Data telah diisi otomatis. Silakan cek dan simpan."
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  async function handleSubmit(data: FormData) {
    setLoading(true);
    try {
      if (initialData) {
        await updateTransactionAction(initialData.id, data);
        toast.success("Transaksi berhasil diupdate!"); // <-- Toast Sukses Update
      } else {
        await addTransactionAction(data);
        toast.success("Transaksi berhasil disimpan!"); // <-- Toast Sukses Simpan
      }
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Gagal menyimpan data."); // <-- Toast Error
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4">
      {/* Tombol Scan */}
      {!initialData && (
        <ScanButton onScanComplete={handleScanResult} />
      )}

      <form action={handleSubmit} className="space-y-4 border-t pt-4 mt-4">
        {/* Nama Transaksi */}
        <div className="space-y-2">
          <Label>Nama Transaksi</Label>
          <Input 
            name="description" 
            value={formData.description} 
            onChange={(e) => handleChange("description", e.target.value)}
            required 
            placeholder="Cth: Beli Kopi" 
            className="font-bold text-gray-800"
          />
        </div>

        {/* Nominal */}
        <div className="space-y-2">
          <Label>Nominal (Rp)</Label>
          <Input 
            type="number" 
            name="amount" 
            value={formData.amount} 
            onChange={(e) => handleChange("amount", e.target.value)}
            required 
            placeholder="0" 
            className="text-lg"
          />
        </div>

        {/* Tipe & Kategori */}
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
              <SelectTrigger>
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent>
                {VALID_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tanggal */}
        <div className="space-y-2">
          <Label>Tanggal</Label>
          <Input 
            type="date" 
            name="date" 
            value={formData.date} 
            onChange={(e) => handleChange("date", e.target.value)}
          />
        </div>

        {/* TOMBOL SIMPAN (PENTING) */}
        <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg font-bold shadow-lg" 
            disabled={loading}
        >
          {loading ? "Menyimpan..." : (initialData ? "Update Transaksi" : "Simpan Transaksi")}
        </Button>
      </form>
    </div>
  );
}