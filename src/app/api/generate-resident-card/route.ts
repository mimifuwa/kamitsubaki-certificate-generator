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
      createdAt: new Date(resident.createdAt),
      updatedAt: new Date(resident.updatedAt),
    };

    // 写真をBase64で取得
    let photoBase64: string | undefined;
    try {
      const photoResponse = await fetch(resident.photoUrl);
      if (photoResponse.ok) {
        const photoBuffer = await photoResponse.arrayBuffer();
        const base64 = Buffer.from(photoBuffer).toString("base64");
        photoBase64 = `data:image/jpeg;base64,${base64}`;
      }
    } catch (error) {
      console.error("写真取得エラー:", error);
      // 写真取得に失敗してもSVG生成は続行
    }

    // ロゴ画像をBase64で取得
    let logoBase64: string | undefined;
    try {
      const logoUrl = new URL("/1.png", request.url);
      const logoResponse = await fetch(logoUrl);
      if (logoResponse.ok) {
        const logoBuffer = await logoResponse.arrayBuffer();
        const base64 = Buffer.from(logoBuffer).toString("base64");
        logoBase64 = `data:image/png;base64,${base64}`;
      }
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
        height: (1123 * 5398) / 8560,
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
    console.error("住民票生成エラー:", error);
    return NextResponse.json({ error: "住民票の生成に失敗しました" }, { status: 500 });
  }
}
