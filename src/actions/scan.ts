'use server'

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function scanReceiptAction(formData: FormData) {
  // Cek API Key di dalam function agar aman saat runtime
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("API Key Gemini tidak ditemukan. Cek Vercel Environment Variables.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const file = formData.get("file") as File;

  if (!file) {
    throw new Error("Tidak ada gambar yang diupload");
  }

  try {
    // 1. Konversi File Gambar ke Base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");

    // 2. Siapkan Model - GUNAKAN VERSI '001' AGAR STABIL
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });

    // 3. Buat Prompt
    const prompt = `
      Analisa gambar struk belanja ini. Ekstrak informasi berikut ke dalam format JSON murni:
      1. "description": Nama merchant atau toko (singkat saja).
      2. "amount": Total bayar (hanya angka, tanpa Rp atau titik).
      3. "date": Tanggal transaksi dalam format YYYY-MM-DD. Jika tidak ada tahun, asumsikan 2026.
      4. "category": Tebak kategori transaksi ini. Pilih SALAH SATU dari: "Makan", "Transport", "Hiburan", "Belanja", "Tagihan", "Lainnya".
      
      Jangan gunakan markdown block (seperti \`\`\`json). Langsung return raw JSON string saja.
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: file.type || "image/jpeg",
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    // Bersihkan format
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    console.log("AI Response:", cleanText);

    return JSON.parse(cleanText);

  } catch (error: any) {
    console.error("Gagal scan struk:", error);
    
    // Error handling spesifik
    if (error.message.includes("404")) {
      throw new Error("Model AI sedang sibuk atau tidak ditemukan. Coba lagi nanti.");
    }
    
    throw new Error("Gagal membaca struk. Pastikan gambar jelas.");
  }
}