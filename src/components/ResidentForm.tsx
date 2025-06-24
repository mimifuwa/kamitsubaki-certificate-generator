"use client";

import { useState } from "react";

import { ResidentData, STREET_OPTIONS } from "@/types/resident";

interface ResidentFormProps {
  onSubmit: (data: ResidentData) => void;
  loading?: boolean;
}

export default function ResidentForm({ onSubmit, loading = false }: ResidentFormProps) {
  const [formData, setFormData] = useState<ResidentData>({
    name: "",
    photo: null,
    streetNumber: "零番街",
    addressLine: "",
    apartmentInfo: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, photo: file }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">住民票作成</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 氏名 */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            氏名 *
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="山田 太郎"
          />
        </div>

        {/* 顔写真 */}
        <div>
          <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-2">
            顔写真 *
          </label>
          <input
            type="file"
            id="photo"
            required
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handlePhotoChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {formData.photo && (
            <p className="mt-2 text-sm text-gray-600">選択されたファイル: {formData.photo.name}</p>
          )}
        </div>

        {/* 住所 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800">住所</h3>

          {/* 街番号 */}
          <div>
            <label htmlFor="streetNumber" className="block text-sm font-medium text-gray-700 mb-2">
              街番号 *
            </label>
            <select
              id="streetNumber"
              required
              value={formData.streetNumber}
              onChange={(e) => setFormData((prev) => ({ ...prev, streetNumber: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STREET_OPTIONS.map((street) => (
                <option key={street} value={street}>
                  {street}
                </option>
              ))}
            </select>
          </div>

          {/* 番地住所 */}
          <div>
            <label htmlFor="addressLine" className="block text-sm font-medium text-gray-700 mb-2">
              番地住所 *
            </label>
            <input
              type="text"
              id="addressLine"
              required
              value={formData.addressLine}
              onChange={(e) => setFormData((prev) => ({ ...prev, addressLine: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1-2-3"
            />
          </div>

          {/* マンション名・部屋番号 */}
          <div>
            <label htmlFor="apartmentInfo" className="block text-sm font-medium text-gray-700 mb-2">
              マンション名・部屋番号（任意）
            </label>
            <input
              type="text"
              id="apartmentInfo"
              value={formData.apartmentInfo}
              onChange={(e) => setFormData((prev) => ({ ...prev, apartmentInfo: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="サンプルマンション 101号室"
            />
          </div>
        </div>

        {/* 提出ボタン */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "作成中..." : "住民票を作成"}
          </button>
        </div>
      </form>
    </div>
  );
}
