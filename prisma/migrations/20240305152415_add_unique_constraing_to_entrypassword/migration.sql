/*
  Warnings:

  - A unique constraint covering the columns `[entryId,passwordId]` on the table `EntryPassword` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "EntryPassword_entryId_passwordId_key" ON "EntryPassword"("entryId", "passwordId");
