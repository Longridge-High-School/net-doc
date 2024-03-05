-- CreateTable
CREATE TABLE "EntryPassword" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entryId" TEXT NOT NULL,
    "passwordId" TEXT NOT NULL,
    CONSTRAINT "EntryPassword_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "Entry" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EntryPassword_passwordId_fkey" FOREIGN KEY ("passwordId") REFERENCES "Password" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
