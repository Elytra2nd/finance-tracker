import ClientDashboard from "@/components/ClientDashboard";

// --- 1. FETCH TRANSAKSI (Hanya Income & Expense) ---
async function getTransactions() {
  const databaseId = process.env.NOTION_DATABASE_ID;
  const apiKey = process.env.NOTION_KEY;
  if (!databaseId || !apiKey) return [];

  const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      page_size: 100, // Ambil 100 data agar bulan lalu terbawa
      filter: {
        or: [
          { property: "Type", select: { equals: "Income" } },
          { property: "Type", select: { equals: "Expense" } }
        ]
      },
      sorts: [{ property: "date", direction: "descending" }],
    }),
    next: { revalidate: 0 },
  });

  if (!res.ok) return [];
  const data = await res.json();

  return data.results.map((item: any) => ({
    id: item.id,
    description: item.properties.Nama.title[0]?.plain_text || "Tanpa Nama",
    amount: item.properties.amount.number || 0,
    category: item.properties.Category.select?.name || "Lainnya",
    type: item.properties.Type.select?.name || "Expense",
    date: item.properties.date.date?.start || new Date().toISOString(),
  }));
}

// --- 2. FETCH BUDGET CONFIG (Hanya row konfigurasi Budget) ---
async function getBudget() {
  const databaseId = process.env.NOTION_DATABASE_ID;
  const apiKey = process.env.NOTION_KEY;
  if (!databaseId || !apiKey) return 0;

  const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filter: {
        and: [
          { property: "Type", select: { equals: "Budget" } },
          { property: "Nama", title: { equals: "BUDGET_CONFIG" } }
        ]
      }
    }),
    next: { revalidate: 0 },
  });

  const data = await res.json();
  return data.results[0]?.properties.amount.number || 0;
}

// --- 3. FETCH SAVINGS GOAL (Baris baru untuk Target Tabungan) ---
async function getGoalConfig() {
  const databaseId = process.env.NOTION_DATABASE_ID;
  const apiKey = process.env.NOTION_KEY;
  if (!databaseId || !apiKey) return null;

  const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filter: {
        and: [
          { property: "Type", select: { equals: "Budget" } },
          { property: "Nama", title: { equals: "GOAL_CONFIG" } }
        ]
      }
    }),
    next: { revalidate: 0 },
  });

  const data = await res.json();
  const row = data.results[0];
  
  if (!row) return null;

  return {
    name: row.properties.Category.select?.name || "Target Impian",
    amount: row.properties.amount.number || 0
  };
}

// --- KOMPONEN UTAMA ---
export default async function Home() {
  // Jalankan ketiga fetch secara paralel
  const [transactions, currentBudget, goalConfig] = await Promise.all([
    getTransactions(),
    getBudget(),
    getGoalConfig()
  ]);

  return (
    <ClientDashboard 
      transactions={transactions} 
      initialBudget={currentBudget} 
      initialGoal={goalConfig} // <-- Kirim data target tabungan ke Dashboard
    />
  );
}