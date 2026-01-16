/*
  Warnings:

  - A unique constraint covering the columns `[number]` on the table `Truck` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Truck_number_key" ON "Truck"("number");
