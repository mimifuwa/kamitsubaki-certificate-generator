import { Resident } from "@/types/resident";

interface ResidentCardForSatoriProps {
  resident: Resident;
  photoBase64?: string;
  logoBase64?: string;
}

export default function ResidentCardForSatori({
  resident,
  photoBase64,
}: ResidentCardForSatoriProps) {
  // 共通のflexスタイル
  const flexStyle = { display: "flex" as const };

  return (
    <div
      style={{
        ...flexStyle,
        width: "1080px",
        height: "681.0560747664px",
        backgroundColor: "#FFFEF9",
        borderRadius: "40.1214953271px",
        overflow: "hidden",
        fontFamily: "Noto Serif JP, serif",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        fontSize: "16px",
        lineHeight: "1.6",
        flexDirection: "column",
        containerType: "size",
        position: "relative",
      }}
    >
      <div
        style={{
          ...flexStyle,
          position: "absolute",
          width: "1080px",
          height: "681.0560747664px",
          bottom: "50%",
          left: "50%",
          transform: "translateX(-50%) translateY(50%)",
        }}
      >
        <img
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: "0",
            left: "0",
          }}
          src={`${process.env.BASE_URL}/10.png`}
          alt="背景パターン"
        />
      </div>

      {/* 右側の飾り */}
      <div
        style={{
          ...flexStyle,
          position: "absolute",
          right: "-50px",
          top: "280px",
          height: "400px",
          width: "140px",
          transform: "rotate(-30deg)",
          background: "linear-gradient(-100deg, #A978AF, #DE79A4, #F5A9BD)",
        }}
      ></div>

      {/* 背景の神椿市市民票 */}
      <div
        style={{
          ...flexStyle,
          position: "absolute",
          width: "1016px",
          height: "617.0560747664px",
          top: "32px",
          left: "32px",
        }}
      >
        <img
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: "0",
            left: "0",
          }}
          src={`${process.env.BASE_URL}/5.png`}
          alt="神椿市市民票"
        />
      </div>

      {/* 交付日 */}
      <div
        style={{
          ...flexStyle,
          flexDirection: "column",
          alignItems: "center",
          position: "absolute",
          top: "64px",
          right: "64px",
          fontFamily: "Noto Sans JP",
          color: "#74705E",
        }}
      >
        <div
          style={{
            ...flexStyle,
            flexDirection: "column",
            alignItems: "flex-end",
            width: "100%",
          }}
        >
          <div style={{ ...flexStyle, fontSize: "20px" }}>
            {(() => {
              const d = new Date();
              return `${d.getFullYear()}年 ${d.getMonth() + 1}月 ${d.getDate()}日`;
            })()}
            交付
          </div>
          <div style={{ ...flexStyle, fontSize: "20px", fontWeight: "bold" }}>
            No. {resident.residentNumber.toString().padStart(6, "0")}
          </div>
        </div>
      </div>

      {/* 顔写真 */}
      <div
        style={{
          ...flexStyle,
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          flex: 1,
        }}
      >
        {photoBase64 ? (
          <div
            style={{
              ...flexStyle,
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              width: "500px",
              height: "500px",
            }}
          >
            <img
              src={`${process.env.BASE_URL}/2.png`}
              style={{
                width: "113%",
                height: "113%",
                borderRadius: "100vw",
                objectFit: "cover",
                position: "absolute",
              }}
              alt="写真フレーム"
            />
            <img
              src={photoBase64}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "100vw",
                objectFit: "cover",
                position: "absolute",
              }}
              alt="住民の写真"
            />
          </div>
        ) : (
          <div style={{ ...flexStyle, color: "#9ca3af", fontSize: "14px" }}>写真</div>
        )}
      </div>

      {/* 神椿市復興課 */}
      <div
        style={{
          ...flexStyle,
          position: "absolute",
          width: "70px",
          height: "221.2px",
          top: "120px",
          right: "205px",
        }}
      >
        <img
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            position: "absolute",
            top: "0",
            left: "0",
          }}
          src={`${process.env.BASE_URL}/6.png`}
          alt="神椿市復興課"
        />
      </div>

      {/* 市章 */}
      <div
        style={{
          ...flexStyle,
          position: "absolute",
          width: "140px",
          height: "140px",
          top: "70px",
          left: "650px",
        }}
      >
        <img
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            position: "absolute",
            top: "0",
            left: "0",
          }}
          src={`${process.env.BASE_URL}/3.png`}
          alt="市章"
        />
      </div>

      {/* バーコード */}
      <div
        style={{
          ...flexStyle,
          position: "absolute",
          width: "250px",
          height: "18px",
          top: "170px",
          left: "64px",
        }}
      >
        <img
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: "0",
            left: "0",
          }}
          src={`${process.env.BASE_URL}/8.png`}
          alt="バーコード"
        />
      </div>

      <div
        style={{
          ...flexStyle,
          position: "absolute",
          width: "150px",
          height: "16px",
          top: "42px",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <img
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: "0",
            left: "0",
          }}
          src={`${process.env.BASE_URL}/9.png`}
          alt="装飾線"
        />
      </div>
      <div
        style={{
          ...flexStyle,
          position: "absolute",
          width: "150px",
          height: "16px",
          bottom: "42px",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <img
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: "0",
            left: "0",
          }}
          src={`${process.env.BASE_URL}/9.png`}
          alt="装飾線"
        />
      </div>

      {/* 市長印 */}
      <div
        style={{
          ...flexStyle,
          position: "absolute",
          width: "220px",
          height: "220px",
          top: "400px",
          left: "650px",
        }}
      >
        <img
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            position: "absolute",
            top: "0",
            left: "0",
          }}
          src={`${process.env.BASE_URL}/4.png`}
          alt="市長印"
        />
      </div>

      {/* 右下の飾り */}
      <div
        style={{
          ...flexStyle,
          position: "absolute",
          width: "25px",
          height: "300px",
          right: "32px",
          bottom: "-27px",
        }}
      >
        <img
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            position: "absolute",
            top: "0",
            left: "0",
          }}
          src={`${process.env.BASE_URL}/7.png`}
          alt="装飾"
        />
      </div>

      {/* 住所 */}
      <div
        style={{
          ...flexStyle,
          flexDirection: "column",
          position: "absolute",
          left: "64px",
          bottom: "56px",
        }}
      >
        <div
          style={{
            ...flexStyle,
            flexDirection: "column",
            fontSize: "60px",
            marginBottom: "16px",
            color: "#74705E",
            textShadow: "2px 2px 8px #e5e1d6, 0 0 4px #ffffff",
          }}
        >
          <div
            style={{
              ...flexStyle,
              lineHeight: "1.1",
            }}
          >
            KAMITSUBAKI
          </div>
          <div
            style={{
              ...flexStyle,
              lineHeight: "1.1",
            }}
          >
            CITY
          </div>
        </div>
        <div
          style={{
            ...flexStyle,
            fontSize: "24px",
            marginBottom: "6px",
            letterSpacing: "24px",
            fontWeight: 600,
            color: "#74705E",
          }}
        >
          住所
        </div>
        <div
          style={{
            ...flexStyle,
            fontSize: "30px",
            lineHeight: "1.1",
            color: "#74705E",
            fontWeight: 600,
          }}
        >{`${resident.streetNumber} ${resident.addressLine}`}</div>
        <div
          style={{
            ...flexStyle,
            fontSize: "30px",
            lineHeight: "1.1",
            color: "#74705E",
            fontWeight: 600,
          }}
        >
          {resident.apartmentInfo ?? ""}
        </div>
      </div>

      {/* 個人情報 */}
      <div
        style={{
          ...flexStyle,
          flexDirection: "column",
          flex: 2,
          gap: "24px",
          position: "absolute",
          top: "56px",
          left: "64px",
        }}
      >
        {/* 氏名 */}
        <div style={{ ...flexStyle, flexDirection: "column", color: "#6E6638" }}>
          <div
            style={{
              ...flexStyle,
              fontSize: "24px",
              marginBottom: "6px",
              letterSpacing: "24px",
              fontWeight: 600,
            }}
          >
            氏名
          </div>
          <div style={{ ...flexStyle, fontSize: "48px", fontWeight: 800, lineHeight: "1.1" }}>
            {resident.name}
          </div>
        </div>
      </div>

      {/* 上下の飾り */}
      <div
        style={{
          ...flexStyle,
          width: "100%",
          height: "36px",
          position: "absolute",
          top: "0",
        }}
      >
        {Array.from({ length: 15 }).map((_, i) => (
          <img
            key={i}
            src={`${process.env.BASE_URL}/1.png`}
            alt="Logo"
            style={{
              height: "100%",
              marginRight: "-3px",
            }}
          />
        ))}
      </div>
      <div
        style={{
          ...flexStyle,
          width: "100%",
          height: "36px",
          position: "absolute",
          bottom: "0",
        }}
      >
        {Array.from({ length: 15 }).map((_, i) => (
          <img
            key={i}
            src={`${process.env.BASE_URL}/1.png`}
            alt="Logo"
            style={{
              height: "100%",
              marginRight: "-3px",
              transform: "rotate(180deg)",
            }}
          />
        ))}
      </div>

      <div
        style={{
          ...flexStyle,
          flexDirection: "column",
          position: "absolute",
          left: "0",
          top: "0",
          width: "32px",
          height: "65%",
        }}
      >
        <div
          style={{
            ...flexStyle,
            width: "100%",
            height: "60%",
            background: "linear-gradient(135deg, #6AAFE7, #DAD0E9, #F7DACA)",
          }}
        ></div>
        <div
          style={{
            ...flexStyle,
            width: "100%",
            height: "40%",
            backgroundColor: "#74705E",
          }}
        ></div>
      </div>
    </div>
  );
}
