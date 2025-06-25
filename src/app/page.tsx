"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import ResidentForm from "@/components/ResidentForm";
import { Resident, ResidentData } from "@/types/resident";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [resident, setResident] = useState<Resident | null>(null);
  const [svgContent, setSvgContent] = useState<string>("");
  const [isGenerated, setIsGenerated] = useState(false);

  const searchParams = useSearchParams();
  const residentId = searchParams.get("id");

  const generateSvg = async (residentData: Resident) => {
    try {
      const response = await fetch("/api/generate-resident-card", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resident: residentData,
        }),
      });

      if (!response.ok) {
        throw new Error("SVG生成に失敗しました");
      }

      const svg = await response.text();
      setSvgContent(svg);
    } catch (error) {
      console.error("SVG生成エラー:", error);
      alert("市民票の生成に失敗しました");
    }
  };

  const fetchResident = async (id: string) => {
    try {
      const response = await fetch(`/api/residents/${id}`);
      if (!response.ok) {
        throw new Error("市民票の取得に失敗しました");
      }
      const residentData = await response.json();
      setResident(residentData);
      await generateSvg(residentData);
      setIsGenerated(true);
    } catch (error) {
      console.error("市民票取得エラー:", error);
      alert("市民票の取得に失敗しました");
    }
  };

  // クエリパラメータからデータを読み込み
  useEffect(() => {
    if (residentId) {
      fetchResident(residentId);
    }
  }, [residentId, fetchResident]);

  const handleFormSubmit = async (data: ResidentData) => {
    setLoading(true);
    try {
      // 暫定的なユーザーID（認証実装後に実際のユーザーIDに変更）
      const tempUserId = "temp-user-" + Date.now();

      const formData = new FormData();
      formData.append("name", data.name);
      // 写真が選択されている場合のみ追加
      if (data.photo) {
        formData.append("photo", data.photo);
      }
      formData.append("streetNumber", data.streetNumber);
      formData.append("addressLine", data.addressLine);
      formData.append("apartmentInfo", data.apartmentInfo || "");
      formData.append("userId", tempUserId);

      // 更新の場合は既存の市民票IDを追加
      if (resident?.id) {
        formData.append("residentId", resident.id.toString());
      }

      const response = await fetch("/api/residents", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("市民票の処理に失敗しました");
      }

      const newResident = await response.json();
      setResident(newResident);
      await generateSvg(newResident);
      setIsGenerated(true);
    } catch (error) {
      console.error("エラー:", error);
      alert("市民票の処理に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!svgContent || !resident) return;

    const svgBlob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = 1080;
      canvas.height = 681;

      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `市民票_${resident.name}_${resident.residentNumber}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
        }, "image/png");
      }

      URL.revokeObjectURL(svgUrl);
    };

    img.src = svgUrl;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">市民票ジェネレータ</h1>
          <p className="text-gray-600">架空の市の市民票を作成しましょう</p>
        </header>

        {/* レスポンシブレイアウト */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* フォーム部分 */}
          <div className="w-full lg:w-1/2">
            <ResidentForm
              onSubmit={handleFormSubmit}
              loading={loading}
              initialData={
                resident
                  ? {
                      name: resident.name,
                      photo: null, // ファイルは再設定が必要
                      streetNumber: resident.streetNumber,
                      addressLine: resident.addressLine,
                      apartmentInfo: resident.apartmentInfo || "",
                    }
                  : undefined
              }
              buttonText={isGenerated ? "更新" : "生成"}
            />
          </div>

          {/* 結果表示部分 */}
          <div className="w-full lg:w-1/2">
            {isGenerated && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="mb-4 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800">生成結果</h2>
                  <button
                    onClick={handleDownload}
                    disabled={!svgContent}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    PNGダウンロード
                  </button>
                </div>

                {svgContent ? (
                  <div className="w-full overflow-auto border rounded-lg">
                    <div dangerouslySetInnerHTML={{ __html: svgContent }} />
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-48">
                    <div className="text-lg text-gray-600">市民票を生成中...</div>
                  </div>
                )}
              </div>
            )}

            {!isGenerated && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-center items-center h-48">
                  <div className="text-lg text-gray-600">
                    フォームに入力して「生成」ボタンを押してください
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
