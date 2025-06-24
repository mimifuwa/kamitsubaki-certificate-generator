"use client";

import { useEffect, useState } from "react";

import { Resident } from "@/types/resident";

interface PreviewSectionProps {
  residentData: Resident;
  onDownload: () => void;
  onReset: () => void;
}

export default function PreviewSection({ residentData, onDownload, onReset }: PreviewSectionProps) {
  const [svgContent, setSvgContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateSvg = async () => {
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
      } finally {
        setLoading(false);
      }
    };

    generateSvg();
  }, [residentData]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold mb-4">住民票プレビュー</h2>
        <div className="space-x-4">
          <button
            onClick={onDownload}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
          >
            SVGダウンロード
          </button>
          <button
            onClick={onReset}
            className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
          >
            新しく作成
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-lg">
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="text-lg text-gray-600">住民票を生成中...</div>
          </div>
        ) : svgContent ? (
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
            <div className="text-lg text-red-600">住民票の生成に失敗しました</div>
          </div>
        )}
      </div>
    </div>
  );
}
