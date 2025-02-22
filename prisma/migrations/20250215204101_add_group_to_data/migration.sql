-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "body" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "attachments" TEXT NOT NULL DEFAULT '[]',
    "aclId" TEXT NOT NULL DEFAULT '',
    "groupId" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Document_aclId_fkey" FOREIGN KEY ("aclId") REFERENCES "ACL" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Document_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Document" ("aclId", "attachments", "body", "createdAt", "id", "title", "updatedAt") SELECT "aclId", "attachments", "body", "createdAt", "id", "title", "updatedAt" FROM "Document";
DROP TABLE "Document";
ALTER TABLE "new_Document" RENAME TO "Document";
CREATE TABLE "new_Entry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assetId" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "aclId" TEXT NOT NULL DEFAULT '',
    "groupId" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Entry_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Entry_aclId_fkey" FOREIGN KEY ("aclId") REFERENCES "ACL" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Entry_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Entry" ("aclId", "assetId", "createdAt", "deleted", "id", "updatedAt") SELECT "aclId", "assetId", "createdAt", "deleted", "id", "updatedAt" FROM "Entry";
DROP TABLE "Entry";
ALTER TABLE "new_Entry" RENAME TO "Entry";
CREATE TABLE "new_Password" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "aclId" TEXT NOT NULL DEFAULT '',
    "groupId" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Password_aclId_fkey" FOREIGN KEY ("aclId") REFERENCES "ACL" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Password_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Password" ("aclId", "createdAt", "id", "notes", "password", "title", "updatedAt", "username") SELECT "aclId", "createdAt", "id", "notes", "password", "title", "updatedAt", "username" FROM "Password";
DROP TABLE "Password";
ALTER TABLE "new_Password" RENAME TO "Password";
CREATE TABLE "new_Process" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "body" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "complete" BOOLEAN NOT NULL DEFAULT false,
    "aclId" TEXT NOT NULL DEFAULT '',
    "groupId" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Process_aclId_fkey" FOREIGN KEY ("aclId") REFERENCES "ACL" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Process_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Process" ("aclId", "body", "complete", "createdAt", "id", "title", "updatedAt") SELECT "aclId", "body", "complete", "createdAt", "id", "title", "updatedAt" FROM "Process";
DROP TABLE "Process";
ALTER TABLE "new_Process" RENAME TO "Process";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
