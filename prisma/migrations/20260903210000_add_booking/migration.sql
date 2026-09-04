-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED', 'EXPIRED');

-- AlterTable
ALTER TABLE "Location" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "requestedByUserId" TEXT NOT NULL,
    "caregiverUserId" TEXT,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledPickupAt" TIMESTAMPTZ(3) NOT NULL,
    "pickupLocationId" TEXT NOT NULL,
    "activityLocationId" TEXT,
    "dropoffLocationId" TEXT NOT NULL,
    "estimatedDurationMin" INTEGER NOT NULL,
    "notes" TEXT,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Booking_status_scheduledPickupAt_idx" ON "Booking"("status", "scheduledPickupAt");

-- CreateIndex
CREATE INDEX "Booking_requestedByUserId_createdAt_idx" ON "Booking"("requestedByUserId", "createdAt");

-- CreateIndex
CREATE INDEX "Booking_childId_scheduledPickupAt_idx" ON "Booking"("childId", "scheduledPickupAt");

-- CreateIndex
CREATE INDEX "Booking_pickupLocationId_idx" ON "Booking"("pickupLocationId");

-- CreateIndex
CREATE INDEX "Booking_activityLocationId_idx" ON "Booking"("activityLocationId");

-- CreateIndex
CREATE INDEX "Booking_dropoffLocationId_idx" ON "Booking"("dropoffLocationId");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_requestedByUserId_fkey" FOREIGN KEY ("requestedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_caregiverUserId_fkey" FOREIGN KEY ("caregiverUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_pickupLocationId_fkey" FOREIGN KEY ("pickupLocationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_activityLocationId_fkey" FOREIGN KEY ("activityLocationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_dropoffLocationId_fkey" FOREIGN KEY ("dropoffLocationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
