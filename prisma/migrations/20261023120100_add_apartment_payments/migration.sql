-- CreateTable
CREATE TABLE "apartment_payments" (
    "id" SERIAL NOT NULL,
    "apartment_id" INTEGER NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "paid_at" DATE NOT NULL,
    "method" VARCHAR(100),
    "note" TEXT,
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "apartment_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "apartment_payments_apartment_id_idx" ON "apartment_payments"("apartment_id");

-- AddForeignKey
ALTER TABLE "apartment_payments" ADD CONSTRAINT "apartment_payments_apartment_id_fkey" FOREIGN KEY ("apartment_id") REFERENCES "apartments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apartment_payments" ADD CONSTRAINT "apartment_payments_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
