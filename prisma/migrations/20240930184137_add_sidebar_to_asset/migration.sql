-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Asset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "singular" TEXT NOT NULL,
    "plural" TEXT NOT NULL,
    "nameFieldId" TEXT NOT NULL,
    "sortFieldId" TEXT NOT NULL DEFAULT '',
    "sortOrder" TEXT NOT NULL DEFAULT 'ASC',
    "sidebar" BOOLEAN NOT NULL DEFAULT true,
    "aclId" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "Asset_aclId_fkey" FOREIGN KEY ("aclId") REFERENCES "ACL" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Asset" ("aclId", "icon", "id", "name", "nameFieldId", "plural", "singular", "slug", "sortFieldId", "sortOrder") SELECT "aclId", "icon", "id", "name", "nameFieldId", "plural", "singular", "slug", "sortFieldId", "sortOrder" FROM "Asset";
DROP TABLE "Asset";
ALTER TABLE "new_Asset" RENAME TO "Asset";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
