-- CreateTable
CREATE TABLE "bank_availability_stats" (
    "id" SERIAL NOT NULL,
    "bank_nip_code" TEXT NOT NULL,
    "time_window" TEXT NOT NULL,
    "availability_percentage" DOUBLE PRECISION,
    "confidence_level" TEXT NOT NULL,
    "total_transactions_in_window" INTEGER NOT NULL,
    "status_counts" JSONB NOT NULL,
    "last_calculated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_availability_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bank_availability_stats_last_calculated_at_idx" ON "bank_availability_stats"("last_calculated_at");

-- CreateIndex
CREATE UNIQUE INDEX "bank_availability_stats_bank_nip_code_time_window_key" ON "bank_availability_stats"("bank_nip_code", "time_window");
