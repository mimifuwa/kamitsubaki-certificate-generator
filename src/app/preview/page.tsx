"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Resident } from "@/types/resident";

export default function PreviewPage() {
  const [resident, setResident] = useState<Resident | null>(null);
  const [svgContent, setSvgContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const searchParams = useSearchParams();
  const router = useRouter();
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
      setError("住民票の生成に失敗しました");
    }
  };

  useEffect(() => {
    if (!residentId) {
      setError("住民票IDが指定されていません");
      setLoading(false);
      return;
    }

    const fetchResident = async () => {
      try {
        const response = await fetch(`/api/residents/${residentId}`);

        if (!response.ok) {
          throw new Error("住民票の取得に失敗しました");
        }

        const residentData = await response.json();
        setResident(residentData);

        // 住民票データが取得できたらSVGを生成
        await generateSvg(residentData);
        setLoading(false);
      } catch (error) {
        console.error("住民票取得エラー:", error);
        setError("住民票の取得に失敗しました");
        setLoading(false);
      }
    };

    fetchResident();
  }, [residentId]);

  const handleDownload = () => {
    if (!svgContent || !resident) return;

    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `住民票_${resident.name}_${resident.residentNumber}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleBackToForm = () => {
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-96">
            <div className="text-lg text-gray-600">住民票を読み込み中...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">エラー</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={handleBackToForm}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">住民票プレビュー</h1>
            <div className="space-x-4">
              <button
                onClick={handleDownload}
                disabled={!svgContent}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                SVGダウンロード
              </button>
              <button
                onClick={handleBackToForm}
                className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
              >
                新しく作成
              </button>
            </div>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg">
            {svgContent ? (
              <div className="w-full overflow-auto" style={{ maxHeight: "800px" }}>
                <div
                  dangerouslySetInnerHTML={{ __html: svgContent }}
                  className="w-full"
                  style={{
                    transform: "scale(0.5)",
                    transformOrigin: "top left",
                    width: "200%",
                  }}
                />
              </div>
            ) : (
              <div className="flex justify-center items-center h-96">
                <div className="text-lg text-gray-600">住民票を生成中...</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
