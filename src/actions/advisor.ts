'use server'

export async function generateFinancialAdvice(
  totalIncome: number, 
  totalExpense: number, 
  categorySummary: Record<string, number>,
  monthName: string
) {
  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) throw new Error("API Key hilang.");

  try {
    // 1. Susun Prompt yang Jelas
    const prompt = `
      Bertindaklah sebagai Konsultan Keuangan Pribadi yang cerdas, ramah, dan sedikit humoris.
      Saya adalah mahasiswa/anak muda yang sedang belajar mengatur keuangan.
      
      Berikut adalah data keuangan saya untuk bulan ${monthName}:
      - Total Pemasukan: Rp ${totalIncome.toLocaleString('id-ID')}
      - Total Pengeluaran: Rp ${totalExpense.toLocaleString('id-ID')}
      - Sisa Saldo: Rp ${(totalIncome - totalExpense).toLocaleString('id-ID')}
      
      Rincian Pengeluaran per Kategori:
      ${Object.entries(categorySummary).map(([cat, amount]) => `- ${cat}: Rp ${amount.toLocaleString('id-ID')}`).join('\n')}

      Tugasmu:
      1. Berikan "Skor Kesehatan Keuangan" (1-10) berdasarkan data di atas.
      2. Berikan analisis singkat: Apa pengeluaran terbesar yang perlu diwaspadai?
      3. Berikan 3 tips praktis dan spesifik untuk bulan depan agar bisa lebih hemat.
      4. Gunakan bahasa Indonesia yang santai, suportif, dan mudah dipahami. Jangan terlalu kaku.
      
      Format output dalam Markdown (gunakan bold untuk poin penting).
    `;

    // 2. Panggil Gemini 2.5 Flash
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    if (!response.ok) throw new Error("Gagal menghubungi AI Advisor");

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;

  } catch (error: any) {
    console.error("AI Advisor Error:", error);
    throw new Error("Maaf, AI sedang istirahat. Coba lagi nanti.");
  }
}