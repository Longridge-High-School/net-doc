-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "totpSecret" TEXT NOT NULL DEFAULT '',
    "totpPeriod" INTEGER NOT NULL DEFAULT 0,
    "totpDigits" INTEGER NOT NULL DEFAULT 0,
    "totpAlgorithm" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_User" ("email", "id", "name", "passwordHash", "role") SELECT "email", "id", "name", "passwordHash", "role" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
