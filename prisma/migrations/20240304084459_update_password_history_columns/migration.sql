/*
  Warnings:

  - You are about to drop the column `previousBody` on the `PasswordHistory` table. All the data in the column will be lost.
  - Added the required column `previousNotes` to the `PasswordHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `previousPassword` to the `PasswordHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `previousUsername` to the `PasswordHistory` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PasswordHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "previousTitle" TEXT NOT NULL,
    "previousUsername" TEXT NOT NULL,
    "previousPassword" TEXT NOT NULL,
    "previousNotes" TEXT NOT NULL,
    "editedById" TEXT NOT NULL,
    "passwordId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PasswordHistory_editedById_fkey" FOREIGN KEY ("editedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PasswordHistory_passwordId_fkey" FOREIGN KEY ("passwordId") REFERENCES "Password" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PasswordHistory" ("createdAt", "editedById", "id", "passwordId", "previousTitle", "updatedAt") SELECT "createdAt", "editedById", "id", "passwordId", "previousTitle", "updatedAt" FROM "PasswordHistory";
DROP TABLE "PasswordHistory";
ALTER TABLE "new_PasswordHistory" RENAME TO "PasswordHistory";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
