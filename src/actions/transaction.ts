'use server'

import { revalidatePath } from "next/cache";
import { Resend } from 'resend';

// --- CONFIG ---
const NOTION_KEY = process.env.NOTION_KEY;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const MY_EMAIL = process.env.MY_EMAIL;
const FONNTE_TOKEN = process.env.FONNTE_TOKEN;
const MY_WA_NUMBER = process.env.MY_WA_NUMBER;

const headers = {
  "Authorization": `Bearer ${NOTION_KEY}`,
  "Notion-Version": "2022-06-28",
  "Content-Type": "application/json",
};

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

// --- HELPER: KIRIM WHATSAPP (Via Fonnte) ---
async function sendWhatsApp(message: string) {
  if (!FONNTE_TOKEN || !MY_WA_NUMBER) return;
  
  try {
    const res = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': FONNTE_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target: MY_WA_NUMBER,
        message: message,
      }),
    });
    console.log("Notifikasi WA terkirim:", await res.json());
  } catch (error) {
    console.error("Gagal kirim WA:", error);
  }
}

// --- HELPER: GET/SET BUDGET DI NOTION ---
// Kita cari item dengan Type='Budget' dan Nama='BUDGET_CONFIG'
async function getBudgetLimit(): Promise<{ id?: string, amount: number }> {
  const res = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      filter: {
        and: [
          { property: "Type", select: { equals: "Budget" } },
          { property: "Nama", title: { equals: "BUDGET_CONFIG" } }
        ]
      }
    }),
    cache: 'no-store' 
  });
  
  const data = await res.json();
  if (data.results.length > 0) {
    return { 
      id: data.results[0].id, 
      amount: data.results[0].properties.amount.number || 0 
    };
  }
  return { amount: 0 }; // Default jika belum diset
}

// --- ACTION: UPDATE BUDGET LIMIT ---
export async function setBudgetAction(amount: number) {
  const currentBudget = await getBudgetLimit();

  if (currentBudget.id) {
    // Update existing
    await fetch(`https://api.notion.com/v1/pages/${currentBudget.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        properties: { "amount": { number: amount } }
      }),
    });
  } else {
    // Create new config row
    await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers,
      body: JSON.stringify({
        parent: { database_id: DATABASE_ID },
        properties: {
          "Nama": { title: [{ text: { content: "BUDGET_CONFIG" } }] },
          "amount": { number: amount },
          "Category": { select: { name: "Lainnya" } }, // Dummy
          "Type": { select: { name: "Budget" } }, // Tipe Khusus
        },
      }),
    });
  }
  revalidatePath("/");
}

// --- LOGIC CEK BUDGET & NOTIFIKASI ---
async function checkBudgetAndNotify(newExpenseAmount: number) {
  try {
    // 1. Ambil Limit Budget dari Notion
    const { amount: budgetLimit } = await getBudgetLimit();
    if (budgetLimit === 0) return; // Jika budget belum diset, skip

    // 2. Hitung Total Pengeluaran Bulan Ini
    const res = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        filter: { property: "Type", select: { equals: "Expense" } }
      }),
      cache: 'no-store'
    });
    
    const data = await res.json();
    const currentTotal = data.results.reduce((sum: number, item: any) => sum + (item.properties.amount.number || 0), 0);
    const totalAfterTransaction = currentTotal + newExpenseAmount;

    // 3. Cek Limit
    if (totalAfterTransaction > budgetLimit) {
      const msg = `⚠️ *PERINGATAN BUDGET!* ⚠️\n\nPengeluaranmu: Rp ${new Intl.NumberFormat("id-ID").format(totalAfterTransaction)}\nBatas Budget: Rp ${new Intl.NumberFormat("id-ID").format(budgetLimit)}\n\nSudah *over budget* nih! Hemat ya! 💸`;
      
      await sendWhatsApp(msg);

      // Kirim Email (Opsional)
      if (resend && MY_EMAIL) {
        await resend.emails.send({
          from: 'Finance Tracker <onboarding@resend.dev>',
          to: MY_EMAIL,
          subject: '⚠️ Budget Alert',
          html: `<p>${msg.replace(/\n/g, '<br>')}</p>`
        });
      }
    }
  } catch (error) {
    console.error("Gagal cek budget:", error);
  }
}

// --- CRUD TRANSAKSI ---

export async function addTransactionAction(formData: FormData) {
  const description = formData.get("description") as string;
  const amount = Number(formData.get("amount"));
  const category = formData.get("category") as string;
  const type = formData.get("type") as string;
  const date = formData.get("date") as string;

  await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers,
    body: JSON.stringify({
      parent: { database_id: DATABASE_ID },
      properties: {
        "Nama": { title: [{ text: { content: description } }] },
        "amount": { number: amount },
        "Category": { select: { name: category } },
        "Type": { select: { name: type } },
        "date": { date: { start: date } },
      },
    }),
  });

  if (type === 'Expense') {
    await checkBudgetAndNotify(amount);
  }

  revalidatePath("/");
  return { success: true };
}

export async function updateTransactionAction(id: string, formData: FormData) {
  // ... (Logic update sama seperti sebelumnya, copy paste saja bagian update)
  const description = formData.get("description") as string;
  const amount = Number(formData.get("amount"));
  const category = formData.get("category") as string;
  const type = formData.get("type") as string;
  const date = formData.get("date") as string;

  await fetch(`https://api.notion.com/v1/pages/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      properties: {
        "Nama": { title: [{ text: { content: description } }] },
        "amount": { number: amount },
        "Category": { select: { name: category } },
        "Type": { select: { name: type } },
        "date": { date: { start: date } },
      },
    }),
  });
  revalidatePath("/");
  return { success: true };
}

export async function deleteTransactionAction(id: string) {
  // ... (Logic delete sama seperti sebelumnya)
  await fetch(`https://api.notion.com/v1/pages/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ archived: true }),
  });
  revalidatePath("/");
  return { success: true };
}