-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AssetField" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order" INTEGER NOT NULL,
    "helperText" TEXT NOT NULL DEFAULT '',
    "displayOnTable" BOOLEAN NOT NULL DEFAULT false,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "unique" INTEGER NOT NULL DEFAULT 0,
    "assetId" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    CONSTRAINT "AssetField_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AssetField_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "Field" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_AssetField" ("assetId", "displayOnTable", "fieldId", "helperText", "hidden", "id", "order") SELECT "assetId", "displayOnTable", "fieldId", "helperText", "hidden", "id", "order" FROM "AssetField";
DROP TABLE "AssetField";
ALTER TABLE "new_AssetField" RENAME TO "AssetField";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
