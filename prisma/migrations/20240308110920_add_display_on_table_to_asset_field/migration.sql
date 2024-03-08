-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AssetField" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order" INTEGER NOT NULL,
    "helperText" TEXT NOT NULL DEFAULT '',
    "displayOnTable" BOOLEAN NOT NULL DEFAULT false,
    "assetId" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    CONSTRAINT "AssetField_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AssetField_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "Field" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_AssetField" ("assetId", "fieldId", "helperText", "id", "order") SELECT "assetId", "fieldId", "helperText", "id", "order" FROM "AssetField";
DROP TABLE "AssetField";
ALTER TABLE "new_AssetField" RENAME TO "AssetField";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
