import { readFile } from "fs/promises";
import path from "path";

import { NextRequest, NextResponse } from "next/server";
import satori from "satori";

import ResidentCardForSatori from "@/components/ResidentCardForSatori";
import { Resident } from "@/types/resident";

async function loadFont(request: NextRequest) {
  // ローカルのNoto Serif JPフォントファイルを読み込む
  const fontThinUrl = new URL("/fonts/NotoSerifJP-Regular.ttf", request.url);
  const fontRegularUrl = new URL("/fonts/NotoSerifJP-SemiBold.ttf", request.url);
  const fontBoldUrl = new URL("/fonts/NotoSerifJP-Bold.ttf", request.url);

  const fontSansRegularUrl = new URL("/fonts/NotoSansJP-Regular.ttf", request.url);

  const [fontThinData, fontRegularData, fontBoldData, fontSansRegularData] = await Promise.all([
    fetch(fontThinUrl).then((res) => res.arrayBuffer()),
    fetch(fontRegularUrl).then((res) => res.arrayBuffer()),
    fetch(fontBoldUrl).then((res) => res.arrayBuffer()),
    fetch(fontSansRegularUrl).then((res) => res.arrayBuffer()),
  ]);

  return [
    {
      name: "Noto Serif JP",
      data: fontThinData,
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "Noto Serif JP",
      data: fontRegularData,
      weight: 600 as const,
      style: "normal" as const,
    },
    {
      name: "Noto Serif JP",
      data: fontBoldData,
      weight: 700 as const,
      style: "normal" as const,
    },
    {
      name: "Noto Sans JP",
      data: fontSansRegularData,
      weight: 400 as const,
      style: "normal" as const,
    },
  ];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resident }: { resident: Resident } = body;

    // Residentオブジェクトの日付を正しくパース
    const residentData: Resident = {
      ...resident,
      createdAt:
        typeof resident.createdAt === "string"
          ? resident.createdAt
          : new Date(resident.createdAt).toISOString(),
      updatedAt:
        typeof resident.updatedAt === "string"
          ? resident.updatedAt
          : new Date(resident.updatedAt).toISOString(),
    };

    // 写真はすでにBase64形式で提供される
    const photoBase64 = resident.photoBase64;

    // ロゴ画像をBase64で取得
    let logoBase64: string | undefined;
    try {
      // ローカルファイルシステムから直接読み込み
      const logoPath = path.join(process.cwd(), "public", "1.png");
      const logoBuffer = await readFile(logoPath);
      const base64 = logoBuffer.toString("base64");
      logoBase64 = `data:image/png;base64,${base64}`;
    } catch (error) {
      console.error("ロゴ取得エラー:", error);
      // ロゴ取得に失敗してもSVG生成は続行
    }

    // フォントを読み込み
    const fonts = await loadFont(request);

    // SVGを生成
    const svg = await satori(
      ResidentCardForSatori({ resident: residentData, photoBase64, logoBase64 }),
      {
        width: 1080,
        height: 681.0560747664,
        fonts,
      }
    );

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("市民票生成エラー:", error);
    return NextResponse.json({ error: "市民票の生成に失敗しました" }, { status: 500 });
  }
}
