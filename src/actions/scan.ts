'use server'

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function scanReceiptAction(formData: FormData) {
  const file = formData.get("file") as File;

  if (!file) {
    throw new Error("Tidak ada gambar yang diupload");
  }

  // 1. Konversi File Gambar ke Base64 agar bisa dibaca Gemini
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64Image = buffer.toString("base64");

  // 2. Siapkan Model
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // 3. Buat Prompt (Perintah) yang Spesifik
  const prompt = `
    Analisa gambar struk belanja ini. Ekstrak informasi berikut ke dalam format JSON murni:
    1. "description": Nama merchant atau toko (singkat saja).
    2. "amount": Total bayar (hanya angka, tanpa Rp atau titik).
    3. "date": Tanggal transaksi dalam format YYYY-MM-DD. Jika tidak ada tahun, asumsikan 2026.
    4. "category": Tebak kategori transaksi ini. Pilih SALAH SATU dari: "Makan", "Transport", "Hiburan", "Belanja", "Tagihan", "Lainnya".
    
    Jangan gunakan markdown block (seperti \`\`\`json). Langsung return raw JSON string saja.
  `;

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: file.type,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    // Bersihkan format jika AI bandel kasih markdown
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    console.log("AI Response:", cleanText);

    return JSON.parse(cleanText);

  } catch (error) {
    console.error("Gagal scan struk:", error);
    throw new Error("Gagal membaca struk. Pastikan gambar jelas.");
  }
}