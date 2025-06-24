import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const resident = await prisma.resident.findUnique({
      where: { id },
    });

    if (!resident) {
      return NextResponse.json({ error: "住民票が見つかりません" }, { status: 404 });
    }

    return NextResponse.json(resident);
  } catch (error) {
    console.error("住民票取得エラー:", error);
    return NextResponse.json({ error: "住民票の取得に失敗しました" }, { status: 500 });
  }
}
