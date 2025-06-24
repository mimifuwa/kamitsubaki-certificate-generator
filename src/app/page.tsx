"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import ResidentForm from "@/components/ResidentForm";
import { ResidentData } from "@/types/resident";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleFormSubmit = async (data: ResidentData) => {
    setLoading(true);
    try {
      // 暫定的なユーザーID（認証実装後に実際のユーザーIDに変更）
      const tempUserId = "temp-user-" + Date.now();

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("photo", data.photo!);
      formData.append("streetNumber", data.streetNumber);
      formData.append("addressLine", data.addressLine);
      formData.append("apartmentInfo", data.apartmentInfo || "");
      formData.append("userId", tempUserId);

      const response = await fetch("/api/residents", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("住民票の作成に失敗しました");
      }

      const resident = await response.json();

      // プレビューページに遷移（住民票IDをクエリパラメータとして渡す）
      router.push(`/preview?id=${resident.id}`);
    } catch (error) {
      console.error("エラー:", error);
      alert("住民票の作成に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">住民票ジェネレータ</h1>
          <p className="text-gray-600">架空の市の住民票を作成しましょう</p>
        </header>

        <ResidentForm onSubmit={handleFormSubmit} loading={loading} />
      </div>
    </div>
  );
}
