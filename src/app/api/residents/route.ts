import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
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
    // ファイルが存在しない場合は空配列を返す
    return [];
  }
}

async function writeResidentsData(residents: Resident[]): Promise<void> {
  const dataDir = path.dirname(DATA_FILE);
  await mkdir(dataDir, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(residents, null, 2));
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const photo = formData.get("photo") as File;
    const streetNumber = formData.get("streetNumber") as string;
    const addressLine = formData.get("addressLine") as string;
    const apartmentInfo = formData.get("apartmentInfo") as string;
    const userId = formData.get("userId") as string;
    const residentId = formData.get("residentId") as string; // 更新時に使用

    // 詳細なバリデーション
    if (!name || !streetNumber || !addressLine || !userId) {
      return NextResponse.json({ error: "必須フィールドが不足しています" }, { status: 400 });
    }

    let photoUrl = null;

    // 写真がアップロードされている場合のみ処理
    if (photo && photo.name && photo.size > 0) {
      try {
        // ローカルストレージに写真を保存
        const fileExt = photo.name.split(".").pop();
        const fileName = `${userId}_${Date.now()}.${fileExt}`;
        const uploadDir = path.join(process.cwd(), "public", "uploads", "resident-photos");

        // ディレクトリが存在しない場合は作成
        await mkdir(uploadDir, { recursive: true });

        const filePath = path.join(uploadDir, fileName);
        const bytes = await photo.arrayBuffer();
        const buffer = Buffer.from(bytes);

        await writeFile(filePath, buffer);

        // パブリックURLを生成
        photoUrl = `/uploads/resident-photos/${fileName}`;
      } catch (error) {
        console.error("写真保存エラー:", error);
        return NextResponse.json({ error: "写真の保存に失敗しました" }, { status: 500 });
      }
    }

    // 更新処理か新規作成処理かを判定
    if (residentId && residentId !== "null" && residentId !== "undefined") {
      // 有効なIDでない場合はエラーを返す
      if (!residentId || residentId === "" || residentId === "null" || residentId === "undefined") {
        return NextResponse.json({ error: "無効な市民票IDです" }, { status: 400 });
      }

      // 更新処理：既存データを更新（新レコードとして作成）
      const residents = await readResidentsData();
      const existingResident = residents.find((r) => r.id === residentId);

      if (!existingResident) {
        return NextResponse.json({ error: "市民票が見つかりません" }, { status: 404 });
      }

      // 新しいレコードとして作成（既存の写真URLを使用、新しい写真がある場合は更新）
      const finalPhotoUrl = photoUrl || existingResident.photoUrl;
      const tempResidentNumber = Math.floor(Math.random() * 100000) + 1;

      const resident: Resident = {
        id: randomUUID(),
        userId,
        name,
        photoUrl: finalPhotoUrl,
        streetNumber,
        addressLine,
        apartmentInfo: apartmentInfo || null,
        residentNumber: tempResidentNumber,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      residents.push(resident);
      await writeResidentsData(residents);

      return NextResponse.json(resident);
    } else {
      // 新規作成処理：写真が必須
      if (!photoUrl) {
        return NextResponse.json({ error: "写真のアップロードが必要です" }, { status: 400 });
      }

      // 仮の市民票番号を生成
      const tempResidentNumber = Math.floor(Math.random() * 100000) + 1;

      // JSONファイルに市民票データを保存
      const residents = await readResidentsData();
      const resident: Resident = {
        id: randomUUID(),
        userId,
        name,
        photoUrl,
        streetNumber,
        addressLine,
        apartmentInfo: apartmentInfo || null,
        residentNumber: tempResidentNumber,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      residents.push(resident);
      await writeResidentsData(residents);

      return NextResponse.json(resident);
    }
  } catch (error) {
    console.error("市民票作成エラー:", error);
    return NextResponse.json({ error: "市民票の作成に失敗しました" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "ユーザーIDが必要です" }, { status: 400 });
    }

    const allResidents = await readResidentsData();
    const residents = allResidents
      .filter((r) => r.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(residents);
  } catch (error) {
    console.error("市民票取得エラー:", error);
    return NextResponse.json({ error: "市民票の取得に失敗しました" }, { status: 500 });
  }
}
