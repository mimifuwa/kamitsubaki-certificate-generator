import { randomUUID } from "crypto";

import { NextRequest, NextResponse } from "next/server";

interface Resident {
  id: string;
  userId: string;
  residentNumber: number;
  name: string;
  photoBase64: string;
  streetNumber: string;
  addressLine: string;
  apartmentInfo: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, photoBase64, streetNumber, addressLine, apartmentInfo, userId, residentId } =
      body;

    // 詳細なバリデーション
    if (!name || !streetNumber || !addressLine || !userId) {
      return NextResponse.json({ error: "必須フィールドが不足しています" }, { status: 400 });
    }

    // 新規作成時は写真が必須
    if (!residentId && !photoBase64) {
      return NextResponse.json({ error: "写真が必要です" }, { status: 400 });
    }

    // 仮の市民票番号を生成
    const tempResidentNumber = Math.floor(Math.random() * 100000) + 1;

    const resident: Resident = {
      id: randomUUID(),
      userId,
      name,
      photoBase64: photoBase64 || "",
      streetNumber,
      addressLine,
      apartmentInfo: apartmentInfo || null,
      residentNumber: tempResidentNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(resident);
  } catch (error) {
    console.error("市民票作成エラー:", error);
    return NextResponse.json({ error: "市民票の作成に失敗しました" }, { status: 500 });
  }
}

export async function GET() {
  // localStorage管理のため、サーバーサイドでの永続化は行わない
  return NextResponse.json([]);
}
