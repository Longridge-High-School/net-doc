-- CreateTable
CREATE TABLE "ACL" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ACLEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL,
    "write" BOOLEAN NOT NULL,
    "delete" BOOLEAN NOT NULL,
    "aclId" TEXT NOT NULL,
    CONSTRAINT "ACLEntry_aclId_fkey" FOREIGN KEY ("aclId") REFERENCES "ACL" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
