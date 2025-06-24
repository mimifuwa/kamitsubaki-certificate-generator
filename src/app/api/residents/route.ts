import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

// サービスロールキーを使用したクライアント（RLS回避用）
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const photo = formData.get("photo") as File;
    const streetNumber = formData.get("streetNumber") as string;
    const addressLine = formData.get("addressLine") as string;
    const apartmentInfo = formData.get("apartmentInfo") as string;
    const userId = formData.get("userId") as string;

    if (!name || !photo || !streetNumber || !addressLine || !userId) {
      return NextResponse.json({ error: "必須フィールドが不足しています" }, { status: 400 });
    }

    // 写真をSupabase Storageにアップロード
    const fileExt = photo.name.split(".").pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("resident-photos")
      .upload(fileName, photo, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("写真アップロードエラー:", uploadError);
      return NextResponse.json({ error: "写真のアップロードに失敗しました" }, { status: 500 });
    }

    // 写真のパブリックURLを取得
    const { data: urlData } = supabaseAdmin.storage.from("resident-photos").getPublicUrl(fileName);

    // 仮の住民票番号を生成（本来はデータベーストリガーで自動生成）
    const tempResidentNumber = Math.floor(Math.random() * 100000) + 1;

    // データベースに住民票データを保存
    const resident = await prisma.resident.create({
      data: {
        userId,
        name,
        photoUrl: urlData.publicUrl,
        streetNumber,
        addressLine,
        apartmentInfo: apartmentInfo || null,
        residentNumber: tempResidentNumber,
      },
    });

    return NextResponse.json(resident);
  } catch (error) {
    console.error("住民票作成エラー:", error);
    return NextResponse.json({ error: "住民票の作成に失敗しました" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "ユーザーIDが必要です" }, { status: 400 });
    }

    const residents = await prisma.resident.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(residents);
  } catch (error) {
    console.error("住民票取得エラー:", error);
    return NextResponse.json({ error: "住民票の取得に失敗しました" }, { status: 500 });
  }
}
