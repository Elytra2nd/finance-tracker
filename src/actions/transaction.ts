'use server'

import { createTransaction } from "@/lib/notion-api"; // Pastikan import ini benar atau copy logic fetch ke sini
import { revalidatePath } from "next/cache";

const NOTION_KEY = process.env.NOTION_KEY;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

const headers = {
  "Authorization": `Bearer ${NOTION_KEY}`,
  "Notion-Version": "2022-06-28",
  "Content-Type": "application/json",
};

// --- CREATE ---
export async function addTransactionAction(formData: FormData) {
  // ... (Gunakan logika yang sudah Anda buat sebelumnya di sini)
  // Saya persingkat untuk fokus ke Update/Delete
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
  
  revalidatePath("/");
}

// --- DELETE (Archive) ---
export async function deleteTransactionAction(id: string) {
  try {
    await fetch(`https://api.notion.com/v1/pages/${id}`, {
      method: "PATCH", // Notion delete pakai method PATCH (Archive)
      headers,
      body: JSON.stringify({ archived: true }),
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

// --- UPDATE ---
export async function updateTransactionAction(id: string, formData: FormData) {
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
}