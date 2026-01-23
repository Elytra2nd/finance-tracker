'use server'

import { revalidatePath } from "next/cache";

const DATABASE_ID = process.env.NOTION_DATABASE_ID!;
const NOTION_KEY = process.env.NOTION_KEY!;

export async function updateGoalAction(name: string, targetAmount: number) {
  // 1. Cari dulu apakah baris GOAL_CONFIG sudah ada?
  const query = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${NOTION_KEY}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filter: {
        and: [
          { property: "Type", select: { equals: "Budget" } }, // Kita pakai tipe Budget biar aman
          { property: "Nama", title: { equals: "GOAL_CONFIG" } }
        ]
      }
    })
  });

  const data = await query.json();
  const existingPage = data.results[0];

  // 2. Jika sudah ada, UPDATE. Jika belum, CREATE.
  if (existingPage) {
    await fetch(`https://api.notion.com/v1/pages/${existingPage.id}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${NOTION_KEY}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: {
          amount: { number: targetAmount },
          // Kita simpan Nama Target (misal: "Macbook") di kolom Category (Select)
          // Agar kolom Nama tetap dipakai untuk ID "GOAL_CONFIG"
          Category: { select: { name: name } } 
        }
      })
    });
  } else {
    await fetch(`https://api.notion.com/v1/pages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NOTION_KEY}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        parent: { database_id: DATABASE_ID },
        properties: {
          Nama: { title: [{ text: { content: "GOAL_CONFIG" } }] },
          Type: { select: { name: "Budget" } },
          amount: { number: targetAmount },
          Category: { select: { name: name } }
        }
      })
    });
  }

  revalidatePath("/");
}