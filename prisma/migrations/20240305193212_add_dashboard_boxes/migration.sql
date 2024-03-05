-- CreateTable
CREATE TABLE "DashboardBox" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "boxType" TEXT NOT NULL,
    "meta" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
