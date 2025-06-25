"use client";

import { useEffect, useState } from "react";

import { ResidentData, STREET_OPTIONS } from "@/types/resident";

// ローカルストレージのキー
const LOCAL_STORAGE_KEY = "kamitsubaki-resident-form-data";

// 画像圧縮設定
const COMPRESS_CONFIG = {
  maxWidth: 800,
  maxHeight: 800,
  quality: 0.8,
  maxSizeKB: 500, // 最大500KB
};

interface SavedFormData {
  name: string;
  streetNumber: string;
  addressLine: string;
  apartmentInfo: string;
  photoBase64?: string;
  photoName?: string;
  photoType?: string;
}

// 画像を圧縮する関数
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // アスペクト比を保持しながらリサイズ
      let { width, height } = img;
      const { maxWidth, maxHeight } = COMPRESS_CONFIG;

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
      let quality = COMPRESS_CONFIG.quality;
      let base64 = canvas.toDataURL("image/jpeg", quality);

      // サイズが大きすぎる場合は品質を下げる
      const maxSizeBytes = COMPRESS_CONFIG.maxSizeKB * 1024;
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

// Base64をFileオブジェクトに変換
const base64ToFile = (base64: string, filename: string, mimeType: string): File => {
  const arr = base64.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] ?? mimeType;
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
};

// ローカルストレージから保存されたデータを読み込む
const loadFromLocalStorage = (): { data: Partial<ResidentData>; hasPhoto: boolean } => {
  if (typeof window === "undefined") return { data: {}, hasPhoto: false };
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!saved) return { data: {}, hasPhoto: false };

    const savedData: SavedFormData = JSON.parse(saved);
    const { photoBase64, photoName, photoType, ...formData } = savedData;

    let photo: File | null = null;
    let hasPhoto = false;

    if (photoBase64 && photoName && photoType) {
      try {
        photo = base64ToFile(photoBase64, photoName, photoType);
        hasPhoto = true;
      } catch (error) {
        console.error("保存された画像の復元に失敗しました:", error);
      }
    }

    return {
      data: { ...formData, photo },
      hasPhoto,
    };
  } catch (error) {
    console.error("ローカルストレージからの読み込みエラー:", error);
    return { data: {}, hasPhoto: false };
  }
};

// ローカルストレージにデータを保存する
const saveToLocalStorage = async (data: ResidentData) => {
  if (typeof window === "undefined") return;
  try {
    const saveData: SavedFormData = {
      name: data.name,
      streetNumber: data.streetNumber,
      addressLine: data.addressLine,
      apartmentInfo: data.apartmentInfo ?? "",
    };

    // 写真がある場合は圧縮して保存
    if (data.photo) {
      try {
        const compressedBase64 = await compressImage(data.photo);
        saveData.photoBase64 = compressedBase64;
        saveData.photoName = data.photo.name;
        saveData.photoType = data.photo.type;
      } catch (error) {
        console.error("画像圧縮エラー:", error);
      }
    }

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(saveData));
  } catch (error) {
    console.error("ローカルストレージへの保存エラー:", error);
  }
};

// ローカルストレージをクリアする
const clearLocalStorage = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch (error) {
    console.error("ローカルストレージのクリアエラー:", error);
  }
};

interface ResidentFormProps {
  onSubmit: (data: ResidentData) => void;
  loading?: boolean;
  initialData?: ResidentData;
  buttonText?: string;
}

export default function ResidentForm({
  onSubmit,
  loading = false,
  initialData,
  buttonText = "市民票を作成",
}: ResidentFormProps) {
  const [formData, setFormData] = useState<ResidentData>(() => {
    const defaultData = {
      name: "",
      photo: null,
      streetNumber: "",
      addressLine: "",
      apartmentInfo: "",
    };

    if (initialData) {
      return initialData;
    }

    return defaultData;
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // クライアントサイドでのみ実行される初期化処理
  useEffect(() => {
    setIsClient(true);

    if (!initialData) {
      // ローカルストレージから復元
      const { data: savedData } = loadFromLocalStorage();
      if (Object.keys(savedData).length > 0) {
        setFormData((prevData) => ({ ...prevData, ...savedData }));

        // 保存された画像がある場合はプレビューを設定
        if (savedData.photo) {
          compressImage(savedData.photo as File)
            .then(setPhotoPreview)
            .catch(() => setPhotoPreview(null));
        }
      }
    }
  }, [initialData]);

  // 初期データが変更された時にフォームを更新（ファイルは保持）
  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...initialData,
        photo: prev.photo, // 既に選択されているファイルは保持
      }));
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 新規作成時のみ写真を必須とする（初期データがない場合）
    if (!initialData && !formData.photo) {
      alert("顔写真を選択してください");
      return;
    }

    onSubmit(formData);
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (file) {
      setIsCompressing(true);
      try {
        // プレビュー用に圧縮した画像を生成
        const compressedBase64 = await compressImage(file);
        setPhotoPreview(compressedBase64);
      } catch (error) {
        console.error("画像圧縮エラー:", error);
        setPhotoPreview(null);
        alert("画像の処理に失敗しました。別の画像を選択してください。");
      } finally {
        setIsCompressing(false);
      }
    } else {
      setPhotoPreview(null);
    }

    setFormData((prev) => ({ ...prev, photo: file }));
  };

  // カスタムアップロードボタンのクリックハンドラ
  const handleUploadClick = () => {
    const fileInput = document.getElementById("photo") as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  // ドラッグ&ドロップハンドラ
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];

      // ファイルタイプをチェック
      if (!file.type.startsWith("image/")) {
        alert("画像ファイルを選択してください。");
        return;
      }

      // ファイル入力に設定して、既存のハンドラを呼び出す
      const fileInput = document.getElementById("photo") as HTMLInputElement;
      if (fileInput) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;

        // 既存のハンドラを呼び出す
        const event = new Event("change", { bubbles: true });
        fileInput.dispatchEvent(event);
      }
    }
  };

  // フォームデータの変更を監視してローカルストレージに保存
  useEffect(() => {
    if (isClient && !initialData) {
      // クライアントサイドかつ初期データがない場合のみ自動保存
      saveToLocalStorage(formData);
    }
  }, [formData, initialData, isClient]);

  // フォームに入力があるかどうかをチェック
  const hasFormContent = () => {
    return (
      formData.name.trim() !== "" ||
      formData.photo !== null ||
      formData.streetNumber !== "" ||
      formData.addressLine.trim() !== "" ||
      formData.apartmentInfo?.trim() !== ""
    );
  };

  // リセット機能
  const handleReset = () => {
    const defaultData = {
      name: "",
      photo: null,
      streetNumber: "",
      addressLine: "",
      apartmentInfo: "",
    };
    setFormData(defaultData);
    setPhotoPreview(null);

    // 初期データがない場合のみローカルストレージをクリア
    if (!initialData) {
      clearLocalStorage();
    }

    // ファイル入力もリセット
    const photoInput = document.getElementById("photo") as HTMLInputElement;
    if (photoInput) {
      photoInput.value = "";
    }
  };

  return (
    <div className="mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">市民票作成</h2>

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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="夜河 世界"
          />
        </div>

        {/* 顔写真 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">顔写真 *</label>

          {/* 非表示のinput */}
          <input
            type="file"
            id="photo"
            required={!formData.photo}
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handlePhotoChange}
            disabled={isCompressing}
            className="hidden"
          />

          {/* カスタムアップロードエリア */}
          {!formData.photo ? (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={handleUploadClick}
              className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors duration-200"
            >
              {isCompressing ? (
                <div className="flex items-center gap-3 w-full justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <p className="text-sm text-blue-600 font-medium">画像を圧縮中...</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">写真をアップロード</p>
                      <p className="text-xs text-gray-500">クリックまたはドラッグ&ドロップ</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200 cursor-pointer"
                  >
                    選択
                  </button>
                </>
              )}
            </div>
          ) : (
            isClient && (
              <div className="space-y-4">
                {/* アップロード済みステータス */}
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    {/* プレビュー */}
                    {photoPreview ? (
                      <div className="w-12 h-12 overflow-hidden rounded-lg border border-gray-300">
                        <img
                          src={photoPreview}
                          alt="アップロードされた写真のプレビュー"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-green-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-medium text-green-800">写真がアップロード済み</p>
                      <p className="text-xs text-green-600">{formData.photo.name}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleUploadClick}
                    disabled={isCompressing}
                    className="px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200 cursor-pointer"
                  >
                    変更
                  </button>
                </div>
              </div>
            )
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="" disabled>
                選択してください
              </option>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="霞が原 白苑２７６"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="ヰ世界救済教団 歌修院 教主居室"
            />
          </div>
        </div>

        {/* ボタンエリア */}
        <div className="pt-4 space-y-3">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "処理中..." : buttonText}
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={loading || !hasFormContent()}
            className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {initialData ? "入力内容をクリア" : "リセット"}
          </button>
        </div>
      </form>
    </div>
  );
}
