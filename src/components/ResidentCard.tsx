import { Resident } from "@/types/resident";

interface ResidentCardProps {
  resident: Resident;
  preview?: boolean;
}

export default function ResidentCard({ resident, preview = false }: ResidentCardProps) {
  const formatAddress = () => {
    let address = `${resident.streetNumber} ${resident.addressLine}`;
    if (resident.apartmentInfo) {
      address += `\n${resident.apartmentInfo}`;
    }
    return address;
  };

  return (
    <div
      className={`bg-white border-2 border-gray-800 ${preview ? "max-w-lg mx-auto" : "w-[794px] h-[1123px]"}`}
      style={{
        fontFamily: "serif",
        fontSize: preview ? "14px" : "16px",
        lineHeight: "1.6",
      }}
    >
      {/* ヘッダー */}
      <div className="border-b-2 border-gray-800 p-6 text-center">
        <h1 className="text-3xl font-bold mb-2">市民票</h1>
        <div className="flex justify-between items-center">
          <div className="text-left">
            <p className="text-sm">発行日: {new Date().toLocaleDateString("ja-JP")}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">
              No. {resident.residentNumber.toString().padStart(6, "0")}
            </p>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="p-8 space-y-8">
        {/* 基本情報セクション */}
        <div className="grid grid-cols-3 gap-8">
          {/* 左側: 個人情報 */}
          <div className="col-span-2 space-y-6">
            {/* 氏名 */}
            <div className="border-b border-gray-300 pb-4">
              <label className="block text-sm font-medium text-gray-600 mb-2">氏名</label>
              <p className="text-2xl font-bold">{resident.name}</p>
            </div>

            {/* 住所 */}
            <div className="border-b border-gray-300 pb-4">
              <label className="block text-sm font-medium text-gray-600 mb-2">住所</label>
              <div className="text-lg">
                <p>○○市</p>
                <p className="whitespace-pre-line">{formatAddress()}</p>
              </div>
            </div>

            {/* 登録日 */}
            <div className="border-b border-gray-300 pb-4">
              <label className="block text-sm font-medium text-gray-600 mb-2">登録日</label>
              <p className="text-lg">{new Date(resident.createdAt).toLocaleDateString("ja-JP")}</p>
            </div>
          </div>

          {/* 右側: 写真 */}
          <div className="flex flex-col items-center">
            <div className="w-32 h-40 border-2 border-gray-400 bg-gray-50 flex items-center justify-center">
              {resident.photoUrl ? (
                <img
                  src={resident.photoUrl}
                  alt="住民写真"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400 text-sm text-center">写真</span>
              )}
            </div>
          </div>
        </div>

        {/* 備考欄 */}
        <div className="border-t-2 border-gray-800 pt-6">
          <label className="block text-sm font-medium text-gray-600 mb-4">備考</label>
          <div className="min-h-[100px] border border-gray-300 p-4">{/* 空白の備考欄 */}</div>
        </div>

        {/* フッター */}
        <div className="border-t border-gray-300 pt-6 text-center">
          <div className="text-right">
            <p className="text-lg font-medium">○○市長</p>
            <div className="mt-4 w-24 h-24 border border-gray-400 ml-auto flex items-center justify-center">
              <span className="text-xs text-gray-400">印</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
