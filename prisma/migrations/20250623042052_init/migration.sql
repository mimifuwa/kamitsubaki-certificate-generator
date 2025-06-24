-- CreateTable
CREATE TABLE "resident_counter" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "current_number" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resident_counter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "residents" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "resident_number" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "photo_url" TEXT NOT NULL,
    "street_number" TEXT NOT NULL,
    "address_line" TEXT NOT NULL,
    "apartment_info" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "residents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "residents_user_id_idx" ON "residents"("user_id");

-- CreateIndex
CREATE INDEX "residents_created_at_idx" ON "residents"("created_at" DESC);
