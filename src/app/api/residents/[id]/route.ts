import { readFile } from "fs/promises";
import path from "path";

import { NextRequest, NextResponse } from "next/server";

interface Resident {
  id: string;
  userId: string;
  residentNumber: number;
  name: string;
  photoUrl: string;
  streetNumber: string;
  addressLine: string;
  apartmentInfo: string | null;
  createdAt: string;
  updatedAt: string;
}

const DATA_FILE = path.join(process.cwd(), "data", "residents.json");

async function readResidentsData(): Promise<Resident[]> {
  try {
    const data = await readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const residents = await readResidentsData();
    const resident = residents.find((r) => r.id === id);

    if (!resident) {
      return NextResponse.json({ error: "市民票が見つかりません" }, { status: 404 });
    }

    return NextResponse.json(resident);
  } catch (error) {
    console.error("市民票取得エラー:", error);
    return NextResponse.json({ error: "市民票の取得に失敗しました" }, { status: 500 });
  }
}
