"use client";

import { useCallback, useState } from "react";

import ResidentForm from "@/components/ResidentForm";
import { Resident, ResidentData } from "@/types/resident";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [resident, setResident] = useState<Resident | null>(null);
  const [svgContent, setSvgContent] = useState<string>("");
  const [isGenerated, setIsGenerated] = useState(false);

  const generateSvg = useCallback(async (residentData: Resident) => {
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
  }, []);

  // クエリパラメータ機能は削除（localStorage管理のため）
  // useEffect(() => {
  //   if (residentId) {
  //     fetchResident(residentId);
  //   }
  // }, [residentId, fetchResident]);

  const handleFormSubmit = async (data: ResidentData) => {
    setLoading(true);
    try {
      // 暫定的なユーザーID（認証実装後に実際のユーザーIDに変更）
      const tempUserId = "temp-user-" + Date.now();

      // 写真をBase64に変換
      let photoBase64 = "";
      if (data.photo) {
        const compressImage = (file: File): Promise<string> => {
          return new Promise((resolve, reject) => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const img = new Image();

            img.onload = () => {
              // アスペクト比を保持しながらリサイズ
              let { width, height } = img;
              const maxWidth = 800;
              const maxHeight = 800;

              if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width = Math.floor(width * ratio);
                height = Math.floor(height * ratio);
              }

              canvas.width = width;
              canvas.height = height;

              // 背景を白で塗りつぶし（JPEGの透明度対応）
              if (ctx) {
                ctx.fillStyle = "#FFFFFF";
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);
              }

              // 品質を調整してサイズを最適化
              let quality = 0.8;
              let base64 = canvas.toDataURL("image/jpeg", quality);

              // サイズが大きすぎる場合は品質を下げる
              const maxSizeBytes = 500 * 1024; // 500KB
              while (base64.length > maxSizeBytes && quality > 0.1) {
                quality -= 0.1;
                base64 = canvas.toDataURL("image/jpeg", quality);
              }

              resolve(base64);
            };

            img.onerror = () => reject(new Error("画像の読み込みに失敗しました"));
            img.src = URL.createObjectURL(file);
          });
        };

        photoBase64 = await compressImage(data.photo);
      }

      const requestBody = {
        name: data.name,
        photoBase64,
        streetNumber: data.streetNumber,
        addressLine: data.addressLine,
        apartmentInfo: data.apartmentInfo || "",
        userId: tempUserId,
        residentId: resident?.id || null,
      };

      const response = await fetch("/api/residents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
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
      canvas.height = 681.0560747664;

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
    <div className="py-8">
      <div className="container mx-auto max-w-7xl px-4">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">神椿市市民票ジェネレータ</h1>
          <p className="text-gray-600">神椿市の市民票を作成できます</p>
        </header>

        {/* レスポンシブレイアウト */}
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8">
          {/* フォーム部分 */}
          <div className="w-full">
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
          <div className="w-full">
            {isGenerated && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="mb-4 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800">生成結果</h2>
                  <button
                    onClick={handleDownload}
                    disabled={!svgContent}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    PNGダウンロード
                  </button>
                </div>

                {svgContent ? (
                  <div
                    className="w-full"
                    style={{
                      perspective: "1000px",
                    }}
                  >
                    <div
                      className="w-full cursor-pointer relative"
                      style={{
                        lineHeight: 0,
                        transformStyle: "preserve-3d",
                        transition: "all 0.3s ease-out",
                        transform: "rotateX(0deg) rotateY(0deg) scale(1)",
                        borderRadius: "100vw",
                        overflow: "visible",
                        boxShadow:
                          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                      }}
                      onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        const centerX = rect.width / 2;
                        const centerY = rect.height / 2;

                        const rotateY = ((x - centerX) / centerX) * 5; // -5から5度
                        const rotateX = ((centerY - y) / centerY) * 5; // -5から5度

                        // 3D変形を適用
                        e.currentTarget.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
                        e.currentTarget.style.boxShadow = "0 25px 50px -12px rgba(0, 0, 0, 0.25)";

                        // 光エフェクトの位置を更新
                        const lightOverlay = e.currentTarget.querySelector(
                          ".light-overlay"
                        ) as HTMLElement;
                        if (lightOverlay) {
                          const xPercent = (x / rect.width) * 100;
                          const yPercent = (y / rect.height) * 100;
                          lightOverlay.style.background = `
                            radial-gradient(
                              600px circle at ${xPercent}% ${yPercent}%,
                              rgba(255, 255, 255, 0.4) 0%,
                              rgba(255, 255, 255, 0.2) 20%,
                              rgba(255, 255, 255, 0.1) 40%,
                              transparent 70%
                            )
                          `;
                          lightOverlay.style.opacity = "1";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
                        e.currentTarget.style.boxShadow =
                          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";

                        // 光エフェクトを非表示
                        const lightOverlay = e.currentTarget.querySelector(
                          ".light-overlay"
                        ) as HTMLElement;
                        if (lightOverlay) {
                          lightOverlay.style.opacity = "0";
                        }
                      }}
                    >
                      {/* SVGコンテンツ */}
                      <div
                        dangerouslySetInnerHTML={{
                          __html: svgContent.replace(/<svg([^>]*?)>/i, (_match, attributes) => {
                            // 既存のサイズ属性を削除
                            const newAttributes = attributes
                              .replace(/\s*width="[^"]*"/gi, "")
                              .replace(/\s*height="[^"]*"/gi, "");

                            return `<svg${newAttributes} width="100%" height="auto" style="display: block; max-width: 100%;">`;
                          }),
                        }}
                      />

                      {/* 光エフェクトオーバーレイ */}
                      <div
                        className="light-overlay"
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          pointerEvents: "none",
                          opacity: 0,
                          transition: "opacity 0.3s ease-out",
                          mixBlendMode: "overlay",
                          borderRadius: "8px",
                        }}
                      />

                      {/* ホログラムエフェクト */}
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          pointerEvents: "none",
                          background: `
                            linear-gradient(
                              45deg,
                              transparent 30%,
                              rgba(255, 255, 255, 0.1) 50%,
                              transparent 70%
                            )
                          `,
                          opacity: 0.3,
                          borderRadius: "8px",
                        }}
                      />
                    </div>
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
