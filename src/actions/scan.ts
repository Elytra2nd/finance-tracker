'use server'

export async function scanReceiptAction(formData: FormData) {
  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) throw new Error("API Key hilang. Cek Vercel.");

  const file = formData.get("file") as File;
  if (!file) throw new Error("Gambar tidak ditemukan.");

  try {
    // 1. Convert Image
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");
    const mimeType = file.type || "image/jpeg";

    // 2. Prepare Payload
    const requestBody = {
      contents: [{
        parts: [
          { text: "Analisa struk ini. Return JSON murni: {description, amount (number), date (YYYY-MM-DD), category}. Tanpa markdown block." },
          { inline_data: { mime_type: mimeType, data: base64Image } }
        ]
      }]
    };

    // 3. PANGGIL MODEL YANG TERSEDIA DI AKUN ANDA (gemini-2.5-flash)
    console.log("🚀 Mengirim request ke Gemini 2.5 Flash...");
    
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      }
    );

    // 4. Handle Error
    if (!res.ok) {
      const err = await res.json();
      console.error("Gemini Error:", JSON.stringify(err, null, 2));
      throw new Error(err.error?.message || res.statusText);
    }

    // 5. Parse Result
    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) throw new Error("AI tidak merespon teks.");

    // Bersihkan format (kadang AI 2.5 suka nambahin ```json di awal)
    const cleanText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    console.log("✅ Sukses Scan:", cleanText);
    
    return JSON.parse(cleanText);

  } catch (error: any) {
    console.error("🔥 Server Action Error:", error.message);
    throw new Error(`Gagal Scan: ${error.message}`);
  }
}