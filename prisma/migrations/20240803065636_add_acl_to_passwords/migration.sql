-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Password" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "aclId" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Password_aclId_fkey" FOREIGN KEY ("aclId") REFERENCES "ACL" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Password" ("createdAt", "id", "notes", "password", "title", "updatedAt", "username") SELECT "createdAt", "id", "notes", "password", "title", "updatedAt", "username" FROM "Password";
DROP TABLE "Password";
ALTER TABLE "new_Password" RENAME TO "Password";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
