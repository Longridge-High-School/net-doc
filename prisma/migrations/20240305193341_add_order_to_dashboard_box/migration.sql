/*
  Warnings:

  - Added the required column `order` to the `DashboardBox` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DashboardBox" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "boxType" TEXT NOT NULL,
    "meta" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_DashboardBox" ("boxType", "createdAt", "id", "meta", "updatedAt") SELECT "boxType", "createdAt", "id", "meta", "updatedAt" FROM "DashboardBox";
DROP TABLE "DashboardBox";
ALTER TABLE "new_DashboardBox" RENAME TO "DashboardBox";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
